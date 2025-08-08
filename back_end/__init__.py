from flask import Flask
from flask_cors import CORS
from back_end.routes.news import news_bp
from back_end.routes.article import article_bp
import os

def create_app():
    app = Flask(__name__)

    origins = os.getenv('CORS_ORIGINS', '')
    
    CORS(app, origins=[origins])

    app.register_blueprint(news_bp, url_prefix="/api")
    app.register_blueprint(article_bp, url_prefix="/api")

    return app