from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database.db import getConnection
from database.mongodb import getMongoConnection
from models.schemas import UsersSchema, JwtSchema
from models.models import Users, Menus, RoleMenus, Roles
from models.jwt import generateToken, validateToken
from datetime import datetime, timezone

router = APIRouter(prefix="/users")

@router.post("/signup")
def registration(U: UsersSchema, db: Session = Depends(getConnection)):
    user = Users(
        firstname = U.firstname.upper(),
        lastname = U.lastname.upper(),
        phone = U.phone,
        emailid = U.emailid,
        password = U.password
    )
    db.add(user)
    db.commit()
    return {"code":200, "msg" : "Registered Successfully"}

@router.post("/signin")
async def signin(request: Request, U: UsersSchema, db: Session = Depends(getConnection), mongo = Depends(getMongoConnection)):

    user = db.query(Users).filter(
        Users.emailid == U.emailid,
        Users.password == U.password
    ).first()

    logdata = {
        "email": U.emailid,
        "logintime": datetime.now(timezone.utc),
        "ipaddress": request.client.host,
        "status": "FAILED"
    }

    if not user:
        await mongo["loginlogs"].insert_one(logdata)
        return {"code":401, "msg": "Invalid email or password"}

    logdata["status"] = "SUCCESS";

    await mongo["loginlogs"].insert_one(logdata)

    return {
        "code":200,
        "token": generateToken(user.emailid, user.role)
    }

@router.post("/logout")
async def logout(request: Request, token: str = Header(...), mongo = Depends(getMongoConnection)):
    emailid = validateToken(token)

    logdata = {
        "email": emailid,
        "logouttime": datetime.now(timezone.utc),
        "ipaddress": request.client.host,
        "status": "Invalid Token!" if not emailid else "SUCCESS"
    }

    await mongo["loginlogs"].insert_one(logdata)

    return {"code":200, "resp" : True }

@router.post("/uinfo")
def uinfo(jwt: JwtSchema, db: Session = Depends(getConnection)):
    decoded = validateToken(jwt.token)
    
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}

    user = db.query(Users.firstname, Users.lastname, Users.role).filter(
        Users.emailid == decoded["sid"]
    ).first()
    
    menus = db.query( Menus.id, Menus.name, Menus.icon ).join(RoleMenus).filter(
                        RoleMenus.role_id == user.role
                    ).all()

    menu_list = [
        {"id": m.id, "name": m.name, "icon": m.icon}
        for m in menus
    ]

    return {
        "code": 200,
        "emailid": decoded["sid"],
        "uname": user.firstname + " " + user.lastname,
        "menus": menu_list
    }

@router.get("/profile")
def profile(token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)

    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    emailid = decoded["sid"]

    user = db.query(Users.id, Users.firstname, Users.lastname, Users.phone, Users.emailid, Roles.rolename
                    ).join(Roles, Users.role == Roles.role
                    ).filter( Users.emailid == emailid ).first()
    
    if not user:
        return {"code": 404, "msg": "User not found"}

    return {
        "code": 200,
        "user": {"id": user.id, "firstname": user.firstname, "lastname": user.lastname, "phone": user.phone, "email": user.emailid, "role": user.rolename}
    }

@router.get("/getallusers/{page}/{size}")
def getallusers(page: int, size: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    total = db.query(Users).filter(Users.softdelete == 0).count()

    skip = (page - 1) * size

    usersdata = db.query(Users.id, Users.firstname, Users.lastname, Users.phone, Users.emailid, Users.role, Roles.rolename
                         ).join(Roles, Users.role == Roles.role
                         ).filter(Users.softdelete == 0
                         ).offset(skip).limit(size).all()

    rolesData = db.query(Roles.role, Roles.rolename).all()

    totalpages = (total + size - 1) // size

    return {
        "code": 200,
        "currentpage": page,
        "totalpage": totalpages,
        "pagesize": size,
        "pages": [i for i in range(1, totalpages + 1)],
        "users": [
            {"id": u.id, "firstname": u.firstname, "lastname": u.lastname, "phone": u.phone, "emailid": u.emailid, "role": u.role, "rolename": u.rolename}
            for u in usersdata
        ],
        "roles": [
            {"role": r.role, "rolename": r.rolename}
            for r in rolesData
        ]
    }

@router.delete("/user/{id}")
def deleteuser(id: int, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    user = db.query(Users).filter(Users.id == id).first()
    user.softdelete = 1  #SOFT Delete

    # db.delete(user)
    db.commit()

    return {
        "code": 200,
        "msg": "Record has been deleted"
    }

@router.put("/user/{id}")
def updateuser(id: int, U: UsersSchema, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    user = db.query(Users).filter(Users.id == id).first()
    user.firstname = U.firstname.upper()
    user.lastname = U.lastname.upper()
    user.phone = U.phone
    user.emailid = U.emailid
    user.role = U.role

    db.commit()
    # db.refresh(user)

    return {
        "code": 200,
        "msg": "Record has been updated"
    }

@router.get("/searchuser/{key}")
def searchuser(key: str, token: str = Header(...), db: Session = Depends(getConnection)):
    decoded = validateToken(token)
    if not decoded:
        return {"code": 401, "msg": "Invalid Token!"}
    
    usersdata = db.query(
        Users.id,
        Users.firstname,
        Users.lastname
    ).filter(
        or_(
            Users.firstname.ilike(f"%{key}%"),
            Users.lastname.ilike(f"%{key}%")
        )
    ).order_by(
        Users.firstname.asc(),
        Users.lastname.asc()
    ).limit(5).all()

    return [
        {
            "id": u.id,
            "firstname": u.firstname,
            "lastname": u.lastname
        }
        for u in usersdata
    ]