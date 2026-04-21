from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    is_admin:bool

    class Config:
        from_attributes = True



class TaskCreate(BaseModel):
    title:str
    description:str
    owner_id:int | None=None


class TaskResponse(BaseModel):
    id:int
    title:str
    description:str
    completed:bool

    class Config:
        from_attributes=True
        