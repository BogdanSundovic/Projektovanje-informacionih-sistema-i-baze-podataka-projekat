from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from backend.database import Base

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class QuestionModel(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    text = Column(String, nullable=False)
    type = Column(String, nullable=False)  #short_text, long_text, radio, checkbox, etc.
    is_required = Column(Boolean, default=True)
    order = Column(Integer)
    #created_at = Column(DateTime(timezone=True), server_default=func.now())
    form = relationship("FormModel", back_populates="questions")
    options = relationship("OptionModel", back_populates="question", cascade="all, delete")
    max_choices = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)


class OptionModel(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    text = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    question = relationship("QuestionModel", back_populates="options")

class CollaboratorModel(Base):
    __tablename__ = "collaborators"
    id = Column(Integer, primary_key=True)
    form_id = Column(Integer, ForeignKey("forms.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)    

class AnswerModel(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    value = Column(String, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())