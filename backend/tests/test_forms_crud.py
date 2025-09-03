def test_forms_crud(client, register_user_and_token, auth_header):
    token = register_user_and_token("owner", "owner@example.com")

    r = client.post("/api/forms", json={
        "name": "Anketa 1",
        "description": "Opis",
        "is_public": True
    }, headers=auth_header(token))
    assert r.status_code == 200, r.text
    form_id = r.json()["id"]

    r = client.get("/api/forms/owned", headers=auth_header(token))
    assert r.status_code == 200
    owned = r.json()
    assert any(f["id"] == form_id for f in owned)

    r = client.get(f"/api/forms/{form_id}", headers=auth_header(token))
    assert r.status_code == 200
    form = r.json()
    assert form["id"] == form_id
    assert form["is_public"] is True

    r = client.put(f"/api/forms/{form_id}", json={"name": "Anketa 1 (izmena)", "is_locked": True},
                   headers=auth_header(token))
    assert r.status_code == 200
    updated = r.json()
    assert updated["name"] == "Anketa 1 (izmena)"
    assert updated["is_locked"] is True

    r = client.delete(f"/api/forms/{form_id}", headers=auth_header(token))
    assert r.status_code == 200

    r = client.get(f"/api/forms/{form_id}", headers=auth_header(token))
    assert r.status_code == 404
