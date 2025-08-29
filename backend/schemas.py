from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Union, Literal
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
    is_superadmin: bool = False

class LoginRequest(BaseModel):
    identifier: str
    password: str

class OptionCreate(BaseModel):
    text: str

class QuestionCreate(BaseModel):
    text: str
    type: str  
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
    is_locked: Optional[bool] = False
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
    is_locked: Optional[bool] = None
    is_locked: Optional[bool] = None

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

class CollaboratorIn(BaseModel):
    user_id: int
    role: Literal["viewer", "editor"]

class CollaboratorOut(BaseModel):
    user_id: int
    username: str
    email: Optional[str] = None
    role: str

class CollaboratorUpdate(BaseModel):
    user_id: int
    role: Literal["viewer", "editor"]

class CollaboratorRemove(BaseModel):
    user_id: int

class FormCapabilities(BaseModel):
    can_edit: bool

class FormWithMeta(FormOut):
    my_role: Optional[str] = None            
    capabilities: Optional[FormCapabilities] = None
    model_config = ConfigDict(from_attributes=True)  

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_superadmin: Optional[bool] = None