import os
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

import sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # QA/..
sys.path.insert(0, ROOT)


load_dotenv("QA/.env.test")
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:admin123@localhost/baze2_db_test")
os.environ.setdefault("SECRET_KEY", "testing-secret")

from backend.auth_api import app  

from backend.database import Base, engine, SessionLocal  

try:
    from backend.auth_api import get_db 
    HAVE_GET_DB = True
except Exception:
    HAVE_GET_DB = False

def _override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if not HAVE_GET_DB:
    try:
        app.dependency_overrides[get_db] = _override_get_db  
    except Exception:
        pass

@pytest.fixture(scope="session", autouse=True)
def _create_schema():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client():
    return TestClient(app)
