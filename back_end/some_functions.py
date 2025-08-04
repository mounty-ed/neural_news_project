from datetime import datetime, timezone
from back_end.extensions.firebase import db
from firebase_admin import firestore
from typing import Dict, List, Any, Optional

def create_newsletter_date_document():
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
            'articleCount': 1,
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
    

def create_article_document(article_id: str, title: str, excerpt: str, category: str, date: str,
                          read_time: int, views: int = 0, groundbreaking: bool = False):
    """
    Creates a document in Firestore under articles/[article_id] with the specified fields.
    
    Args:
        article_id (str): Unique identifier for the article
        title (str): Article title
        excerpt (str): Article excerpt/summary
        category (str): Article category (Technology | Science | Entertainment | Politics)
        date (str): Article date in YYYY-MM-DD format
        read_time (int): Estimated read time in seconds
        views (int, optional): Number of views. Defaults to 0.
        groundbreaking (bool, optional): Whether the article is groundbreaking. Defaults to False.
    
    Returns:
        dict: Result containing success status and document reference or error
    """
    try:
        # Validate category
        valid_categories = {'Technology', 'Science', 'Entertainment', 'Politics'}
        if category not in valid_categories:
            return {
                'success': False,
                'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'
            }
        
        # Get current UTC timestamp
        now_utc = datetime.now(timezone.utc)
        created_at = now_utc.isoformat()
        
        # Create document data
        doc_data = {
            'title': title,
            'excerpt': excerpt,
            'category': category,
            'date': date,
            'readTime': read_time,
            'views': views,
            'createdAt': created_at,
            'groundbreaking': groundbreaking
        }
        
        # Create document reference using article_id as document ID
        doc_ref = db.collection('articles').document(article_id)
        
        # Set the document
        doc_ref.set(doc_data)
        
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

    

# Example usage:
if __name__ == "__main__":
    # Create a newsletter_dates document for today
    newsletter_result = create_newsletter_date_document()
    print("Newsletter Date Creation:", newsletter_result)
    
    # Create an example article document
    article_result = create_article_document(
        article_id="2025-08-04-sigma sigma boy",
        title="Revolutionary AI Model Breaks New Ground",
        excerpt="Scientists have developed a groundbreaking AI model that demonstrates unprecedented capabilities in natural language understanding.",
        category="Technology",
        read_time=180,
        groundbreaking=True,
        date="2025-08-04"
    )
    print("Article Creation:", article_result)

    