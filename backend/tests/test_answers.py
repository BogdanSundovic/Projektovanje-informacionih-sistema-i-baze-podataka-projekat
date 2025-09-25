from sqlalchemy.orm import Session
from models import FormModel, QuestionModel, OptionModel, AnswerModel


def seed_form_with_questions(db: Session, owner_id: int) -> int:
    form = FormModel(name="Test forma", description=None, is_public=True, is_locked=False, owner_id=owner_id)
    db.add(form)
    db.flush()

    # Q1: single choice (radio)
    q1 = QuestionModel(form_id=form.id, text="Omiljena boja?", type="radio", is_required=True, order=1)
    db.add(q1); db.flush()
    o1 = OptionModel(question_id=q1.id, text="Crvena")
    o2 = OptionModel(question_id=q1.id, text="Plava")
    db.add_all([o1, o2]); db.flush()

    # Q2: short_text
    q2 = QuestionModel(form_id=form.id, text="Komentar", type="short_text", is_required=False, order=2)
    db.add(q2); db.flush()

    db.commit()
    return form.id

def test_answers_and_analytics(client, db, register_user_and_token, auth_header):
    token_owner = register_user_and_token("own", "own@example.com")
    me = client.get("/api/me", headers=auth_header(token_owner)).json()

    form_id = seed_form_with_questions(db, owner_id=1)  

    q = db.query(QuestionModel).filter(QuestionModel.form_id == form_id).order_by(QuestionModel.order).all()
    q1, q2 = q[0], q[1]
    opt = db.query(OptionModel).filter(OptionModel.question_id == q1.id).first()

    payload = {
        "answers": [
            {"question_id": q1.id, "answer": str(opt.id)},
            {"question_id": q2.id, "answer": "Lepo je."}
        ]
    }
    r = client.post(f"/api/forms/{form_id}/answers", json=payload)
    assert r.status_code == 200, r.text

    r = client.get(f"/api/forms/{form_id}/answers", headers=auth_header(token_owner))
    assert r.status_code == 200
    rows = r.json()
    assert any(row["pitanje"] == "Omiljena boja?" for row in rows)

    r = client.get(f"/api/forms/{form_id}/analytics", headers=auth_header(token_owner))
    assert r.status_code == 200, r.text
    data = r.json()["analytics"]

    q1_agg = next(d for d in data if d["text"] == "Omiljena boja?")
    assert q1_agg["total_answers"] == 1
    assert any(item["count"] == 1 for item in q1_agg["distribution"])

    lock = client.put(f"/api/forms/{form_id}", json={"is_locked": True}, headers=auth_header(token_owner))
    assert lock.status_code == 200
    r2 = client.post(f"/api/forms/{form_id}/answers", json=payload)
    assert r2.status_code == 403
