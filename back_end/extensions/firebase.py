import firebase_admin
from firebase_admin import credentials, firestore
import os

# base_dir is the back_end folder
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Candidate locations (check them in order)
candidates = [
    # dev: repo-local path you already have
    os.path.join(base_dir, "etc", "secrets", "firebase-service-account.json"),
    # common absolute path used by Render secret files
    "/etc/secrets/firebase-service-account.json",
    # Allow explicit override via env var (recommended)
    os.environ.get("FIREBASE_CREDENTIALS_PATH"),
    # Google standard env var (some libs use this)
    os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"),
]

# Filter out None and keep unique values
seen = set()
paths_to_try = []
for p in candidates:
    if not p:
        continue
    if p in seen:
        continue
    seen.add(p)
    paths_to_try.append(p)

# Find first existing file
cred_path = None
for p in paths_to_try:
    if os.path.isfile(p):
        cred_path = p
        break

if not cred_path:
    tried = "\n".join(paths_to_try)
    raise FileNotFoundError(
        "Firebase service account JSON not found. Tried:\n" + tried +
        "\n\nOn Render upload the file under Service → Environment → Secret Files (filename: firebase-service-account.json), "
        "or set FIREBASE_CREDENTIALS_PATH to the secret path."
    )

# Initialize firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
