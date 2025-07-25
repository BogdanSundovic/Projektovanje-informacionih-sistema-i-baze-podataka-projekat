from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Boolean, text
from sqlalchemy.orm import relationship, Session, joinedload
from database import Base
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Depends, APIRouter, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.datastructures import UploadFile
from form_db_circl_fix import get_db
from form_cur_user_circl_fix import get_current_user_optional as get_current_user
from schemas import QuestionCreate, QuestionCreateMultipart, OptionWithImage
from models import QuestionModel, OptionModel, UserModel,AnswerModel
from schemas import FormOut, FormCreate, AnswerSubmission, FormUpdate, QuestionUpdate 
from typing import Optional, List
from form_cur_user_circl_fix import get_current_user_optional
import json, os, uuid, shutil
from uuid import uuid4
import mimetypes
from cloudinary_utils import upload_to_cloudinary

router = APIRouter()


class FormModel(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    is_public = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("UserModel", backref="forms")
    questions = relationship("QuestionModel", back_populates="form", cascade="all, delete", lazy="joined")
    #created_at = Column(DateTime(timezone=True), server_default=func.now())
    #updated_at = Column(DateTime(timezone=True), onupdate=func.now())

@router.post("/api/forms")
def create_form(data: FormCreate, db: Session = Depends(get_db), current_user: Optional[UserModel] = Depends(get_current_user)):
    new_form = FormModel(
        name=data.name,
        description=data.description,
        is_public=data.is_public,
        owner_id = current_user.id 


    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    return {"id": new_form.id, "message": "Form created successfully"}


@router.post("/api/forms/{form_id}/questions")
def add_question(
    form_id: int,
    request: Request,
    text: str = Form(...),
    type: str = Form(...),
    is_required: bool = Form(...),
    order: Optional[int] = Form(None),
    max_choices: Optional[int] = Form(None),
    options: Optional[str] = Form(None),  
    image: Optional[UploadFile] = File(None),  
    option_images: List[UploadFile] = File([]),  
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_current_user)
):
    form = db.query(FormModel).filter(FormModel.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this form")

    
    image_url = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid4().hex}{ext}"
        filepath = os.path.join("temp", filename)
        os.makedirs("temp", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(image.file.read())

        image_url = upload_to_cloudinary(filepath, filename)
        os.remove(filepath)

    new_question = QuestionModel(
        form_id=form_id,
        text=text,
        type=type,
        is_required=is_required,
        order=order,
        max_choices=max_choices,
        image_url=image_url 
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    
    if options and type in ["radio", "checkbox", "single_choice", "multiple_choice"]:
        try:
            parsed_options = json.loads(options)  # [{"text": "..."}]
        except:
            raise HTTPException(status_code=400, detail="Invalid options JSON format")

        for idx, opt in enumerate(parsed_options):
            opt_image_url = None
            if idx < len(option_images):
                img_file = option_images[idx]
                if img_file and img_file.filename:
                    ext = os.path.splitext(img_file.filename)[1]
                    fname = f"{uuid4().hex}{ext}"
                    fpath = os.path.join("temp", fname)
                    with open(fpath, "wb") as f:
                        f.write(img_file.file.read())

                    opt_image_url = upload_to_cloudinary(fpath, fname)
                    os.remove(fpath)

            db.add(OptionModel(
                text=opt["text"],
                question_id=new_question.id,
                image_url=opt_image_url
            ))

        db.commit()

    return {"id": new_question.id, "message": "Question with options added"}


@router.get("/api/forms/owned")
def get_owned_forms(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    forms = db.query(FormModel).filter(FormModel.owner_id == current_user.id).all()
    return forms



@router.get("/api/forms/public", response_model=List[FormOut])
def get_public_forms(db: Session = Depends(get_db)):
    forms = db.query(FormModel).filter(FormModel.is_public == True).all()
    return forms



@router.get("/api/forms/{form_id}", response_model=FormOut)
def get_form_by_id(
    form_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_current_user_optional)
):
    form = db.query(FormModel).options(
        joinedload(FormModel.questions).joinedload(QuestionModel.options)
    ).filter(FormModel.id == form_id).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    if not form.is_public:
        if not current_user:
            raise HTTPException(status_code=403, detail="This form is private")

        if current_user.id != form.owner_id:
            is_collaborator = db.execute(
                "SELECT 1 FROM collaborators WHERE form_id = :fid AND user_id = :uid",
                {"fid": form_id, "uid": current_user.id}
            ).first()
            if not is_collaborator:
                raise HTTPException(status_code=403, detail="Access denied to private form")

   
    converted_questions = []
    for q in form.questions:
        converted_options = []
        for opt in q.options:
            converted_options.append({
                "id": opt.id,
                "text": opt.text,
                "image_url": opt.image_url if opt.image_url else None  
            })

        converted_questions.append({
            "id": q.id,
            "text": q.text,
            "type": q.type,
            "is_required": q.is_required,
            "order": q.order,
            "max_choices": q.max_choices,
            "image_url": q.image_url if q.image_url else None, 
            "options": converted_options
        })

    return {
        "id": form.id,
        "name": form.name,
        "description": form.description,
        "is_public": form.is_public,
        "questions": converted_questions
    }


@router.post("/api/forms/{form_id}/answers")
def submit_answers(
    form_id: int,
    submission: AnswerSubmission,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_current_user_optional)
):

    form = db.query(FormModel).filter(FormModel.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Forma ne postoji.")

    if not form.is_public and current_user is None:
        raise HTTPException(status_code=403, detail="Morate biti prijavljeni da biste popunili ovu formu.")

    for item in submission.answers:
        question = db.query(QuestionModel).filter(QuestionModel.id == item.question_id).first()
        if not question or question.form_id != form_id:
            raise HTTPException(status_code=400, detail=f"Nevažeće pitanje ID: {item.question_id}")

        answer = AnswerModel(
            question_id=item.question_id,
            user_id=current_user.id if current_user else None,
            value=str(item.answer)
        )
        db.add(answer)

    db.commit()
    return {"message": "Odgovori su uspešno sačuvani."}

@router.get("/api/forms/{form_id}/answers")
def get_answers_for_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    
    form = db.query(FormModel).filter(FormModel.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Forma ne postoji.")

    if current_user.id != form.owner_id:
        raise HTTPException(status_code=403, detail="Nemate dozvolu da vidite odgovore za ovu formu.")

    answers = db.execute(
        text("""
            SELECT q.text AS question_text,
                   a.value AS answer_value,
                   u.email AS user_email
            FROM answers a
            JOIN questions q ON q.id = a.question_id
            LEFT JOIN users u ON u.id = a.user_id
            WHERE q.form_id = :fid
        """),
        {"fid": form_id}
    ).fetchall()

    results = []
    for row in answers:
        results.append({
            "pitanje": row.question_text,
            "odgovor": row.answer_value,
            "korisnik": row.user_email if row.user_email else "anonymo"
        })

    return JSONResponse(content=results)


@router.put("/api/forms/{form_id}")
def update_form(
    form_id: int,
    data: FormUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)  
):
    form = db.query(FormModel).filter(FormModel.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Forma ne postoji.")

    if form.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Nemate dozvolu da izmenite ovu formu.")

    if data.name is not None:
        form.name = data.name
    if data.description is not None:
        form.description = data.description
    if data.is_public is not None:
        form.is_public = data.is_public

    db.commit()
    db.refresh(form)

    return {
        "id": form.id,
        "name": form.name,
        "description": form.description,
        "is_public": form.is_public,
        "owner_id": form.owner_id
    }


@router.put("/api/forms/{form_id}/questions/{question_id}")
def update_question(
    form_id: int,
    question_id: int,
    updated_data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_current_user_optional)
):
    
    question = db.query(QuestionModel).filter(
        QuestionModel.id == question_id,
        QuestionModel.form_id == form_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")

    form = db.query(FormModel).filter(FormModel.id == form_id).first()
    if not form or form.owner_id != (current_user.id if current_user else None):
        raise HTTPException(status_code=403, detail="Niste vlasnik forme")

    if updated_data.text is not None:
        question.text = updated_data.text
    if updated_data.type is not None:
        question.type = updated_data.type

    if updated_data.options is not None:
        db.query(OptionModel).filter(OptionModel.question_id == question_id).delete()
        for option in updated_data.options:
            db.add(OptionModel(text=option.text, question_id=question_id))

    if updated_data.max_choices is not None:
        question.max_choices = updated_data.max_choices

    db.commit()
    db.refresh(question)
    return {
        "id": question.id,
        "text": question.text,
        "type": question.type,
        "form_id": question.form_id
    }

@router.delete("/api/forms/{form_id}")
def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)  
):
    form = db.query(FormModel).filter(FormModel.id == form_id).first()

    if not form:
        raise HTTPException(status_code=404, detail="Forma nije pronađena.")

    if form.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Samo vlasnik može da obriše ovu formu.")

    db.delete(form)
    db.commit()
    return {"detail": "Forma je uspešno obrisana."}