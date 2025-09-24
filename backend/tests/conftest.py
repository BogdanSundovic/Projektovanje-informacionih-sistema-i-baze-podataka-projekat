import sys, pathlib, os, pytest
BACKEND_DIR = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ["DATABASE_URL"] = "sqlite:///./test_db.sqlite3"

from models import UserModel
from auth_api import app, get_db
from database import Base
import form_db_circl_fix

engine = create_engine(
    os.environ["DATABASE_URL"],
    connect_args={"check_same_thread": False}
)

@event.listens_for(engine, "connect")
def _fk_on(dbapi_connection, connection_record):
    cur = dbapi_connection.cursor()
    cur.execute("PRAGMA foreign_keys=ON")
    cur.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[form_db_circl_fix.get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def create_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client():
    from fastapi.testclient import TestClient
    return TestClient(app)

@pytest.fixture()
def db():
    s = TestingSessionLocal()
    try:
        yield s
    finally:
        s.close()

@pytest.fixture()
def register_user_and_token(client):
    def _create(username: str, email: str, password: str = "pass123"):
        r = client.post("/api/register", json={"username": username, "email": email, "password": password})
        assert r.status_code == 200, r.text
        return r.json()["access_token"]
    return _create

@pytest.fixture()
def auth_header():
    def _h(token: str):
        return {"Authorization": f"Bearer {token}"}
    return _h

@pytest.fixture
def make_superadmin(db):
    def _make(username: str):
        user = db.query(UserModel).filter(UserModel.username == username).first()
        assert user, f"Korisnik {username} ne postoji u test bazi."
        setattr(user, "is_superadmin", True)
        db.commit()
        return user.id
    return _make