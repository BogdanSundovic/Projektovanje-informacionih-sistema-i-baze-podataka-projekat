from uuid import uuid4
from fastapi.testclient import TestClient
from backend.auth_api import app

client = TestClient(app)

def register_and_token(u=None, e=None, p="p"):
    u = u or f"user_{uuid4().hex[:8]}"; e = e or f"{u}@ex.com"
    client.post("/api/register", json={"username": u, "email": e, "password": p})
    tok = client.post("/token", data={"username": u, "password": p}).json()["access_token"]
    return {"Authorization": f"Bearer {tok}"}, u, e

def user_id(headers):
    return client.get("/api/me", headers=headers).json()["id"]

def test_add_and_list_collaborator():
    owner_h, _, _ = register_and_token()
    collab_h, _, collab_email = register_and_token()

    fid = client.post("/api/forms", json={"name":"C","description":None,"is_public":False}, headers=owner_h).json()["id"]
    collab_uid = user_id(collab_h)

    r = client.post(f"/api/forms/{fid}/collaborators",
                    json={"user_id": collab_uid, "role":"editor"},
                    headers=owner_h)
    assert r.status_code in (200,201), r.text

    lst = client.get(f"/api/forms/{fid}/collaborators", headers=owner_h)
    assert lst.status_code == 200
    emails = [c["email"] for c in lst.json()]
    assert collab_email in emails
