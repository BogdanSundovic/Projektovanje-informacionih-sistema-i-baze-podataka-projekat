import json
from uuid import uuid4
from fastapi.testclient import TestClient
from backend.auth_api import app

client = TestClient(app)

def auth_headers(u=None, e=None, p="p"):
    u = u or f"user_{uuid4().hex[:8]}"; e = e or f"{u}@ex.com"
    client.post("/api/register", json={"username": u, "email": e, "password": p})
    tok = client.post("/token", data={"username": u, "password": p}).json()["access_token"]
    return {"Authorization": f"Bearer {tok}"}

def make_form_with_types(h):
    fid = client.post("/api/forms", json={"name":"A","description":None,"is_public":False}, headers=h).json()["id"]
    opts = json.dumps([{"text":"A"},{"text":"B"},{"text":"C"}])
    def add(text, t, **extra):
        data = {"text":text, "type":t, "is_required":"false", **{k:str(v).lower() if isinstance(v,bool) else v for k,v in extra.items()}}
        r = client.post(f"/api/forms/{fid}/questions", data=data, headers=h); assert r.status_code==200
    add("One?", "radio", options=opts)
    add("Many?", "checkbox", max_choices=2, options=opts)
    add("Num?",  "numeric_choice", options=json.dumps([{"text":"1"},{"text":"2"},{"text":"3"}]))
    return fid

def test_analytics_contains_expected_keys():
    owner_h = auth_headers()
    fid = make_form_with_types(owner_h)

    
    u1 = auth_headers(); u2 = auth_headers()
    def ans(h, one, many, num, date, time):
        
        q = {q["text"]: q["id"] for q in client.get(f"/api/forms/{fid}", headers=owner_h).json()["questions"]}
        payload = {"answers":[
            {"question_id":q["One?"],"answer":one},
            {"question_id":q["Many?"],"answer":many},
            {"question_id":q["Num?"],"answer":num},
            
        ]}
        r = client.post(f"/api/forms/{fid}/answers", json=payload, headers=h); assert r.status_code==200
    ans(u1,"A",["A","B"],"2","2025-01-01","10:00")
    ans(u2,"B",["B"],     "3","2025-01-02","11:00")

    res = client.get(f"/api/forms/{fid}/analytics", headers=owner_h)
    assert res.status_code == 200
    data = res.json()["analytics"]
    by_text = {item["text"]: item for item in data}

    assert "distribution" in by_text["One?"]
    assert "distribution" in by_text["Many?"]
    assert any(k in by_text["Num?"] for k in ("histogram","count"))
    