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
    

def create_article(article_id: str, title: str, excerpt: str, categories: List[str], date: str,
                            content: str, groundbreaking: bool = False):
    """
    Creates a document in Firestore under articles/[article_id] with the specified fields.
    Also creates a subcollection 'content' with the full article content.
    
    Args:
        article_id (str): Unique identifier for the article
        title (str): Article title
        excerpt (str): Article excerpt/summary
        category (str): Article category (Technology | Science | Entertainment | Politics)
        date (str): Article date in YYYY-MM-DD format
        content (str): Full article content. Creates content subcollection.
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
            'excerpt': excerpt,
            'categories': categories,
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

def calculate_read_time(content: str, words_per_minute: int = 200) -> int:
    """
    Calculate estimated read time in seconds based on content length.
    
    Args:
        content (str): The article content
        words_per_minute (int): Average reading speed. Defaults to 200 WPM.
    
    Returns:
        int: Estimated read time in seconds
    """
    if not content:
        return 0
    
    # Count words (split by whitespace and filter out empty strings)
    word_count = len([word for word in content.split() if word.strip()])
    
    # Calculate minutes and convert to seconds
    read_time_minutes = word_count / words_per_minute
    read_time_seconds = int(read_time_minutes * 60)
    
    # Minimum read time of 60 seconds
    return max(read_time_seconds, 60)
    

# Example usage:
if __name__ == "__main__":
    # Create a newsletter_dates document for today
    newsletter_result = create_newsletter_date_document()
    print("Newsletter Date Creation:", newsletter_result)
    
    # Create an example article document
    article_result = create_article(
        article_id="2025-08-04-sigma sigma boy",
        title="Revolutionary AI Model Breaks New Ground",
        excerpt="Scientists have developed a groundbreaking AI model that demonstrates unprecedented capabilities in natural language understanding.",
        categories=["Technology"],
        groundbreaking=True,
        date="2025-08-04",
        content="The ohio sigma starts rizzing up the gyatt in front of the level 10 rizzler gyatt ohio."
    )
    print("Article Creation:", article_result)

    