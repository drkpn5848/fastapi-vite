import React, { useEffect, useRef, useState } from 'react';
import './Taskmanager.css';
import * as lib from './lib';
import Progress from './Progress';
import Taskcard from "./Taskcard";

const Mytasks = ({ onLogout, errorHandler, showToast }) => {
    const loadingRef = useRef(false);
    const [csrid, setCSRID] = useState("");
    const [tasksData, setTasksData] = useState({});
    const [isProgress, setIsProgress] = useState(false);
    const [isEdit, setIsEdit] = useState(null);
    const [isError, setIsError] = useState(null);

    useEffect(()=>{
        const sid = lib.getSession("csrid");
        if(!sid) { onLogout(); return; }

        loadingRef.current = true;
        setIsProgress(true);
        setCSRID(sid);
        lib.callApi("GET", lib.APIURL + "tasks/assignedtask/1/5", "", loadTasks, (err)=>{ loadingRef.current = false; setIsProgress(false); errorHandler(err);}, sid);
    }, [])

    function loadPaging(event){
        let div = event.target;
        if(loadingRef.current) return;
        
        if(!tasksData.currentpage || tasksData.currentpage >= tasksData.totalpage) return;

        if(div.scrollTop + div.clientHeight >= div.scrollHeight - 10)
        {
            loadingRef.current = true;
            setIsProgress(true);
            lib.callApi("GET", lib.APIURL + `tasks/assignedtask/${tasksData.currentpage + 1}/5`, "", loadTasks, (err)=>{loadingRef.current = false; setIsProgress(false); errorHandler(err); }, csrid);
        }
    }

    function loadTasks(res){
        setTasksData(tasksData => ({
            ...res,
            tasks: tasksData.tasks ? [...tasksData.tasks, ...res.tasks] : res.tasks //Check if allready exists and appends
        }));
        loadingRef.current = false;
        setIsProgress(false);
    }

    function editTask(task){
        const formattedDate = task.duedate ? task.duedate.split(" ")[0].split("T")[0] : "";
        setIsEdit({...task, duedate: formattedDate});
    }

    function deleteTask(task){

    }

    function closePopup(){
        setIsEdit(null);
    }

    function handleInput(e){
        const {name, value} = e.target;
        setIsEdit({...isEdit, [name]: value});
    }

    return (
        <div className='tm'>
            <div className='section' style={{height: 'calc(100% - 40px)'}}  onScroll={(e)=>loadPaging(e)}>
                {tasksData.tasks?.map((task)=>(
                    <Taskcard key={task.id} task={task} editTask={editTask} deleteTask={deleteTask} dflag={false}/>
                ))}
            </div>
            {isEdit && 
                <div className='popup'>
                    <div className='panel'>
                        <span className='close' onClick={()=>closePopup()}>&times;</span>
                        <h3>Edit Task</h3>
                        <label>Title*</label>
                        <input type='text' autoComplete='off' disabled value={isEdit.title} />
                        <label>Description*</label>
                        <textarea type='text' name='description' disabled value={isEdit.description} />
                        <label>Task Priority*</label>
                        <input type='text' autoComplete='off' disabled value={isEdit.priority === 0 ? 'Normal' : 'High'} />
                        <label>Due Date (mm/dd/yyyy)*</label>
                        <input type='date' autoComplete='off' disabled value={isEdit.duedate} />
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

export default Mytasks;