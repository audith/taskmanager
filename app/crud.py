from sqlalchemy.orm import Session
from .models import User, Task
from .auth import hash_password

# User operations
def create_user(db: Session, email: str, password: str):
    hashed_pw = hash_password(password)
    user = User(
        email=email,
        hashed_password=hashed_pw,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_all_users(db: Session):
    return db.query(User).all()

# Task operations
def create_task(db: Session, user, title: str, description: str = "", owner_id: int = None):
    final_owner = owner_id if user.is_admin and owner_id else user.id
    task = Task(
        title=title,
        description=description,
        owner_id=final_owner
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_user_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.owner_id == user_id).all()

def get_all_tasks(db: Session):
    return db.query(Task).all()

def delete_task(db: Session, user, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        return {"error": "Task not found"}
    
    if task.owner_id != user.id and not user.is_admin:
        return {"error": "Not allowed"}
    
    db.delete(task)
    db.commit()
    return {"message": "Deleted"}

def update_task(db: Session, user, task_id: int, completed: bool = None, title: str = None, description: str = None):
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        return {"error": "Task not found"}
    
    if task.owner_id != user.id and not user.is_admin:
        return {"error": "Not allowed"}
    
    if completed is not None:
        task.completed = completed
    if title:
        task.title = title
    if description:
        task.description = description
    
    db.commit()
    db.refresh(task)
    return task