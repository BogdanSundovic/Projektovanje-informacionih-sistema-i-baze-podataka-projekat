import os, sys, pytest
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

for cand in ("QA/.env.test", "qa/.env.test", ".env.test"):
    p = ROOT / cand
    if p.exists():
        load_dotenv(p, override=True)
        break

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://postgres:admin123@localhost:5432/baze2_db_test",
)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("SECRET_KEY", "testing-secret")

import backend.database as dbmod

test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)

dbmod.engine = test_engine
dbmod.SessionLocal = TestingSessionLocal

import backend.models  
from backend.auth_api import app
from backend import auth_api as authmod

@pytest.fixture(scope="session", autouse=True)
def _create_schema():
    try:
        dbmod.Base.metadata.drop_all(bind=test_engine)
    except Exception:
        pass
    dbmod.Base.metadata.create_all(bind=test_engine)

    insp = inspect(test_engine)
    print("TEST DB URL ->", TEST_DATABASE_URL)
    print("TEST TABLES ->", sorted(insp.get_table_names()))
    assert "users" in insp.get_table_names(), "Tabela 'users' nije kreirana!"

    yield
    try:
        dbmod.Base.metadata.drop_all(bind=test_engine)
    except Exception:
        pass

def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

if hasattr(authmod, "get_db"):
    app.dependency_overrides[authmod.get_db] = _override_get_db

@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c
