from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    id:int
    title:str
    description:str
    completed:bool

    class Config:
        from_attributes:True
        