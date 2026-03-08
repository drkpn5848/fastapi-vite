from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from database.db import getConnection
from models.jwt import validateToken
from models.models import Users, Tasks

router = APIRouter(prefix="/dashboard")

@router.get("/view")
def dashboard(token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)

    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    emailid = decoded["sid"]
    role = db.query(Users.role).filter(Users.emailid == decoded["sid"]).scalar();
    if role == 3:
        totalusers = db.query(Users).count()
        activeusers = db.query(Users).filter(Users.softdelete == 0).count()
        deletedusers = db.query(Users).filter(Users.softdelete == 1).count()
        return {
            "code": 200,
            "rid": role,
            "totalusers": totalusers,
            "activeusers": activeusers,
            "deletedusers": deletedusers
        }
    elif role == 2:
        totaltasks = db.query(Tasks).join(Users, Tasks.createdby == Users.id).filter(Users.emailid == emailid).count()
        assignedtasks = db.query(Tasks).join(Users, Tasks.createdby == Users.id).filter(Users.emailid == emailid, Tasks.status == 0).count()
        inprogresstasks = db.query(Tasks).join(Users, Tasks.createdby == Users.id).filter(Users.emailid == emailid, Tasks.status == 1).count()
        completedtasks = db.query(Tasks).join(Users, Tasks.createdby == Users.id).filter(Users.emailid == emailid, Tasks.status == 2).count()
        return {
            "code": 200,
            "rid": role,
            "totaltasks": totaltasks,
            "assignedtasks": assignedtasks,
            "inprogresstasks": inprogresstasks,
            "completedtasks": completedtasks
        }
    else:
        totaltasks = db.query(Tasks).join(Users, Tasks.assignedto == Users.id).filter(Users.emailid == emailid).count()
        assignedtasks = db.query(Tasks).join(Users, Tasks.assignedto == Users.id).filter(Users.emailid == emailid, Tasks.status == 0).count()
        inprogresstasks = db.query(Tasks).join(Users, Tasks.assignedto == Users.id).filter(Users.emailid == emailid, Tasks.status == 1).count()
        completedtasks = db.query(Tasks).join(Users, Tasks.assignedto == Users.id).filter(Users.emailid == emailid, Tasks.status == 2).count()
        return {
            "code": 200,
            "rid": role,
            "totaltasks": totaltasks,
            "assignedtasks": assignedtasks,
            "inprogresstasks": inprogresstasks,
            "completedtasks": completedtasks
        }