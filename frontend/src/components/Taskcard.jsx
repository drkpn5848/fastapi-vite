import React from "react";
import * as lib from './lib';

const Taskcard = React.memo(({ task, editTask, deleteTask, dflag }) => {
    return (
        <div className='task'>
            <div className='head'>
                <h3>{task.title}</h3>
                <div>
                    <label style={{
                        background:
                            task.status == 0 ? 'var(--error)' :
                            task.status == 1 ? 'var(--dblue)' :
                            'var(--success)'
                    }}>
                        {task.status == 0 ? 'Assigned' :
                         task.status == 1 ? 'In-Progress' :
                         'Completed'}
                    </label>
                    <img src={lib.IMGURL + "edit.png"} alt='edit' onClick={() => editTask(task)} />
                    {dflag && <img src={lib.IMGURL + "bin.png"} alt='delete' onClick={() => deleteTask(task)} /> }
                </div>
            </div>

            <p>{task.description}</p>

            <div className='status'>
                <legend style={{display: (task.createdby? '' : 'none')}}><div>Created by:</div><span>{task.createdbyname ? task.createdbyname : ''}</span></legend>
                <legend>
                    <div>Task Priority:</div>
                    <span style={{ color: task.priority == 0 ? '' : 'var(--error)' }}>
                        {task.priority == 0 ? 'Normal' : 'High'}
                    </span>
                </legend>
                <legend className='right'><div>Created at:</div><span>{task.createdat}</span></legend>
            </div>

            <div className='status'>
                <legend><div style={{display: (task.assignedto? '' : 'none')}}>Assigned to:</div><span>{task.assignedtoname ? task.assignedtoname : ''}</span></legend>
                <legend className='right'><div>Updated at:</div><span>{task.updatedat}</span></legend>
            </div>
        </div>
    );
});

export default Taskcard;