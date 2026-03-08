import React, { useEffect, useRef, useState } from 'react';
import './Taskmanager.css';
import * as lib from './lib';
import Progress from './Progress';
import Taskcard from "./Taskcard";

const Taskmanager = ({ onLogout, errorHandler, showToast }) => {
    const section = useRef();
    const loadingRef = useRef(false);
    const [csrid, setCSRID] = useState("");
    const [tasksData, setTasksData] = useState({});
    const [isProgress, setIsProgress] = useState(false);
    const [isEdit, setIsEdit] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchvalue, setSearchValue] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [isError, setIsError] = useState(null);
    
    useEffect(()=>{
        const sid = lib.getSession("csrid");
        if(!sid) { onLogout(); return; }

        loadingRef.current = true;
        setIsProgress(true);
        setCSRID(sid);
        lib.callApi("GET", lib.APIURL + "tasks/tasksbyid/1/5", "", loadTasks, (err)=>{ loadingRef.current = false;setIsProgress(false); errorHandler(err);}, sid);
    }, [])

    function loadPaging(event){
        let div = event.target;
        if(loadingRef.current) return;
        
        if(!tasksData.currentpage || tasksData.currentpage >= tasksData.totalpage) return;

        if(div.scrollTop + div.clientHeight >= div.scrollHeight - 10)
        {
            loadingRef.current = true;
            setIsProgress(true);
            lib.callApi("GET", lib.APIURL + `tasks/tasksbyid/${tasksData.currentpage + 1}/5`, "", loadTasks, (err)=>{loadingRef.current = false;setIsProgress(false); errorHandler(err); }, csrid);
        }
    }

    function loadTasks(res){
        setTasksData(tasksData => ({
            ...res, //Spreads new API response
            tasks: tasksData.tasks ? [...tasksData.tasks, ...res.tasks] : res.tasks //Check if allready exists and appends
        }));
        loadingRef.current = false;
        setIsProgress(false);
    }

    function editTask(task){
        const formattedDate = task.duedate ? task.duedate.split(" ")[0].split("T")[0] : ""; // remove time
        setIsError(null);
        setIsEdit({...task, duedate: formattedDate});
        setSearchValue(task.assignedto + "-" + task.assignedtoname);
    }

    function closePopup(){
        setIsEdit(null);
    }

    function handleInput(e){
        const {name, value} = e.target;
        setIsEdit({...isEdit, [name]: value});
    }

    function searchUser(e){
        const {value} = e.target;
        setSearchValue(value);
        if(value.length === 0){
            setOptions([]);
            setShowDropdown(false);
            return;
        }
        if(value.length % 2 === 0 || value.length % 3 === 0)
            lib.callApi("GET", lib.APIURL + "users/searchuser/" + value,"", searchUserResponse, errorHandler, csrid);
    }

    function searchUserResponse(res){
        setHighlightIndex(-1);
        setOptions(res);
        setShowDropdown(res.length > 0);
    }

    function selectUser(user){
        setSearchValue(user.id + "-" + user.firstname + " " + user.lastname);
        setIsEdit({...isEdit, ['assignedto']: user.id});
        setShowDropdown(false);
    }

    function completeSearchUser(e){
        setShowDropdown(false);
        if(options.length === 0)
            return;

        const index = highlightIndex >= 0 ? highlightIndex : 0;
        const user = options[index];

        setSearchValue(user.id + "-" + user.firstname + " " + user.lastname);
    }

    function handleKeyDown(e) {
        if (!showDropdown || options.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex(highlightIndex => highlightIndex < options.length - 1 ? highlightIndex + 1 : 0);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex(highlightIndex => highlightIndex > 0 ? highlightIndex - 1 : options.length - 1);
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0) 
                selectUser(options[highlightIndex]);
        }
    }

    function validateInput(){
        let errors = {};

        Object.keys(isEdit).forEach(field => {
            if(isEdit[field] === null || isEdit[field] === undefined || isEdit[field].toString().trim() === "")
                errors[field] = true;
        });
        if(searchvalue.toString().trim() === "")
            errors.assignedto = true;

        setIsError(errors);
        return Object.keys(errors).length > 0;
    }

    function updateTask(){
        if(validateInput())
            return;
        
        setIsProgress(true);
        const data = JSON.stringify({
            title: isEdit.title,
            description: isEdit.description,
            createdby: isEdit.createdby,
            assignedto: isEdit.assignedto,
            priority: isEdit.priority,
            duedate: isEdit.duedate,
            status: isEdit.status
        });
        lib.callApi("PUT", lib.APIURL + "tasks/task/" + isEdit.id, data, updateTaskResponse, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
    }

    function updateTaskResponse(res){
        if(res.code !== 200)
            showToast("error", res.msg);
        else{
            setTasksData(tasksData => ({
                ...tasksData,
                tasks: tasksData.tasks.map(t => t.id === res.task.id ? res.task : t)
            }));
            showToast("success", res.msg);
        }
        setIsEdit(null); 
        setIsProgress(false);
    }

    function deleteTask(task){
        const res = confirm("Click OK to delete the selected task");
        if(!res) return;
        setIsProgress(true);
        lib.callApi("DELETE", lib.APIURL + "tasks/task/" + task.id, "", deleteTaskResponse, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
    }

    function deleteTaskResponse(res){
        if(res.code !== 200)
            showToast("error", res.msg);
        else{
            setTasksData(tasksData => ({
                ...tasksData,
                tasks: tasksData.tasks.filter(t => t.id !== res.id)
            }));
            showToast("success", res.msg);
        }
        setIsProgress(false);
    }

    return (
        <div className='tm'>
            <div className='section' ref={section} onScroll={(e)=>loadPaging(e)}>
                {tasksData.tasks?.map((task)=>(
                    <Taskcard key={task.id} task={task} editTask={editTask} deleteTask={deleteTask} dflag={true}/>
                ))}
            </div>
            <div className='foot'>
                <button>New Task</button>
            </div>

            {isEdit && 
                <div className='popup'>
                    <div className='panel'>
                        <span className='close' onClick={()=>closePopup()}>&times;</span>
                        <h3>Edit Task</h3>
                        <label>Title*</label>
                        <input type='text' autoComplete='off' className={isError?.title ? 'error' : ''} name='title' value={isEdit.title} onChange={(e)=>handleInput(e)} />
                        <label>Description*</label>
                        <textarea type='text' name='description' className={isError?.description ? 'error' : ''} value={isEdit.description} onChange={(e)=>handleInput(e)} />
                        <label>Task Priority*</label>
                        <select name='priority' className={isError?.priority ? 'error' : ''} value={isEdit.priority} onChange={(e)=>handleInput(e)}>
                            <option value=""></option>
                            <option value={0}>Normal</option>
                            <option value={1}>High</option>
                        </select>
                        <label>Assigned To*</label>
                        <div className="dropdown">
                            <input type="text" autoComplete="off" className={isError?.assignedto ? 'error' : ''} name='assignedto' value={searchvalue} onChange={(e)=>searchUser(e)}  onBlur={(e)=>completeSearchUser(e)} onKeyDown={(e)=>handleKeyDown(e)} />
                            {showDropdown && 
                                <ul>
                                    {options.map((item, index) => (
                                        <li key={item.id} className={highlightIndex === index ? "active" : ""} onMouseDown={() => selectUser(item)}>{item.id}-{item.firstname} {item.lastname}</li>
                                    ))}
                                </ul>
                            }
                        </div>
                        <label>Due Date (mm/dd/yyyy)*</label>
                        <input type='date' autoComplete='off' className={isError?.duedate ? 'error' : ''} name='duedate' value={isEdit.duedate} onChange={(e)=>handleInput(e)} />
                        <label>Task Status*</label>
                        <select className={isError?.status ? 'error' : ''} name='status' value={isEdit.status} onChange={(e)=>handleInput(e)}>
                            <option value=""></option>
                            <option value={0}>Assigned</option>
                            <option value={1}>In-Progress</option>
                            <option value={2}>Completed</option>
                        </select>
                        <button onClick={()=>updateTask()}>Update</button>
                    </div>
                </div>
            }

            <Progress isProgress={isProgress}/>
        </div>
    );
}

export default Taskmanager;
