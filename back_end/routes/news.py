from flask import Blueprint, jsonify, request
from firebase_admin import firestore, credentials, initialize_app
import firebase_admin
from datetime import datetime, timezone
import os
from typing import List, Dict, Any
from back_end.extensions.firebase import db

news_bp = Blueprint('news', __name__, url_prefix='/api')

@news_bp.route('/news', methods=['GET'])
def get_newsletter_dates():
    """
    Get all available newsletter dates with article counts
    Returns: List of objects with date and count fields
    """
    try:
        # Get all documents from the news collection
        newsletter_dates_ref = db.collection('newsletter_dates')
        docs = newsletter_dates_ref.order_by('date', direction=firestore.Query.DESCENDING).stream()
        
        newsletter_dates = []
        for doc in docs:
            doc_data = doc.to_dict()
            newsletter_dates.append(doc_data)
        
        
        return jsonify(newsletter_dates), 200
        
    except Exception as e:
        print(f"Error fetching newsletter dates: {str(e)}")
        return jsonify({'error': 'Failed to fetch newsletter dates'}), 500


@news_bp.route('/news/<date>', methods=['GET'])
def get_news_by_date(date: str):
    """
    Get news articles for a specific date
    Returns articles matching the new document structure
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Query articles for this date
        articles_ref = db.collection('articles')
        query = articles_ref.where('date', '==', date)
        
        docs = query.stream()
        
        articles = []
        for doc in docs:
            article_data = doc.to_dict()
            article_data['id'] = doc.id
            articles.append(article_data)
        
        return jsonify(articles), 200
        
    except Exception as e:
        print(f"Error fetching news for date {date}: {str(e)}")
        return jsonify({'error': f'Failed to fetch news for date {date}'}), 500

