from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True, autoincrement = True)
    firstname = Column(String(50), nullable = False)
    lastname = Column(String(50), nullable = False)
    phone   = Column(String(50), nullable = False)
    emailid = Column(String(50), nullable = False, unique = True)
    password = Column(String(50), nullable = False)
    role    =   Column(Integer, nullable = False, server_default="1")
    softdelete = Column(Integer, nullable=False, server_default="0")
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)

class Roles(Base):
    __tablename__ = "roles"

    role = Column(Integer, primary_key = True)
    rolename = Column(String(50), nullable = False)

    role_menus = relationship("RoleMenus", backref="role")

class Menus(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(100), nullable=True)

class RoleMenus(Base):
    __tablename__ = "role_menus"

    role_id = Column(Integer, ForeignKey("roles.role"), primary_key=True)
    menu_id = Column(Integer, ForeignKey("menus.id"), primary_key=True)

class Tasks(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key = True, index = True, autoincrement = True)
    title = Column(String(200), nullable = False)
    description = Column(String(200), nullable = False)
    createdby   = Column(Integer, nullable = False)
    assignedto = Column(Integer, nullable = False)
    priority = Column(Integer, nullable = False, server_default="0")
    duedate    =   Column(DateTime, nullable = False)
    status = Column(Integer, nullable=False, server_default="0")
    createdat = Column(DateTime, server_default=func.now(), nullable=False)
    updatedat = Column(DateTime, server_default=func.now(), nullable=False)
    softdelete = Column(Integer, nullable=False, server_default="0")