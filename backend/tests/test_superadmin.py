import uuid

def _uniq(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:6]}"

def _get_user_id_by_username_as_admin(client, admin_token, username, auth_header):
    r = client.get("/api/users", headers=auth_header(admin_token))
    assert r.status_code == 200, r.text
    users = r.json()
    return next(u["id"] for u in users if u["username"] == username)

def test_superadmin_can_update_other_user(client, register_user_and_token, auth_header, make_superadmin):
    admin_u = _uniq("boss"); admin_e = f"{admin_u}@example.com"
    admin_token = register_user_and_token(admin_u, admin_e, "pw")
    make_superadmin(admin_u)

    target_u = _uniq("peon"); target_e = f"{target_u}@example.com"
    _ = register_user_and_token(target_u, target_e, "pw")

    target_id = _get_user_id_by_username_as_admin(client, admin_token, target_u, auth_header)

    r = client.put(
        f"/api/users/{target_id}",
        json={"username": target_u + "2", "email": f"{target_u}2@example.com"},
        headers=auth_header(admin_token),
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["username"] == target_u + "2"
    assert body["email"] == f"{target_u}2@example.com"

def test_superadmin_can_delete_other_user(client, register_user_and_token, auth_header, make_superadmin):
    admin_u = _uniq("gaffer"); admin_e = f"{admin_u}@example.com"
    admin_token = register_user_and_token(admin_u, admin_e, "pw")
    make_superadmin(admin_u)

    victim_u = _uniq("victim"); victim_e = f"{victim_u}@example.com"
    _ = register_user_and_token(victim_u, victim_e, "pw")
    victim_id = _get_user_id_by_username_as_admin(client, admin_token, victim_u, auth_header)

    r = client.delete(f"/api/users/{victim_id}", headers=auth_header(admin_token))
    assert r.status_code == 204

def test_superadmin_can_view_and_edit_private_form(client, register_user_and_token, auth_header, make_superadmin):
    owner_u = _uniq("saown"); owner_e = f"{owner_u}@example.com"
    owner_token = register_user_and_token(owner_u, owner_e, "pw")

    r = client.post("/api/forms", json={"name": "Privatna", "description": "", "is_public": False},
                    headers=auth_header(owner_token))
    assert r.status_code == 200
    form_id = r.json()["id"]

    admin_u = _uniq("admin2"); admin_e = f"{admin_u}@example.com"
    admin_token = register_user_and_token(admin_u, admin_e, "pw")
    make_superadmin(admin_u)

    r = client.get(f"/api/forms/{form_id}", headers=auth_header(admin_token))
    assert r.status_code == 200

    r = client.put(f"/api/forms/{form_id}",
                   json={"name": "Privatna (edit by admin)"},
                   headers=auth_header(admin_token))
    assert r.status_code == 200
    assert r.json()["name"] == "Privatna (edit by admin)"

def test_superadmin_can_manage_collaborators(client, register_user_and_token, auth_header, make_superadmin):
    owner_u = _uniq("o1"); owner_e = f"{owner_u}@example.com"
    owner_token = register_user_and_token(owner_u, owner_e, "pw")

    r = client.post("/api/forms", json={"name": "F", "description": "", "is_public": True},
                    headers=auth_header(owner_token))
    assert r.status_code == 200, r.text
    form_id = r.json()["id"]

    col_u = _uniq("col"); col_e = f"{col_u}@example.com"
    _ = register_user_and_token(col_u, col_e, "pw")

    admin_u = _uniq("root"); admin_e = f"{admin_u}@example.com"
    admin_token = register_user_and_token(admin_u, admin_e, "pw")
    make_superadmin(admin_u)

    users = client.get("/api/users", headers=auth_header(admin_token)).json()
    col_id = next(u["id"] for u in users if u["username"] == col_u)

    add = client.post(
        f"/api/forms/{form_id}/collaborators",
        json={"user_id": col_id, "role": "editor"},
        headers=auth_header(admin_token),
    )
    assert add.status_code in (200, 201), add.text

    lst = client.get(f"/api/forms/{form_id}/collaborators", headers=auth_header(admin_token))
    assert lst.status_code == 200
    collabs = lst.json()
    assert any(c.get("user", {}).get("id") == col_id or c.get("user_id") == col_id for c in collabs)

    upd = client.put(
        f"/api/forms/{form_id}/collaborators",
        json={"user_id": col_id, "role": "viewer"},
        headers=auth_header(admin_token),
    )
    assert upd.status_code == 200, upd.text

    rm = client.request(
        "DELETE",
        f"/api/forms/{form_id}/collaborators",
        json={"user_id": col_id},
        headers=auth_header(admin_token),
    )
    assert rm.status_code in (200, 204), rm.text
