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
    return {"Authorization": f"Bearer {tok}"}, u, e

def _create_form_with_questions(owner_h, is_public=False):
    
    fid = client.post(
        "/api/forms",
        json={"name": "Results", "description": None, "is_public": is_public},
        headers=owner_h
    ).json()["id"]

    
    opts = json.dumps([{"text": "Red"}, {"text": "Blue"}])

    def add_q(text, qtype, is_required=True, max_choices=None, options=None):
        data = {"text": text, "type": qtype, "is_required": str(is_required).lower()}
        if max_choices is not None:
            data["max_choices"] = str(max_choices)
        if options is not None:
            data["options"] = options
        r = client.post(f"/api/forms/{fid}/questions", data=data, headers=owner_h)
        assert r.status_code == 200, r.text

    add_q("Kakvo je vreme napolju?", "radio", True, options=opts)
    add_q("Comment", "short_text", False)

 
    form = client.get(f"/api/forms/{fid}", headers=owner_h).json()
    qmap = {q["text"]: q["id"] for q in form["questions"]}

    return fid, qmap

def test_owner_can_view_submissions_and_others_cannot():
    
    owner_h, _, owner_email = auth_headers("owner_rs", "owner_rs@ex.com")
    u1_h, _, u1_email = auth_headers("aleksa", "aleksa@ex.com")
    u2_h, _, u2_email = auth_headers("bogdan", "bogdan@ex.com")

    fid, q = _create_form_with_questions(owner_h, is_public=False)


    payload1 = {
        "answers": [
            {"question_id": q["Kakvo je vreme napolju?"], "answer": "Red"},
            {"question_id": q["Comment"], "answer": "Suncano"}
        ]
    }
    r = client.post(f"/api/forms/{fid}/answers", json=payload1, headers=u1_h)
    assert r.status_code == 200, r.text

    payload2 = {
        "answers": [
            {"question_id": q["Kakvo je vreme napolju?"], "answer": "Blue"},
            {"question_id": q["Comment"], "answer": "Oblacno"}
        ]
    }
    r = client.post(f"/api/forms/{fid}/answers", json=payload2, headers=u2_h)
    assert r.status_code == 200, r.text

    r = client.get(f"/api/forms/{fid}/answers", headers=u1_h)
    assert r.status_code == 403, r.text

    r = client.get(f"/api/forms/{fid}/answers", headers=owner_h)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list) and len(data) >= 2

    emails = {row["korisnik"] for row in data}
    assert "aleksa@ex.com" in emails and "bogdan@ex.com" in emails

    questions = {row["pitanje"] for row in data}
    assert "Kakvo je vreme napolju?" in questions and "Comment" in questions
