from flask import Flask
from flask_cors import CORS
from back_end.config import Config
from back_end.routes.news import news_bp

def create_app():
    app = Flask(__name__)
    
    CORS(app, origins=["http://localhost:3000"])

    app.config.from_object(Config)
    
    app.register_blueprint(news_bp, url_prefix="/api")

    return app