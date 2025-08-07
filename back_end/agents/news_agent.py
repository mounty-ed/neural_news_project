from langgraph.graph import StateGraph, END
from typing import Dict, List, Optional, TypedDict
from langgraph.prebuilt import ToolNode
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage
from langchain_openai import ChatOpenAI
import feedparser
from datetime import datetime, timedelta, timezone
import json, os, time
from pydantic import BaseModel, Field
from typing import List, Literal
from back_end.agents.article_agent import ArticleAgent
from back_end.firestore_utils import create_article, create_newsletter_date
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# State definition for the agent
class NewsAgentState(TypedDict):
    rss_data: Optional[Dict]
    topics: Optional[List[Dict]]
    generated_articles: Optional[List[Dict]]
    messages: Optional[List[BaseMessage]]

    quality_scores: Optional[Dict]
    iteration_count: int
    max_iterations: int

# Pydantic schemas
class Topic(BaseModel):
    """A single news topic with structured information"""
    title: str = Field(description="Compelling and newsworthy title for the topic")
    summary: str = Field(description="Detailed 2-3 sentence summary of what the topic covers and why it's important")
    categories: List[Literal["Technology", "Business", "Science", "Entertainment", "Politics"]] = Field(
        description="List of relevant categories from the allowed set"
    )

class TopicsResponse(BaseModel):
    """Collection of trending news topics"""
    topics: List[Topic] = Field(description="List of 1-3 trending topics identified from the RSS feeds")
    

# ========================================== LANGGRAPH CLASS ==========================================

class NewsGenerationAgent:
    """LangGraph agent for automated news article generation"""

    # ========================================== INITIALIZATION ==========================================

    # The default model can have problems with structured outputs use another model if deployed
    def __init__(self, api_key: str, model: str = "openrouter/horizon-beta"):
        """Updated initialization with ReAct agent setup"""
        
        self.api_key = api_key

        # Topic analysis LLM (structured output)
        self.llm = ChatOpenAI(
            model=model, 
            temperature=0.3,
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        ).with_structured_output(TopicsResponse)
        
        # Build the graph
        self.graph = self._build_graph()

    def _build_graph(self):
        """Build the LangGraph workflow"""
        workflow = StateGraph(NewsAgentState)
        
        # Add nodes
        workflow.add_node("data_collection", self.data_collection_node)
        workflow.add_node("prepare_topics", self.prepare_topics_node)
        workflow.add_node("article_generation", self.article_generation_node)

        
        # Define the workflow edges
        workflow.set_entry_point("data_collection")
        
        # Conditional edge: if needs more data, go back to data collection
        workflow.add_edge("data_collection", "prepare_topics")
        workflow.add_edge("prepare_topics", "article_generation")
        workflow.add_edge("article_generation", END)
                
        return workflow.compile()
    

    # ========================================== NODE DEFINITIONS ==========================================
    
    def data_collection_node(self, state: NewsAgentState) -> NewsAgentState:
        """
        Node 1: Data Collection
        Collects raw data from RSS feeds only
        """
        print("🔍 Executing Data Collection Node")
        
        # Initialize data collection containers
        collected_data = {
            "rss_feeds": [],
            "collection_timestamp": datetime.now().isoformat(),
            "total_sources": 0
        }
        
        # Load news sources from JSON file
        try:
            with open('back_end/sources.json', 'r') as f:
                news_sources = json.load(f)
        except Exception as e:
            print("Error loading json: ", e)
            state["rss_data"] = collected_data
            return state
        
        print(f"    📡 Collecting from RSS feeds...")
        
        # Collect from RSS feeds
        for source_name, source_info in news_sources.items():
            try:
                print(f"        📰 Fetching RSS from {source_name}...")
                
                # Parse RSS feed
                feed = feedparser.parse(source_info["rss"])
                
                # Process recent entries (last 48 hours)
                cutoff_time = datetime.now() - timedelta(hours=48)
                
                for entry in feed.entries[:20]:  # Limit to 20 most recent
                    try:
                        # Parse publication date
                        pub_date = None
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            pub_date = datetime(*entry.published_parsed[:6])
                        elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                            pub_date = datetime(*entry.updated_parsed[:6])
                        
                        # Skip if too old
                        if pub_date and pub_date < cutoff_time:
                            continue
                        
                        # Extract content
                        summary = getattr(entry, 'summary', '')
                        if hasattr(entry, 'content') and entry.content:
                            summary = entry.content[0].value if entry.content else summary
                        
                        article_data = {
                            "title": entry.title,
                            "link": entry.link,
                            "summary": summary,
                            "source": source_name,
                            "category": source_info["category"],
                            "published_date": pub_date.isoformat() if pub_date else datetime.now().isoformat(),
                            "tags": getattr(entry, 'tags', []),
                            "word_count": len(summary.split()) if summary else 0
                        }
                        
                        collected_data["rss_feeds"].append(article_data)
                        
                    except Exception as e:
                        print(f"    ⚠️ Error processing entry from {source_name}: {e}")
                        continue
                        
            except Exception as e:
                print(f"  ❌ Error fetching RSS from {source_name}: {e}")
                continue
        
        # Calculate totals
        collected_data["total_sources"] = len(collected_data["rss_feeds"])
        
        print(f"    ✅ Data collection complete:")
        print(f"        📰 RSS articles: {len(collected_data['rss_feeds'])}")
        print(f"        📊 Total items: {collected_data['total_sources']}")
        
        # Store in state
        state["rss_data"] = collected_data
        
        return state

    def prepare_topics_node(self, state: NewsAgentState) -> NewsAgentState:
        """
        Node 2: Prepare Topics
        Determines what articles to create and what topics to focus on using LLM analysis.
        """
        print("📊 Executing Prepare Topics Node")
        
        # Get RSS data from state
        rss_data = state.get("rss_data", {})
        articles = rss_data.get("rss_feeds", [])
        
        if not articles:
            print("    ⚠️ No RSS data available, using default topics")
            topics = [{
                "summary": "No RSS data available for analysis",
                "categories": ["Technology"]
            }]
            state["topics"] = topics
            return state
        
        # Prepare article summaries for LLM analysis
        article_summaries = []
        for article in articles[:30]:  # Limit to 30 articles to avoid token limits
            summary_text = f"Title: {article.get('title', '')}\n"
            summary_text += f"Summary: {article.get('summary', '')[:200]}...\n"
            summary_text += f"Category: {article.get('category', '')}\n"
            summary_text += f"Source: {article.get('source', '')}\n"
            article_summaries.append(summary_text)
        
        # Create prompt for LLM
        articles_text = "\n---\n".join(article_summaries)
        
        prompt = f"""
        Analyze the following news articles and identify 1-3 key trending topics that would make compelling news stories.
        
        RSS ARTICLES:
        {articles_text}
        
        Based on these articles, generate topics that:
        1. Combine related stories into broader themes
        2. Represent current trends and important developments
        3. Would be interesting to readers
        4. Can be categorized into the allowed categories
        
        For each topic, provide:
        - A lengthy and concise summary (5-7 sentences) of what the topic covers. Give context of the date and location of topics if possible.
        - Relevant categories from this list ONLY: ["Technology", "Business", "Science", "Entertainment", "Politics"]
        
        Respond ONLY in JSON format like this. No extra explanations or comments:
        {TopicsResponse.model_json_schema()}
        
        Make sure categories are EXACTLY from the allowed list. Generate 1-3 topics total.
        """
        
        try:
            print("    🤖 Analyzing RSS data with LLM...")
            response = self.llm.invoke(prompt)
            
            # The response is already a TopicsResponse object, no need to parse JSON
            topics = []
            for topic in response.topics:
                topics.append({
                    "title": topic.title,
                    "summary": topic.summary,
                    "categories": topic.categories
                })
            
            if topics:
                print(f"    ✅ Generated {len(topics)} topics from RSS analysis")
                for i, topic in enumerate(topics, 1):
                    print(f"        {i}. {topic['categories']}: {topic['title']} - {topic['summary'][:80]}...")
            else:
                raise ValueError("No topics generated from structured output")
                
        except Exception as e:
            print(f"    ⚠️ Error generating topics with LLM: {e}")
            raise Exception("Error generating topics with LLM")

        
        state["topics"] = topics
        return state
    
    def article_generation_node(self, state: NewsAgentState) -> NewsAgentState:
        """
        Node 3: Article Generation with ReAct Web Search
        Generates articles for selected categories
        """
        print("✍️ Executing Article Generation Node")
        
        try:
            article_agent = ArticleAgent(api_key=self.api_key)

            create_newsletter_date()

            for topic in state["topics"]:
                article = article_agent.invoke(topic)
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

                print("Article Creation: ", article_result)
        except Exception as e:
            print(f"    ⚠️ Error generating articles with ArticleAgent: {e}")
            raise Exception("Error generating articles with ArticleAgent")
        
        return state



    # ========================================== HELPER METHODS ==========================================

    
    def run(self, initial_state: Optional[NewsAgentState] = None) -> NewsAgentState:
        """Execute the complete news generation workflow"""
        if initial_state is None:
            initial_state = NewsAgentState()
        
        print("🚀 Starting News Article Generation Agent")
        result = self.graph.invoke(initial_state)
        print("✅ News Generation Complete")
        
        return result
    

    # ========================================== SAVE WORKFLOW IMAGE ==========================================

    def save_workflow_image(self):
        """Save workflow as PNG image"""
        try:
            png_data = self.graph.get_graph().draw_mermaid_png()
            
            with open("news_workflow.png", "wb") as f:
                f.write(png_data)
            
            print("Workflow saved as news_workflow.png")
            
        except Exception as e:
            print(f"Install graphviz: pip install graphviz")

# Usage example
if __name__ == "__main__":
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise ValueError("Failed to load api key")

    agent = NewsGenerationAgent(api_key=openrouter_api_key)
    agent.save_workflow_image()
    
    # Run the agent
    result = agent.run()
    print(f"Result Topics: {result.get("topics")}")