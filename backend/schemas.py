from pydantic import BaseModel
from typing import List, Optional, Union
from fastapi import UploadFile

class User(BaseModel):
    username: str
    email: str

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    identifier: str
    password: str

class OptionCreate(BaseModel):
    text: str

class QuestionCreate(BaseModel):
    text: str
    type: str  # short_text, long_text, radio, checkbox, number, date, time
    is_required: bool = True
    order: Optional[int] = None
    options: Optional[List[OptionCreate]] = None
    max_choices: Optional[int] = None

class OptionOut(BaseModel):
    id: int
    text: str
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

class QuestionOut(BaseModel):
    id: int
    text: str
    type: str
    is_required: bool
    order: Optional[int]
    options: Optional[List[OptionOut]] = None
    max_choices: Optional[int] = None
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

class FormCreate(BaseModel):
    name: str
    description: Optional[str]
    is_public: bool

class FormOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_public: bool
    questions: Optional[List[QuestionOut]] 

    class Config:
        from_attributes = True

class AnswerItem(BaseModel):
    question_id: int
    answer: Union[str, int, List[str]]  


class AnswerSubmission(BaseModel):
    answers: List[AnswerItem]

class FormUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class OptionCreate(BaseModel):
    text: str
    

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    options: Optional[List[OptionCreate]] = None
    max_choices: Optional[int] = None

class OptionWithImage(BaseModel):
    text: str
    image: Optional[UploadFile] = None 

class QuestionCreateMultipart(BaseModel):
    text: str
    type: str
    is_required: Optional[bool] = True
    order: Optional[int] = None
    max_choices: Optional[int] = None
    options: Optional[str] = None  