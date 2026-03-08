from pydantic import BaseModel
from typing import Optional

class UsersSchema(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    emailid: Optional[str] = None
    password: Optional[str] = None
    role: Optional[int] = None

class JwtSchema(BaseModel):
    token: Optional[str] = None

class TasksSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    createdby: Optional[int] = None
    assignedto: Optional[int] = None
    priority: Optional[int] = None
    duedate: Optional[str] = None
    status: Optional[int] = None