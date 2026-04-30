from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from . import models, schemas, crud, auth
from .database import engine, SessionLocal
from .dependencies import get_db, get_current_user, get_admin_user

# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to create default admin user
def create_default_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = os.getenv("ADMIN_EMAIL", "admin@gmail.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        existing_admin = crud.get_user_by_email(db, admin_email)
        
        if not existing_admin:
            # Create admin user
            hashed_password = auth.hash_password(admin_password)
            admin_user = models.User(
                email=admin_email,
                hashed_password=hashed_password,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"✅ Default admin created successfully!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
        else:
            # Ensure existing admin has admin privileges
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                db.commit()
                print(f"✅ Updated {admin_email} to admin status")
            else:
                print(f"✅ Admin user already exists: {admin_email}")
    except Exception as e:
        print(f"❌ Error creating default admin: {e}")
    finally:
        db.close()

# Create default admin on startup
@app.on_event("startup")
def startup_event():
    create_default_admin()

# Register endpoint
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if trying to register as admin (prevent users from registering as admin)
    if user.email == os.getenv("ADMIN_EMAIL", "admin@gmail.com"):
        raise HTTPException(400, "Cannot register with admin email")
    
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(400, "Email already exists")
    return crud.create_user(db, user.email, user.password)

# Login endpoint
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    
    if not db_user:
        raise HTTPException(400, "Invalid credentials")
    
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(400, "Invalid credentials")
    
    token = auth.create_access_token({
        "user_id": db_user.id,
        "is_admin": db_user.is_admin
    })
    
    return {"access_token": token, "token_type": "bearer"}

# Task endpoints
@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return crud.create_task(db, user, task.title, task.description, task.owner_id)

@app.get("/tasks", response_model=list[schemas.TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.is_admin:
        return crud.get_all_tasks(db)
    return crud.get_user_tasks(db, user.id)

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    result = crud.delete_task(db, user, task_id)
    if "error" in result:
        raise HTTPException(403, result["error"])
    return result

@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    completed: bool = None,
    title: str = None,
    description: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    result = crud.update_task(db, user, task_id, completed, title, description)
    if "error" in result:
        raise HTTPException(403, result["error"])
    return result

# Admin endpoints
@app.get("/users", response_model=list[schemas.UserResponse])
def get_users(
    db: Session = Depends(get_db),
    user=Depends(get_admin_user)
):
    return crud.get_all_users(db)

@app.get("/users/{user_id}/tasks", response_model=list[schemas.TaskResponse])
def get_user_tasks_admin(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user)
):
    target_user = crud.get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(404, "User not found")
    return crud.get_user_tasks(db, user_id)