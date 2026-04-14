from fastapi import Depends,HTTPException
from jose import jwt,JWTError
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import User
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer


load_dotenv()

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token:str=Depends(oauth2_scheme),db:Session=Depends(get_db)):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id=payload.get("user_id")
    except JWTError:
        raise HTTPException(status_code=401,detail="invalid token")
    user=db.query(User).filter(User.id == user_id).first()
    return user


