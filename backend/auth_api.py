from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from form import FormModel, FormCreate
from database import Base, engine, SessionLocal
from jose import JWTError, jwt
from models import UserModel, CollaboratorModel, FormModel, AnswerModel
from typing import List, Optional
from schemas import *
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
from form import *

load_dotenv()

# Config
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "2880"))

# App Init
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token", auto_error=False)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(db: Session, username: str):
    return db.query(UserModel).filter(UserModel.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = get_user(db, username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token error")

def _is_self_or_superadmin(current_user: UserModel, target_user_id: int) -> bool:
    return bool(current_user.is_superadmin) or current_user.id == target_user_id

def _ensure_superadmin(current_user: UserModel):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Samo super admin ima pristup ovoj akciji.")

# Routes
@app.post("/api/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    email_check = db.query(UserModel).filter(UserModel.email == user.email).first()
    if email_check:
        raise HTTPException(status_code=400, detail="Email already in use")
    hashed_password = get_password_hash(user.password)
    new_user = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username},
                                       expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return {
        "id": current_user.id, 
        "username": current_user.username,
        "email": current_user.email,
        "is_superadmin": getattr(current_user, "is_superadmin", False)
        
    }


@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    if "@" in data.identifier:
        user = db.query(UserModel).filter(UserModel.email == data.identifier).first()
    else:
        user = db.query(UserModel).filter(UserModel.username == data.identifier).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/me")
def read_me(current_user: UserModel = Depends(get_current_user)):
    return {
        "id": current_user.id, 
        "username": current_user.username,
        "email": current_user.email,
        "is_superadmin": current_user.is_superadmin,
    }


from form import router as form_router
app.include_router(form_router)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/api/users/search")
def search_users(
    q: str,
    limit: int = 10,
    exclude_form_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    q = (q or "").strip()
    if len(q) < 2:
        raise HTTPException(status_code=400, detail="Parametar q mora imati najmanje 2 karaktera.")

    base_query = db.query(UserModel).filter(
        or_(UserModel.username.ilike(f"%{q}%"), UserModel.email.ilike(f"%{q}%"))
    )

    if exclude_form_id is not None:
        from models import FormModel  
        form = db.query(FormModel).filter(FormModel.id == exclude_form_id).first()
        if not form:
            raise HTTPException(status_code=404, detail="Forma ne postoji.")

        collab_user_ids = db.query(CollaboratorModel.user_id).filter(
            CollaboratorModel.form_id == exclude_form_id
        )

        base_query = base_query.filter(UserModel.id != form.owner_id)
        base_query = base_query.filter(~UserModel.id.in_(collab_user_ids))

    users = base_query.limit(limit).all()

    return [{"id": u.id, "username": u.username, "email": u.email} for u in users]

@app.get("/api/users")
def get_users(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    users = db.query(UserModel).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_superadmin": bool(getattr(u, "is_superadmin", False)),
        }
        for u in users
    ]
@app.put("/api/users/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if not is_superadmin(current_user) and current_user.id != user_id:
         HTTPException(status_code=403, detail="Možete izmeniti samo svoj nalog.")

    if not _is_self_or_superadmin(current_user, user_id):
        raise HTTPException(status_code=403, detail="Samo super admin ili vlasnik naloga može da izmeni korisnika.")

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if data.username and data.username != user.username:
        if db.query(UserModel).filter(UserModel.username == data.username).first():
            raise HTTPException(status_code=400, detail="Korisničko ime je zauzeto.")
        user.username = data.username

    if data.email and data.email != user.email:
        if db.query(UserModel).filter(UserModel.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email je zauzet.")
        user.email = data.email

    if data.password:
        user.hashed_password = get_password_hash(data.password)

    if data.is_superadmin is not None:
        if not current_user.is_superadmin:
            raise HTTPException(status_code=403, detail="Samo super admin može menjati is_superadmin polje.")
        user.is_superadmin = data.is_superadmin

    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "email": user.email, "is_superadmin": user.is_superadmin}


@app.delete("/api/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if not is_superadmin(current_user) and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Možete obrisati samo svoj nalog.")

    if not _is_self_or_superadmin(current_user, user_id):
        raise HTTPException(status_code=403, detail="Samo super admin ili vlasnik naloga može da obriše korisnika.")

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if user.is_superadmin:
        admins = db.query(UserModel).filter(UserModel.is_superadmin == True).count()
        if admins == 1:
            raise HTTPException(status_code=409, detail="Ne možeš obrisati poslednjeg super admina.")

    db.query(AnswerModel).filter(AnswerModel.user_id == user_id).update(
        {AnswerModel.user_id: None}, synchronize_session=False
    )

    db.delete(user)
    db.commit()