from datetime import datetime, timezone
from back_end.extensions.firebase import db
from firebase_admin import firestore
from typing import Dict, List, Any, Optional
import re

def increment_newsletter_date():
    """
    Increments the `articleCount` field in a Firestore document
    under newsletter_dates/YYYY-MM-DD. If the document doesn’t exist yet,
    it will be created with articleCount = 1.
    """
    try:
        # Compute today's date string
        now_utc = datetime.now(timezone.utc)
        date_str = now_utc.strftime('%Y-%m-%d')

        # Reference the document
        doc_ref = db.collection('newsletter_dates').document(date_str)

        # Increment articleCount by 1
        doc_ref.set(
            {'articleCount': firestore.Increment(1)},
            merge=True
        )

        return {'success': True}

    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to increment newsletter_dates document: {e}',
        }

def create_newsletter_date():
    """
    Creates a document in Firestore under newsletter_dates/[current_date] with today's date.
    
    Returns:
        dict: Result containing success status and document reference or error
    """
    try:
        # Get current date in ISO format with UTC timezone
        now_utc = datetime.now(timezone.utc)
        current_date = now_utc.isoformat()
        date_str = now_utc.strftime('%Y-%m-%d')
        
        # Create document data
        doc_data = {
            'date': date_str,
            'createdAt': current_date,
            'articleCount': 0,
        }
        
        # Create document reference using date as document ID
        doc_ref = db.collection('newsletter_dates').document(date_str)
        
        # Set the document
        doc_ref.set(doc_data)
        
        return {'success': True,}
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to create newsletter_dates document: {str(e)}',
        }
    

def create_article(article_id: str, title: str, subtitle: str, categories: List[str], date: str,
                            content: Dict, sources: List[str], groundbreaking: bool = False):
    """
    Creates a document in Firestore under articles/[article_id] with the specified fields.
    Also creates a subcollection 'content' with the full article content.
    
    Args:
        article_id (str): Unique identifier for the article
        title (str): Article title
        subtitle (str): Article subtitle/summary
        categories (List[str]): Article category (Technology | Science | Entertainment | Politics | Business)
        sources (List[str]): Article sources
        date (str): Article date in YYYY-MM-DD format
        content (Dict): Full article content. Creates content subcollection.
        groundbreaking (bool, optional): Whether the article is groundbreaking. Defaults to False.
    
    Returns:
        dict: Result containing success status and document reference or error
    """
    try:
        # Validate category
        valid_categories = {'Technology', 'Science', 'Entertainment', 'Politics', 'Business'}
        for category in categories:
            if category not in valid_categories:
                return {
                    'success': False,
                    'error': f'Invalid categories. Must be one of: {", ".join(valid_categories)}'
                }
        
        # Get current UTC timestamp
        now_utc = datetime.now(timezone.utc)
        created_at = now_utc.isoformat()
        
        # Create document data
        doc_data = {
            'title': title,
            'subtitle': subtitle,
            'categories': categories,
            'sources': sources,
            'date': date,
            'readTime': calculate_read_time(content),
            'views': 0,
            'createdAt': created_at,
            'groundbreaking': groundbreaking
        }
        
        # Create document reference using article_id as document ID
        doc_ref = db.collection('articles').document(article_id)
        
        # Set the document
        doc_ref.set(doc_data)

        # Create content subcollection if content is provided
        content_data = {
            'body': content,
        }
        content_ref = doc_ref.collection('content').document('main')
        content_ref.set(content_data)

        increment_newsletter_date()

        return {
            'success': True,
            'article_id': article_id,
            'document_ref': doc_ref
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to create article document: {str(e)}',
        }


def calculate_read_time(
    sections: List[Dict],
    words_per_minute: int = 200
) -> int:
    """
    Estimate reading time in **seconds** for a list of sections.
    
    Args:
        sections: List of dicts with structure [{'heading': '...', 'content': '...'}, ...]
        words_per_minute: Average reading speed (default 200 wpm).
        
    Returns:
        Estimated read time, rounded up to nearest minute in seconds,
        with a minimum of 60 seconds.
    """
    # Count total words across all sections
    total_words = sum(
        len(re.findall(r'\w+', section['content']))
        for section in sections
        if isinstance(section, dict) and 'content' in section
    )
    
    # Compute minutes
    minutes = total_words / words_per_minute if total_words > 0 else 1
    seconds = int(minutes * 60)
    # Always at least one minute (60 seconds)
    return max(seconds, 60)


# Example usage:
if __name__ == "__main__":
    # Create a newsletter_dates document for today
    newsletter_result = create_newsletter_date()
    print("Newsletter Date Creation:", newsletter_result)
    
    # Create an example article document
    article_result = create_article(
        article_id="202sgwsgegeg5-08gdfsgdshwrhrw-04",
        title="Revolutionary AI Model Breaks New Ground",
        subtitle="Scientists have developed a groundbreaking AI model that demonstrates unprecedented capabilities in natural language understanding.",
        categories=["Technology"],
        groundbreaking=True,
        sources=["idk.com"],
        date="2025-08-04",
        content={}
    )
    print("Article Creation:", article_result)

    