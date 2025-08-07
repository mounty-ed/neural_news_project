import json
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional, TypedDict, Literal
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.tools import tool
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv, find_dotenv
from back_end.firestore_utils import create_article, create_newsletter_date
import time

load_dotenv(find_dotenv())

# ========================================== TOOL DEFINITIONS ==========================================

@tool
def web_search(query: str) -> str:
    """
    Search the web for current information about a topic using Tavily.
    Args:
        query: The search query string
    Returns:
        JSON string with search results containing titles, snippets, and URLs
    """
    try:
        from langchain_tavily import TavilySearch
        print("web_search called with query: ", query)

        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            print("TAVILY_API_KEY not found in environment variables")
            raise ValueError
            
        tavily_tool = TavilySearch(
            api_key=api_key,
            search_detph="advanced",
        )
        results = tavily_tool.invoke({"query": query})
        
        return json.dumps(results["results"], indent=2)
        
    except Exception as e:
        print(f"❌ Search error: {e}")
        raise e


# ========================================== PYDANTIC SCHEMAS ==========================================

class ArticleSection(BaseModel):
    heading: str
    content: str = Field(description="Content of the section. At least 300 words")

class GeneratedArticle(BaseModel):
    title: str
    subtitle: str 
    categories: List[Literal["Technology", "Business", "Science", "Entertainment", "Politics"]] = Field(description="List of article categories. Can be a single category.")
    sections: List[ArticleSection]
    sources: List[str] = Field(default=[])
    groundbreaking: bool = Field(description="Only true if the article is extraordinarily novel or impactful.")

# ========================================== STATE DEFINITION ==========================================

class AgentState(TypedDict):
    """State for the article generation agent"""
    topic: Dict
    messages: List[BaseMessage]
    search_count: int
    min_search_count: int
    max_search_count: int
    final_article: Optional[Dict]

# ========================================== REACT AGENT ==========================================

class ArticleAgent:
    """Simple 2-node ReAct Article Agent"""
    
    # The default model can have problems with structured outputs use another model if deployed
    def __init__(self, api_key: str, research_model: str = "qwen3:8b", writing_model: str = "openrouter/horizon-beta"):
        self.research_llm = ChatOllama(
            model=research_model, 
            temperature=0.3
        ).bind_tools([web_search])

        self.structured_llm = ChatOpenAI(
            model=writing_model, 
            temperature=0.3,
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        ).with_structured_output(GeneratedArticle)

        self.tool_node = ToolNode([web_search])
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        def tools_wrapper(state: AgentState):
            # Call the tool node properly and update search count
            result = self.tool_node.invoke(state)
            result["search_count"] = state["search_count"] + 1
            print(f"🔍 web_search used — search_count = {result['search_count']}")
            return result

        workflow.add_node("tools", tools_wrapper)
        workflow.add_node("research", self._research_node)
        workflow.add_node("write", self._write_node)
        
        workflow.set_entry_point("research")
        
        # Conditional edge: tools if tool calls, otherwise end
        workflow.add_conditional_edges(
            "research",
            self._should_continue,
            {
                "tools": "tools",
                "end": "write"
            }
        )
        workflow.add_edge("tools", "research")
        workflow.add_edge("write", END)
        
        return workflow.compile()

    def _research_node(self, state: AgentState):
        """Research node - research and write"""
        
        if len(state["messages"]) == 0:
            system_prompt = f"""
            You are a professional investigative journalist tasked with deeply researching the following topic.

            TOPIC: {state['topic'].get('title', '')}
            SUMMARY: {state['topic'].get('summary', '')}
            CATEGORIES: {', '.join(state['topic'].get('categories', []))}

            RESEARCH INSTRUCTIONS:
            - Use the `web_search` tool for each query, specifying precise, targeted searches.
            - Collect factual data, up-to-date statistics, expert quotes, and credible source URLs.
            - After each search, summarize key findings with a paragraph and list the source URLs.
            - Repeat until you have at least {state['min_search_count']} distinct, high-quality sources.
            - Do not write any full article sections yet—focus exclusively on gathering and organizing research.

            STATE:
            - Searches performed: {state['search_count']} / {state['min_search_count']}

            Begin your research now. Use only `Thought:`, `Action: web_search[query]`, and `Observation:` tags."""

            state["messages"] = [
                SystemMessage(content=system_prompt),
                HumanMessage(content="Start research phase.")
            ]

        # Get response from LLM
        print("Invoking research llm")
        response = self.research_llm.invoke(state["messages"])
        state["messages"].append(response)

        return state
    
    def _should_continue(self, state: AgentState) -> str:
        """Decide whether to continue searching or end"""
        last_message = state["messages"][-1]
            
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "tools"
        
        if state["search_count"] < state["min_search_count"]:
            return "tools"
        
        print("ending tool loop")
        return "end"
    
    def _write_node(self, state: AgentState):
        system_prompt = f"""
        You are a skilled article writer.
        Your task is to write a long-form, high-quality article based on previously researched information. Follow the rules strictly:

        OUTPUT FORMAT:
        - The generated article sections should at least contain 1000 words in total.
        - Do not include any Markdown formatting, raw text, or internal thought process.
        - Return only a fully structured json following this schema:
            {GeneratedArticle.model_json_schema()}
        
        CONTENT INSTRUCTIONS:
        - Write in a journalistic, informative style for a broad audience
        - Use facts, statistics, and real expert quotes when available
        - Ensure content flows logically across sections
        - Use plenty of rich, factual content — each section should be at least 300 words
        - Focus only on writing — do NOT include `Thought:` or `Action:` tags
        """
        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        article = self.structured_llm.invoke(messages)
        state["final_article"] = article.dict()
        return state

    def invoke(self, topic: Dict) -> Optional[Dict]:
        """Create article from topic"""
        try:
            initial_state = {
                "topic": topic,
                "messages": [],
                "final_article": {},
                "search_count": 0,
                "min_search_count": 2,
                "max_search_count": 5,
            }
            result = self.graph.invoke(initial_state)
            return result
            
        except Exception as e:
            print(f"Error: {e}")
            return None
        
    # ========================================== SAVE WORKFLOW IMAGE ==========================================

    def save_workflow_image(self):
        """Save workflow as PNG image"""
        try:
            png_data = self.graph.get_graph().draw_mermaid_png()
            
            with open("article_workflow.png", "wb") as f:
                f.write(png_data)
            
            print("Workflow saved as article_workflow.png")
            
        except Exception as e:
            print(f"Install graphviz: pip install graphviz")


# ========================================== USAGE ==========================================

if __name__ == "__main__":
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise ValueError("Failed to load api key")

    agent = ArticleAgent(api_key=openrouter_api_key)
    agent.save_workflow_image()
    
    topic = {
        "title": "AI in Healthcare Diagnostics",
        "summary": "AI systems achieving breakthrough accuracy in medical diagnosis",
        "categories": ["Technology", "Science"]
    }
    
    article = agent.invoke(topic)
    
    if article:
        print("Messages: ", article["messages"])
        final_article = article["final_article"]
        print("Article: ", final_article)

        article_result = create_article(
            article_id=str(int(time.time())),
            title=final_article.get("title"),
            subtitle=final_article.get("subtitle"),
            categories=final_article.get("categories"),
            content=final_article.get("sections"),
            sources=final_article.get("sources"),
            date=str(datetime.now(timezone.utc).date().isoformat()),
            groundbreaking=final_article.get("groundbreaking", False),
        )
        

        print("Article Creation:", article_result)
    else:
        print("Failed to create article")