import pytest
from uuid import uuid4


def _new_user():
    """Generiši unikatne kredencijale po testu."""
    u = f"u_{uuid4().hex[:8]}"
    e = f"{u}@ex.com"
    p = "pass123"
    return {"username": u, "email": e, "password": p}

def _register(client, data=None):
    data = data or _new_user()
    r = client.post("/api/register", json=data)
    return r, data

def _token_by_username(client, username, password):
    return client.post("/token", data={"username": username, "password": password})

def _token_by_email_via_api_login(client, email, password):
    return client.post("/api/login", json={"identifier": email, "password": password})

def test_create_user_and_login_by_username(client):
  
    r, u = _register(client)
    assert r.status_code == 200, r.text
    assert "access_token" in r.json()

    tok = _token_by_username(client, u["username"], u["password"])
    assert tok.status_code == 200, tok.text
    access = tok.json()["access_token"]
    assert isinstance(access, str) and access

    me = client.get("/me", headers={"Authorization": f"Bearer {access}"})
    assert me.status_code == 200, me.text
    body = me.json()
    assert body["username"] == u["username"]
    assert body["email"] == u["email"]

def test_login_by_email_via_api_login(client):
    r, u = _register(client)
    assert r.status_code == 200, r.text

    tok = _token_by_email_via_api_login(client, u["email"], u["password"])
    assert tok.status_code == 200, tok.text
    assert "access_token" in tok.json()

def test_get_users_contains_registered_user(client):
    r, u = _register(client)
    assert r.status_code == 200, r.text

    tok = client.post("/token", data={"username": u["username"], "password": u["password"]}).json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}

    users = client.get("/api/users", headers=h)
    assert users.status_code == 200, users.text
    lst = users.json()
    assert any(item.get("email") == u["email"] for item in lst)

def test_register_duplicate_username_fails(client):
    r, u = _register(client)
    assert r.status_code == 200, r.text

    dup = {"username": u["username"], "email": f"new_{u['email']}", "password": "x"}
    r2 = client.post("/api/register", json=dup)
    assert r2.status_code in (400, 409), r2.text  
    assert "Username" in r2.json().get("detail", "") or r2.status_code == 409

def test_register_duplicate_email_fails(client):
    r, u = _register(client)
    assert r.status_code == 200, r.text

    dup = {"username": f"new_{u['username']}", "email": u["email"], "password": "x"}
    r2 = client.post("/api/register", json=dup)
    assert r2.status_code in (400, 409), r2.text
    assert "Email" in r2.json().get("detail", "") or r2.status_code == 409


def test_update_and_delete_self(client):
    u = {"username":"qauser","email":"qa@ex.com","password":"p"}
    assert client.post("/api/register", json=u).status_code == 200
    tok = client.post("/token", data={"username": u["username"], "password": u["password"]}).json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}
    me = client.get("/api/me", headers=h).json(); uid = me["id"]

    new_email = "qa_new@ex.com"
    up = client.put(f"/api/users/{uid}", json={"email": new_email}, headers=h)
    assert up.status_code == 200 and up.json()["email"] == new_email

    de = client.delete(f"/api/users/{uid}", headers=h)
    assert de.status_code in (200, 204)