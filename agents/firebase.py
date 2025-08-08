import firebase_admin
from firebase_admin import credentials, firestore
import os

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
cred_path = os.path.join(base_dir, 'firebase-service-account.json')

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
