import React, { useEffect, useState } from 'react';
import './Users.css';
import * as lib from './lib';
import Progress from './Progress';

const Users = ({ onLogout, errorHandler, showToast }) => {
    const [csrid, setCSRID] = useState("");
    const [usersData, setUsersData] = useState([]);
    const [isProgress, setIsProgress] = useState(false);
    const [paging, setPaging] = useState({page: 0, size: 0, pages: []});
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState({});
    const [roles, setRoles] = useState([]);
    const [validationData, setValidationData] = useState({});
    
    useEffect(() => {
        const sid = lib.getSession("csrid");

        if (!sid || sid.trim() === "") {
            onLogout();   // 🔥 call parent logout
            return;
        }

        setIsProgress(true);
        setCSRID(sid);

        const section = document.getElementById("section");
        const ps = section ? parseInt((section.offsetHeight - 35) / 35) : 10;

        lib.callApi("GET",lib.APIURL + `users/getallusers/1/${ps}`,"",loadUsers, (err)=>{ setIsProgress(false); errorHandler(err);},sid);
    }, []);

    function loadUsers(res){
        if(res.code !== 200){
            showToast("error", res.msg);
            setIsProgress(false);
            return;
        }
        setUsersData(res.users);
        setRoles(res.roles);
        setPaging({...paging, page: res.currentpage, size: res.pagesize, pages: res.pages});
        setIsProgress(false);
    }

    function loadPaging(cpage){
        setIsProgress(true);
        lib.callApi("GET", lib.APIURL + `users/getallusers/${cpage}/${paging.size}` , "", loadUsers, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
    }

    function editRow(index){
        setTableData(usersData[index]);
        setIsEdit(true);
        setTimeout(() => {
            document.getElementById("fname").focus();
        }, 0);
    }

    function cancelEdit(){
        setValidationData({});
        setIsEdit(false);
    }

    function deleteRow(index){
        const resp = confirm("Do you want to delete? click OK");
        if(!resp)
            return;
        setIsProgress(true);
        lib.callApi("DELETE", lib.APIURL + "users/user/" + usersData[index].id, "", deleteResponse, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
    }

    function deleteResponse(res){
        if(res.code !== 200){
            showToast("error", res.msg);
            return;
        }

        showToast("success", res.msg);
        loadPaging(paging.page);
    }

    function handleInput(e){
        const {name, value} = e.target;
        setTableData({...tableData, [name]: value});
    }

    function validate(){
        let validate = {};
        if(tableData.firstname === "") validate.firstname = true;
        if(tableData.lastname === "") validate.lastname = true;
        if(tableData.phone === "") validate.phone = true;
        if(tableData.emailid === "") validate.emailid = true;
        setValidationData(validate);
        return Object.keys(validate).length === 0;
    }

    function updateUser(id){
        if(!validate())
            return;
        
        setIsProgress(true);
        if(id !== 0)
            lib.callApi("PUT", lib.APIURL + "users/user/" + id, JSON.stringify(tableData), updateResponse, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
        else
            lib.callApi("POST", lib.APIURL + "users/signup", JSON.stringify(tableData), updateResponse, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
    }

    function updateResponse(res){
        if(res.code !== 200){
            showToast("error", res.msg);
            return;
        }

        showToast("success", res.msg);
        setIsEdit(false);
        loadPaging(paging.page);
    }

    function addNew(){
        setTableData({id: 0, firstname: "", lastname: "", phone: "", emailid: "", role: 1, password: "123"});
        setIsEdit(true);
        setTimeout(() => {
            document.getElementById("fname").focus();
        }, 0);
    }

    return (
        <div className='users'>
            <div className='section' id='section'>
                <table>
                    <thead>
                        <tr>
                            <th style={{'width':'50px'}}>S#</th>
                            <th style={{'width':'150px'}}>First Name</th>
                            <th style={{'width':'150px'}}>Last Name</th>
                            <th style={{'width':'130px'}}>Phone#</th>
                            <th style={{'width':'250px'}}>Email ID</th>
                            <th style={{'width':'100px'}}>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData.map((user, index)=>(
                            <tr key={index}>
                                <td style={{'text-align':'center'}}>{(paging.page - 1) * paging.size + index + 1}</td>
                                <td>{user.firstname}</td>
                                <td>{user.lastname}</td>
                                <td>{user.phone}</td>
                                <td>{user.emailid}</td>
                                <td>{user.rolename}</td>
                                <td>
                                    <div style={{'width':'60px'}}>
                                        <img src={lib.IMGURL + "edit.png"} alt='' onClick={()=>editRow(index)} />
                                        <img src={lib.IMGURL + "bin.png"} alt='' onClick={()=>deleteRow(index)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='footer'>
                <button onClick={()=>addNew()}>Add New</button>
                <div className='paging'>
                    {paging.pages.map((p)=>(
                        <label key={p} className={paging.page === p ? 'active' : ''} onClick={()=>loadPaging(p)}>{p}</label>
                    ))}
                </div>
            </div>

            {isEdit && 
                <div className='popup'>
                    <div className='panel'>
                        <span onClick={()=>cancelEdit()}>&times;</span>
                        <p>Edit User Information</p>
                        <legend>First Name*</legend>
                        <input type='text' id='fname' className={validationData.firstname ? 'error' : ''} autoComplete='off' style={{'text-transform':'uppercase'}} name='firstname' value={tableData.firstname} onChange={(e)=>handleInput(e)} />
                        <legend>Last Name*</legend>
                        <input type='text' className={validationData.lastname ? 'error' : ''} autoComplete='off' style={{'text-transform':'uppercase'}} name='lastname' value={tableData.lastname} onChange={(e)=>handleInput(e)} />
                        <legend>Phone Number*</legend>
                        <input type='text' className={validationData.phone ? 'error' : ''} autoComplete='off' name='phone' value={tableData.phone} onChange={(e)=>handleInput(e)} />
                        <legend>Email ID*</legend>
                        <input type='text' className={validationData.emailid ? 'error' : ''} autoComplete='off' name='emailid' value={tableData.emailid} onChange={(e)=>handleInput(e)} />
                        <legend>Role*</legend>
                        <select disabled={tableData.id === 0} name='role' value={tableData.role} onChange={(e)=>handleInput(e)}>
                            {roles.map((r)=>(
                                <option key={r.role} value={r.role}>{r.rolename}</option>
                            ))}
                        </select>
                        <button onClick={()=>updateUser(tableData.id)}>Update</button>
                    </div>
                </div>
            }

            <Progress isProgress={isProgress}/>
        </div>
    );
}

export default Users;
