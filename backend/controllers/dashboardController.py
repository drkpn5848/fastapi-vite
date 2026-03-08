from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from database.db import getConnection
from models.jwt import validateToken
from models.models import Users

router = APIRouter(prefix="/dashboard")

@router.get("/view")
def profile(token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)

    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    totalusers = db.query(Users).count()
    activeusers = db.query(Users).filter(Users.softdelete == 0).count()
    deletedusers = db.query(Users).filter(Users.softdelete == 1).count()
    return {
        "code": 200,
        "rid": decoded["rid"],
        "totalusers": totalusers,
        "activeusers": activeusers,
        "deletedusers": deletedusers
    }