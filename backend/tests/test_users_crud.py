def test_register_and_me_and_list(client, register_user_and_token, auth_header):
    token = register_user_and_token("pera", "pera@example.com")
   
    r = client.get("/api/me", headers=auth_header(token))
    assert r.status_code == 200
    me = r.json()
    assert me["username"] == "pera"
    assert me["email"] == "pera@example.com"

    r2 = client.get("/api/users", headers=auth_header(token))
    assert r2.status_code == 200
    users = r2.json()
    assert any(u["username"] == "pera" for u in users)

def test_login_via_token(client, register_user_and_token, auth_header):
    _ = register_user_and_token("mika", "mika@example.com", "lozinka")
    r = client.post("/token", data={"username": "mika", "password": "lozinka"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and data["token_type"] == "bearer"

def test_update_user_then_login_with_new_creds(client, register_user_and_token, auth_header):
    token = register_user_and_token("zika", "zika@example.com", "stara")
    me = client.get("/api/me", headers=auth_header(token)).json()
    user_id = me.get("id", 1)  

    r = client.put(f"/api/users/{user_id}", json={
        "username": "zika2",
        "email": "zika2@example.com",
        "password": "nova"
    }, headers=auth_header(token))
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["username"] == "zika2"
    assert body["email"] == "zika2@example.com"

    bad = client.post("/token", data={"username": "zika2", "password": "stara"})
    assert bad.status_code == 401

    good = client.post("/token", data={"username": "zika2", "password": "nova"})
    assert good.status_code == 200
    assert "access_token" in good.json()


def test_delete_user_self(client, register_user_and_token, auth_header):
    token = register_user_and_token("tata", "tata@example.com", "tajna")
    me = client.get("/api/me", headers=auth_header(token)).json()
    user_id = me.get("id", 1)

    r = client.delete(f"/api/users/{user_id}", headers=auth_header(token))
    assert r.status_code == 204

    r2 = client.get("/api/me", headers=auth_header(token))
    assert r2.status_code == 401

    bad = client.post("/token", data={"username": "tata", "password": "tajna"})
    assert bad.status_code == 401

def _get_user_id_by_username(client, token, username, auth_header):
    users = client.get("/api/users", headers=auth_header(token)).json()
    return next(u["id"] for u in users if u["username"] == username)

def test_cannot_update_or_delete_other_user(client, register_user_and_token, auth_header):
    t1 = register_user_and_token("u1", "u1@example.com", "p1")
    t2 = register_user_and_token("u2", "u2@example.com", "p2")
    u2_id = _get_user_id_by_username(client, t2, "u2", auth_header)

    r = client.put(f"/api/users/{u2_id}", json={"username": "hakovano"}, headers=auth_header(t1))
    assert r.status_code == 403

    r = client.delete(f"/api/users/{u2_id}", headers=auth_header(t1))
    assert r.status_code == 403

def test_update_conflicts_duplicate_username_email(client, register_user_and_token, auth_header):
    t1 = register_user_and_token("a1", "a1@example.com", "x")
    t2 = register_user_and_token("a2", "a2@example.com", "x")
    a1_id = _get_user_id_by_username(client, t1, "a1", auth_header)

    r = client.put(f"/api/users/{a1_id}", json={"username": "a2"}, headers=auth_header(t1))
    assert r.status_code == 400

    r = client.put(f"/api/users/{a1_id}", json={"email": "a2@example.com"}, headers=auth_header(t1))
    assert r.status_code == 400

