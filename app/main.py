from fastapi import FastAPI,Depends,HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from . import models,schemas,crud,auth
from .database import engine
from .dependencies import get_db,get_current_user

models.Base.metadata.create_all(bind=engine)

app=FastAPI()

@app.post("/register",response_model=schemas.UserResponse)
def register(user:schemas.UserCreate,db:Session=Depends(get_db)):
    existing=crud.get_user_by_email(db,user.email)
    if existing:
        raise HTTPException(status_code=400,detail="email alredy exist")
    return crud.create_user(db,user.email,user.password) 

@app.post("/login")
def login(from_data:OAuth2PasswordRequestForm=Depends(),db:Session=Depends(get_db)):
    user=crud.get_user_by_email(db,from_data.username)
    
    if not user or not auth.verify_password(from_data.password,user.hashed_password):
        raise HTTPException(status_code=400,detail="invalid user name")
    token=auth.create_access_token({"user_id":user.id})
    return {"access_token":token,"token_type":"bearer"}

