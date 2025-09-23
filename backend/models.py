from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, func, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from backend.database import Base
from enum import Enum

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_superadmin = Column(Boolean, default=False)

class FormModel(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    is_public = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("UserModel", backref="forms")
    questions = relationship("QuestionModel", back_populates="form", cascade="all, delete", passive_deletes=True)
    collaborators = relationship("CollaboratorModel",back_populates="form", cascade="all, delete-orphan",passive_deletes=True
)
     

class QuestionModel(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, nullable=False)
    type = Column(String, nullable=False) 
    is_required = Column(Boolean, default=True)
    order = Column(Integer)
    form = relationship("FormModel", back_populates="questions")
    options = relationship("OptionModel", back_populates="question", cascade="all, delete")
    max_choices = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)


class OptionModel(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    question = relationship("QuestionModel", back_populates="options")

class CollaboratorModel(Base):
    __tablename__ = "collaborators"
    id = Column(Integer, primary_key=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False) 
    __table_args__ = (
        UniqueConstraint('form_id', 'user_id', name='uq_collab_form_user'),
    )  
    form = relationship("FormModel", back_populates="collaborators", passive_deletes=True)
    user = relationship("UserModel", passive_deletes=True)

class AnswerModel(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    value = Column(String, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

class QuestionType(str, Enum):
    single_choice = "single_choice"
    multiple_choice = "multiple_choice"
    short_text    = "short_text"
    long_text     = "long_text"
    number        = "number"       
    numeric_choice= "numeric_choice"
    #date          = "date"         
    #datetime      = "datetime"     