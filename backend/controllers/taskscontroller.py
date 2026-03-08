from fastapi import APIRouter, Depends, Header
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased
from database.db import getConnection
from models.schemas import TasksSchema
from models.models import Tasks, Users
from models.jwt import validateToken
from datetime import datetime, timezone

router = APIRouter(prefix="/tasks")

@router.post("/task")
def createTask(T: TasksSchema, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)

    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    user = db.query(Users.id).filter( Users.emailid == decoded["sid"] ).first()

    task = Tasks(
        title = T.title,
        description = T.description,
        createdby = user.id,
        assignedto = T.assignedto,
        priority = T.priority,
        duedate = T.duedate,
        status = 0
    )

    db.add(task)
    db.commit()
    return {"code":200, "msg" : "New Task has been created"}

@router.get("/task/{page}/{size}")
def getallTasks(page: int, size: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    total = db.query(Tasks).filter(Tasks.softdelete == 0).count()

    skip = (page - 1) * size

    AssignedUser = aliased(Users)

    tasksdata = db.query(Tasks.id, Tasks.title, Tasks.description, Tasks.createdby, func.concat(Users.firstname, ' ', Users.lastname).label("createdbyname"), Tasks.assignedto, func.concat(AssignedUser.firstname, ' ', AssignedUser.lastname).label("assignedtoname"), Tasks.priority, Tasks.duedate, Tasks.status, Tasks.createdat, Tasks.updatedat
                         ).join(Users, Users.id == Tasks.createdby
                         ).join(AssignedUser, AssignedUser.id == Tasks.assignedto
                         ).filter(Tasks.softdelete == 0
                         ).offset(skip).limit(size).all()

    totalpages = (total + size - 1) // size

    return {
        "code": 200,
        "currentpage": page,
        "totalpage": totalpages,
        "pagesize": size,
        "pages": [i for i in range(1, totalpages + 1)],
        "tasks": [
            {"id": t.id, "title": t.title, "description": t.description, "createdby": t.createdby, "createdbyname": t.createdbyname, "assignedto": t.assignedto, "assignedtoname": t.assignedtoname, "priority": t.priority, "duedate": t.duedate, "status": t.status, "createdat": t.createdat, "updatedat": t.updatedat}
            for t in tasksdata
        ]
    }

@router.get("/tasksbyid/{page}/{size}")
def getallTasksbyId(page: int, size: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    userid = db.query(Users.id).filter(Users.emailid == decoded["sid"]).scalar()

    total = db.query(Tasks).filter(Tasks.softdelete == 0, Tasks.createdby == userid).count()

    skip = (page - 1) * size

    AssignedUser = aliased(Users)

    tasksdata = db.query(Tasks.id, Tasks.title, Tasks.description, Tasks.assignedto, func.concat(AssignedUser.firstname, ' ', AssignedUser.lastname).label("assignedtoname"), Tasks.priority, Tasks.duedate, Tasks.status, Tasks.createdat, Tasks.updatedat
                         ).join(Users, Users.id == Tasks.createdby
                         ).join(AssignedUser, AssignedUser.id == Tasks.assignedto
                         ).filter(Tasks.softdelete == 0, Tasks.createdby == userid
                         ).offset(skip).limit(size).all()

    totalpages = (total + size - 1) // size

    return {
        "code": 200,
        "currentpage": page,
        "totalpage": totalpages,
        "pagesize": size,
        "pages": [i for i in range(1, totalpages + 1)],
        "tasks": [
            {"id": t.id, "title": t.title, "description": t.description, "assignedto": t.assignedto, "assignedtoname": t.assignedtoname, "priority": t.priority, "duedate": t.duedate, "status": t.status, "createdat": t.createdat, "updatedat": t.updatedat}
            for t in tasksdata
        ]
    }

@router.get("/task/{id}")
def getTask(id: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}

    AssignedUser = aliased(Users)

    tasksdata = db.query(Tasks.id, Tasks.title, Tasks.description, Tasks.createdby, func.concat(Users.firstname, ' ', Users.lastname).label("createdbyname"), Tasks.assignedto, func.concat(AssignedUser.firstname, ' ', AssignedUser.lastname).label("assignedtoname"), Tasks.priority, Tasks.duedate, Tasks.status, Tasks.createdat, Tasks.updatedat
                         ).join(Users, Users.id == Tasks.createdby
                         ).join(AssignedUser, AssignedUser.id == Tasks.assignedto
                         ).filter(Tasks.id == id).first()

    if not tasksdata:
        return{"code": 404, "msg": "Not Found"}

    return {
        "code": 200,
        "task": {"id": tasksdata.id, "title": tasksdata.title, "description": tasksdata.description, "createdby": tasksdata.createdby, "createdbyname": tasksdata.createdbyname, "assignedto": tasksdata.assignedto, "assignedtoname": tasksdata.assignedtoname, "priority": tasksdata.priority, "duedate": tasksdata.duedate, "status": tasksdata.status, "createdat": tasksdata.createdat, "updatedat": tasksdata.updatedat}
    }

@router.delete("/task/{id}")
def deleteTask(id: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    task = db.query(Tasks).filter(Tasks.id == id).first()
    task.softdelete = 1  #SOFT Delete

    db.commit()

    return {
        "code": 200,
        "id": id,
        "msg": "Task has been deleted"
    }

@router.put("/task/{id}")
def updateTask(id: int, T: TasksSchema, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    task = db.query(Tasks).filter(Tasks.id == id).first()
    task.title = T.title
    task.description = T.description
    task.assignedto = T.assignedto
    task.priority = T.priority
    task.duedate = T.duedate
    task.status = T.status
    task.updatedat = datetime.now(timezone.utc)

    db.commit()

    AssignedUser = aliased(Users)

    tasksdata = db.query(Tasks.id, Tasks.title, Tasks.description, Tasks.createdby, func.concat(Users.firstname, ' ', Users.lastname).label("createdbyname"), Tasks.assignedto, func.concat(AssignedUser.firstname, ' ', AssignedUser.lastname).label("assignedtoname"), Tasks.priority, Tasks.duedate, Tasks.status, Tasks.createdat, Tasks.updatedat
                         ).join(Users, Users.id == Tasks.createdby
                         ).join(AssignedUser, AssignedUser.id == Tasks.assignedto
                         ).filter(Tasks.id == id).first()
    
    return {
        "code": 200,
        "task": {"id": tasksdata.id, "title": tasksdata.title, "description": tasksdata.description, "createdby": tasksdata.createdby, "createdbyname": tasksdata.createdbyname, "assignedto": tasksdata.assignedto, "assignedtoname": tasksdata.assignedtoname, "priority": tasksdata.priority, "duedate": tasksdata.duedate, "status": tasksdata.status, "createdat": tasksdata.createdat, "updatedat": tasksdata.updatedat},
        "msg": "Task has been updated"
    }

@router.get("/assignedtask/{page}/{size}")
def getAssignedTasks(page: int, size: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    userid = db.query(Users.id).filter(Users.emailid == decoded["sid"]).scalar()
    total = db.query(Tasks).filter(Tasks.softdelete == 0, Tasks.assignedto == userid).count()
    skip = (page - 1) * size

    tasksdata = db.query(Tasks.id, Tasks.title, Tasks.description, Tasks.createdby, func.concat(Users.firstname, ' ', Users.lastname).label("createdbyname"), Tasks.priority, Tasks.duedate, Tasks.status, Tasks.createdat, Tasks.updatedat
                         ).join(Users, Users.id == Tasks.createdby
                         ).filter(Tasks.softdelete == 0, Tasks.assignedto == userid
                         ).offset(skip).limit(size).all()

    totalpages = (total + size - 1) // size

    return {
        "code": 200,
        "currentpage": page,
        "totalpage": totalpages,
        "pagesize": size,
        "pages": [i for i in range(1, totalpages + 1)],
        "tasks": [
            {"id": t.id, "title": t.title, "description": t.description, "createdby": t.createdby, "createdbyname": t.createdbyname, "priority": t.priority, "duedate": t.duedate, "status": t.status, "createdat": t.createdat, "updatedat": t.updatedat}
            for t in tasksdata
        ]
    }

@router.put("/task/{id}/{status}")
def updateTaskStatus(id: int, status: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    task = db.query(Tasks).filter(Tasks.id == id).first()
    task.status = status
    task.updatedat = datetime.now(timezone.utc)

    db.commit()

    AssignedUser = aliased(Users)

    tasksdata = db.query(Tasks.id, Tasks.title, Tasks.description, Tasks.createdby, func.concat(Users.firstname, ' ', Users.lastname).label("createdbyname"), Tasks.assignedto, func.concat(AssignedUser.firstname, ' ', AssignedUser.lastname).label("assignedtoname"), Tasks.priority, Tasks.duedate, Tasks.status, Tasks.createdat, Tasks.updatedat
                         ).join(Users, Users.id == Tasks.createdby
                         ).join(AssignedUser, AssignedUser.id == Tasks.assignedto
                         ).filter(Tasks.id == id).first()
    
    return {
        "code": 200,
        "task": {"id": tasksdata.id, "title": tasksdata.title, "description": tasksdata.description, "createdby": tasksdata.createdby, "createdbyname": tasksdata.createdbyname, "assignedto": tasksdata.assignedto, "assignedtoname": tasksdata.assignedtoname, "priority": tasksdata.priority, "duedate": tasksdata.duedate, "status": tasksdata.status, "createdat": tasksdata.createdat, "updatedat": tasksdata.updatedat},
        "msg": "Task status has been updated"
    }