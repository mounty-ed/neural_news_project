from flask import Blueprint, jsonify, request
from firebase_admin import firestore, credentials, initialize_app
import firebase_admin
from datetime import datetime, timezone
import os
from typing import List, Dict, Any
from back_end.extensions.firebase import db

article_bp = Blueprint('article', __name__, url_prefix='/api')

@article_bp.route('/articles', methods=['GET'])
def get_articles():
    """
    Get all articles with pagination
    Query params:
    - date: Filter by specific date (YYYY-MM-DD)
    - limit: Number of articles to return (default 10)
    - offset: Number of articles to skip (default 0)
    """
    try:
        # Get query parameters
        date_filter = request.args.get('date')
        limit = int(request.args.get('limit', 10))
        offset = int(request.args.get('offset', 0))
        
        # Start building the query
        articles_ref = db.collection('articles')
        
        # Add date filter if provided
        if date_filter:
            # Convert date string to datetime for filtering
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                # Filter by publishedAt field (assuming it's stored as timestamp)
                start_of_day = datetime.combine(filter_date, datetime.min.time())
                end_of_day = datetime.combine(filter_date, datetime.max.time())
                
                articles_ref = articles_ref.where('publishedAt', '>=', start_of_day).where('publishedAt', '<', end_of_day)
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Order by publishedAt descending and apply pagination
        articles_ref = articles_ref.order_by('publishedAt', direction=firestore.Query.DESCENDING)
        articles_ref = articles_ref.limit(limit).offset(offset)
        
        # Execute query
        docs = articles_ref.stream()
        
        articles = []
        for doc in docs:
            article_data = doc.to_dict()
            article_data['id'] = doc.id
            
            # Convert Firestore timestamp to ISO string if needed
            if 'publishedAt' in article_data and hasattr(article_data['publishedAt'], 'isoformat'):
                article_data['publishedAt'] = article_data['publishedAt'].isoformat()
            elif 'publishedAt' in article_data and hasattr(article_data['publishedAt'], 'timestamp'):
                article_data['publishedAt'] = datetime.fromtimestamp(
                    article_data['publishedAt'].timestamp()
                ).isoformat()
            
            articles.append(article_data)
        
        return jsonify({
            'success': True,
            'articles': articles,
            'count': len(articles),
            'pagination': {
                'limit': limit,
                'offset': offset,
                'has_more': len(articles) == limit  # Simple check if there might be more
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch articles: {str(e)}'}), 500


@article_bp.route('/articles/<article_id>', methods=['GET'])
def get_article(article_id):
    """
    Get a specific article by ID with its content
    """
    try:
        # Get the main article document
        article_ref = db.collection('articles').document(article_id)
        article_doc = article_ref.get()
        
        if not article_doc.exists:
            return jsonify({'error': 'Article not found'}), 404
        
        article_data = article_doc.to_dict()
        article_data['id'] = article_doc.id
        
        # Convert Firestore timestamp to ISO string if needed
        if 'publishedAt' in article_data and hasattr(article_data['publishedAt'], 'isoformat'):
            article_data['publishedAt'] = article_data['publishedAt'].isoformat()
        elif 'publishedAt' in article_data and hasattr(article_data['publishedAt'], 'timestamp'):
            article_data['publishedAt'] = datetime.fromtimestamp(
                article_data['publishedAt'].timestamp()
            ).isoformat()
        
        # Get the article content from the subcollection
        content_ref = article_ref.collection('content').document('main')
        content_doc = content_ref.get()
        
        if content_doc.exists:
            content_data = content_doc.to_dict()
            # The body field contains the array of content sections
            article_data['content'] = content_data.get('body', [])
        else:
            article_data['content'] = []
        
        return jsonify({
            'success': True,
            'article': article_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch article: {str(e)}'}), 500


@article_bp.route('/articles/by-date', methods=['GET'])
def get_articles_by_date():
    """
    Get articles grouped by date for the newsletter archive
    Returns a summary of article counts per date
    """
    try:
        # Get all articles ordered by date
        articles_ref = db.collection('articles').order_by('publishedAt', direction=firestore.Query.DESCENDING)
        docs = articles_ref.stream()
        
        # Group articles by date
        date_groups = {}
        for doc in docs:
            article_data = doc.to_dict()
            
            # Extract date from publishedAt
            published_at = article_data.get('publishedAt')
            if published_at:
                if hasattr(published_at, 'date'):
                    date_str = published_at.date().isoformat()
                elif hasattr(published_at, 'timestamp'):
                    date_str = datetime.fromtimestamp(published_at.timestamp()).date().isoformat()
                else:
                    # Try to parse as string
                    try:
                        date_str = datetime.fromisoformat(str(published_at)).date().isoformat()
                    except:
                        continue
                
                if date_str not in date_groups:
                    date_groups[date_str] = {
                        'date': date_str,
                        'articleCount': 0,
                        'articles': []
                    }
                
                date_groups[date_str]['articleCount'] += 1
                date_groups[date_str]['articles'].append({
                    'id': doc.id,
                    'title': article_data.get('title', ''),
                    'groundbreaking': article_data.get('groundbreaking', False)
                })
        
        # Convert to list and sort by date
        newsletter_dates = list(date_groups.values())
        newsletter_dates.sort(key=lambda x: x['date'], reverse=True)
        
        return jsonify({
            'success': True,
            'newsletterDates': newsletter_dates
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch articles by date: {str(e)}'}), 500
