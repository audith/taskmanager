from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from . import models, schemas, crud, auth
from .database import engine
from .dependencies import get_db, get_current_user
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins=[
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    return crud.create_user(db, user.email, user.password)



@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    user = crud.get_user_by_email(db, form_data.username)

    if not user or not auth.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = auth.create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}



@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate,
                db: Session = Depends(get_db),
                user=Depends(get_current_user)):

    return crud.create_task(
        db,
        user,
        task.title,
        task.description,
        task.owner_id   # 👈 admin can pass this
    )



@app.get("/tasks", response_model=list[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db),
              user=Depends(get_current_user)):

    return crud.get_tasks(db, user)


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int,
                db: Session = Depends(get_db),
                user=Depends(get_current_user)):

    return crud.delete_task(db, user, task_id)