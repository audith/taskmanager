from sqlalchemy.orm import Session
from .models import User,Task
from .auth import hash_password

def create_user(db:Session,email:str,password:str):
    user=User(email=email,hash_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db:Session,email:str):
    return db.query(User).filter(User.email==email).first()

def create_task(db:Session,user_id:int,title:str,description:str):
    task=Task(title=title,description=description,owner_id=user_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_task(db:Session,user_id:int):
    return db.query(Task).filter(Task.owner_id==user_id).all()