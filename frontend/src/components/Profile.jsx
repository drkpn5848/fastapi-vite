import React, { useEffect, useState } from 'react';
import './Profile.css';
import * as lib from './lib';
import Progress from './Progress';

const Profile = ({ onLogout, errorHandler, showToast }) => {
    const [profileData, setProfileData] = useState([]);
    const [isProgress, setIsProgress] = useState(false);

    useEffect(()=>{
        const csrid = lib.getSession("csrid");
        if(!csrid) { onLogout(); return; }
        
        setIsProgress(true);
        lib.callApi("GET", lib.APIURL + "users/profile", "", loadData, (err)=>{ setIsProgress(false); errorHandler(err);}, csrid);
    },[]);

    function loadData(res){
        if(res.code !== 200){
            showToast("error", res.msg);
            setIsProgress(false);
            return;
        }
            
        setProfileData(res.user);
        setIsProgress(false);
    }

    return (
        <div className='profile'> 
            <div className='container'>
                <div className='info'>
                    <img src={lib.IMGURL + "user.png"} alt='' />
                    <div>
                        <label>{profileData.firstname} {profileData.lastname}</label>
                        <span>{profileData.role}</span>
                    </div>
                </div>
                <div className='info-data'>
                    <p>
                        <span>First Name</span>
                        <span>{profileData.firstname}</span>
                    </p>
                    <p>
                        <span>Last Name</span>
                        <span>{profileData.lastname}</span>
                    </p>
                    <p>
                        <span>Phone#</span>
                        <span>{profileData.phone}</span>
                    </p>
                    <p>
                        <span>Email</span>
                        <span>{profileData.email}</span>
                    </p>
                    <p>
                        <span>Role</span>
                        <span>{profileData.role}</span>
                    </p>
                </div>
            </div>
            
            <Progress isProgress={isProgress}/>
        </div>
    );
}

export default Profile;
