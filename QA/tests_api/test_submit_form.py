import json
from uuid import uuid4
from fastapi.testclient import TestClient
from backend.auth_api import app

client = TestClient(app)

def auth_headers(u=None, e=None, p="p"):
    u = u or f"user_{uuid4().hex[:8]}"
    e = e or f"{u}@ex.com"
    client.post("/api/register", json={"username": u, "email": e, "password": p})
    tok = client.post("/token", data={"username": u, "password": p}).json()["access_token"]
    return {"Authorization": f"Bearer {tok}"}

def _create_full_form(headers, is_public=True):
    form_id = client.post(
        "/api/forms",
        json={"name": "Full types", "description": None, "is_public": is_public},
        headers=headers
    ).json()["id"]

    options_json = json.dumps([{"text": "A"}, {"text": "B"}, {"text": "C"}])

    def add_q(text, qtype, is_required=True, max_choices=None, options=None):
        data = {
            "text": text,
            "type": qtype,
            "is_required": str(is_required).lower()
        }
        if max_choices is not None:
            data["max_choices"] = str(max_choices)
        if options is not None:
            data["options"] = options
        r = client.post(f"/api/forms/{form_id}/questions", data=data, headers=headers)
        assert r.status_code == 200, r.text

    add_q("Short?",  "short_text", True)
    add_q("Long?",   "long_text", False)
    add_q("One?",    "radio", True,  options=options_json)
    add_q("Many?",   "checkbox", False, max_choices=2, options=options_json)
    add_q("Date?",   "date", False)
    add_q("Num?",   "numeric_choice", False, options=json.dumps([{"text":"1"},{"text":"2"},{"text":"3"}]))
    add_q("When?", "datetime", False)
    return form_id

def _answers_payload(form_id, headers=None):
    resp = client.get(f"/api/forms/{form_id}", headers=headers)
    assert resp.status_code == 200, resp.text
    f = resp.json()
    q = {qq["text"]: qq["id"] for qq in f["questions"]}
    return {
        "answers": [
            {"question_id": q["Short?"], "answer": "cao"},
            {"question_id": q["Long?"],  "answer": "dovidjenja"},
            {"question_id": q["One?"],   "answer": "A"},
            {"question_id": q["Many?"],  "answer": ["A", "B"]},
            {"question_id": q["Date?"],  "answer": "2025-08-01"},
            {"question_id": q["Num?"],  "answer": "2"},
            {"question_id": q["When?"],  "answer": "2025-08-01T12:34:00"},
            
        ]
    }

def test_submit_full_form_public_anonymous_ok():
    h = auth_headers()
    fid = _create_full_form(h, is_public=True)

    payload = _answers_payload(fid)
    r = client.post(f"/api/forms/{fid}/answers", json=payload) 
    assert r.status_code == 200, r.text
    assert "uspešno" in r.json().get("message", "").lower()

def test_submit_full_form_private_requires_auth():
    owner_h = auth_headers()
    fid = _create_full_form(owner_h, is_public=False)

    r = client.post(f"/api/forms/{fid}/answers", json={"answers": []})
    assert r.status_code == 403

    auth_h = auth_headers() 
    payload = _answers_payload(fid, headers=owner_h)

    r = client.post(f"/api/forms/{fid}/answers", json=payload, headers=auth_h)
    assert r.status_code == 200, r.text
