from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Union
from back_end.extensions.firebase import db

article_bp = Blueprint('article', __name__, url_prefix='/api')

@article_bp.route('/articles/<article_id>', methods=['GET'])
def get_article(article_id: str):
    """
    Get a specific article by ID with its content
    """
    try:
        # Get the main article document
        article_ref = db.collection('articles').document(article_id)
        article_doc = article_ref.get()
        
        if not article_doc.exists:
            return jsonify({'error': 'Article not found'}), 404
        
        article_data: Dict[str, Any] = article_doc.to_dict()
        article_data['id'] = article_doc.id
        
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


