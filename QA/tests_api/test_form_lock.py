from uuid import uuid4
from fastapi.testclient import TestClient
from backend.auth_api import app

client = TestClient(app)

def auth_headers(u=None, e=None, p="p"):
    u = u or f"user_{uuid4().hex[:8]}"; e = e or f"{u}@ex.com"
    client.post("/api/register", json={"username": u, "email": e, "password": p})
    tok = client.post("/token", data={"username": u, "password": p}).json()["access_token"]
    return {"Authorization": f"Bearer {tok}"}

def test_form_lock_blocks_new_answers():
    h = auth_headers()
    fid = client.post("/api/forms", json={"name":"L","description":None,"is_public":True}, headers=h).json()["id"]

    data = {"text":"Q1","type":"short_text","is_required":"true"}
    q = client.post(f"/api/forms/{fid}/questions", data=data, headers=h).json()["id"]

    r = client.put(f"/api/forms/{fid}", json={"is_locked": True}, headers=h)
    assert r.status_code == 200 and r.json().get("is_locked") is True

    payload = {"answers":[{"question_id": q, "answer":"hi"}]}
    s = client.post(f"/api/forms/{fid}/answers", json=payload)
    assert s.status_code == 403
