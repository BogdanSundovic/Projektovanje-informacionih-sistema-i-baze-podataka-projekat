from uuid import uuid4
from fastapi.testclient import TestClient
from backend.auth_api import app

client = TestClient(app)

def auth_headers(u=None, e=None, p="p"):
    """Registruje korisnika i vraća Authorization header."""
    u = u or f"user_{uuid4().hex[:8]}"
    e = e or f"{u}@ex.com"
    client.post("/api/register", json={"username": u, "email": e, "password": p})
    tok = client.post("/token", data={"username": u, "password": p}).json()["access_token"]
    return {"Authorization": f"Bearer {tok}"}

def test_forms_crud_happy_path():
    h = auth_headers()

    payload = {"name": "QA Forma", "description": "Opis", "is_public": True}
    r = client.post("/api/forms", json=payload, headers=h)
    assert r.status_code == 200, r.text
    form_id = r.json()["id"]

    r = client.get("/api/forms/public")
    assert r.status_code == 200
    pubs = r.json()
    assert any(f["id"] == form_id for f in pubs)

    r = client.get("/api/forms/owned", headers=h)
    assert r.status_code == 200
    owned = r.json()
    assert any(f["id"] == form_id for f in owned)

    r = client.get(f"/api/forms/{form_id}")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "QA Forma"
    assert body["is_public"] is True
    assert isinstance(body["questions"], list)

    upd = {"name": "QA Forma 2", "description": "Novi opis", "is_public": False}
    r = client.put(f"/api/forms/{form_id}", json=upd, headers=h)
    assert r.status_code == 200
    updated = r.json()
    assert updated["name"] == "QA Forma 2"
    assert updated["description"] == "Novi opis"
    assert updated["is_public"] is False

    r = client.delete(f"/api/forms/{form_id}", headers=h)
    assert r.status_code == 200

    r = client.get(f"/api/forms/{form_id}")
    assert r.status_code == 404

def test_cannot_modify_or_delete_someone_elses_form():
    owner_h = auth_headers("ownerqa", "ownerqa@ex.com")
    other_h = auth_headers("otherqa", "otherqa@ex.com")

    fid = client.post(
        "/api/forms",
        json={"name": "Private QA", "description": None, "is_public": False},
        headers=owner_h
    ).json()["id"]

    r = client.put(f"/api/forms/{fid}", json={"name": "Hacked"}, headers=other_h)
    assert r.status_code == 403, r.text

    r = client.delete(f"/api/forms/{fid}", headers=other_h)
    assert r.status_code == 403, r.text
