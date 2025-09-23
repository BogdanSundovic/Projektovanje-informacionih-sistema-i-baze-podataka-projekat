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

def _create_form(owner_h, is_public=True):
    r = client.post("/api/forms", json={"name": "NumChoice", "description": None, "is_public": is_public}, headers=owner_h)
    assert r.status_code == 200, r.text
    return r.json()["id"]

def _qid(form_id, text, headers=None):
    r = client.get(f"/api/forms/{form_id}", headers=headers)
    assert r.status_code == 200, r.text
    f = r.json()
    qmap = {q["text"]: q["id"] for q in f["questions"]}
    return qmap[text]

def test_numeric_choice_via_scale_single_answer():
    owner_h = auth_headers()
    fid = _create_form(owner_h)

    data = {
        "text": "Ocena (1-5)?",
        "type": "numeric_choice",
        "is_required": "true",
        "numeric_scale": json.dumps({"start": 1, "end": 5, "step": 1}),
    }
    r = client.post(f"/api/forms/{fid}/questions", data=data, headers=owner_h)
    assert r.status_code == 200, r.text

    qid = _qid(fid, "Ocena (1-5)?", headers=owner_h)

    user_h = auth_headers()
    payload = {"answers": [{"question_id": qid, "answer": "4"}]}
    s = client.post(f"/api/forms/{fid}/answers", json=payload, headers=user_h)
    assert s.status_code == 200, s.text

def test_numeric_choice_via_options_list():
    owner_h = auth_headers()
    fid = _create_form(owner_h)

    opts = json.dumps([{"text": "10"}, {"text": "20"}, {"text": "30"}])
    data = {
        "text": "Godine?",
        "type": "numeric_choice",
        "is_required": "false",
        "options": opts,
    }
    r = client.post(f"/api/forms/{fid}/questions", data=data, headers=owner_h)
    assert r.status_code == 200, r.text

    qid = _qid(fid, "Godine?", headers=owner_h)

    user_h = auth_headers()
    payload = {"answers": [{"question_id": qid, "answer": "20"}]}
    s = client.post(f"/api/forms/{fid}/answers", json=payload, headers=user_h)
    assert s.status_code == 200, s.text

def test_numeric_choice_rejects_bad_scale_and_non_numeric_options():
    owner_h = auth_headers()
    fid = _create_form(owner_h)

    bad_scale = json.dumps({"start": 1, "end": 5, "step": 0})
    r1 = client.post(
        f"/api/forms/{fid}/questions",
        data={"text": "Loš scale", "type": "numeric_choice", "is_required": "true", "numeric_scale": bad_scale},
        headers=owner_h,
    )
    assert r1.status_code == 400
    assert "step cannot be 0" in r1.json().get("detail", "")

    bad_opts = json.dumps([{"text": "A"}, {"text": "B"}])
    r2 = client.post(
        f"/api/forms/{fid}/questions",
        data={"text": "Loše opcije", "type": "numeric_choice", "is_required": "true", "options": bad_opts},
        headers=owner_h,
    )
    assert r2.status_code == 400
    assert "numeric_choice options must be numeric" in r2.json().get("detail", "")

def test_numeric_choice_rejects_out_of_scale_answer():
    owner_h = auth_headers(); fid = _create_form(owner_h)
    data = {
        "text": "Ocena (1-5)?", "type": "numeric_choice", "is_required": "true",
        "numeric_scale": json.dumps({"start": 1, "end": 5, "step": 1}),
    }
    assert client.post(f"/api/forms/{fid}/questions", data=data, headers=owner_h).status_code == 200
    qid = _qid(fid, "Ocena (1-5)?", headers=owner_h)

    user_h = auth_headers()
    
    bad = client.post(f"/api/forms/{fid}/answers", json={"answers":[{"question_id": qid, "answer": 6}]}, headers=user_h)
    assert bad.status_code in (400, 422)