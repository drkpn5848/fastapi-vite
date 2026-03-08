import { useEffect, useState } from 'react';
import './Home.css';
import { APIURL, callApi, getSession, IMGURL, setSession } from './lib';
import Toast from './Toast';
import Menubar from './Menubar';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Progress from './Progress';
import Users from './Users';
import Taskmanager from './Taskmanager';
import Mytasks from './Mytasks';

const Home = ({onNavigate}) => {
    const [toast, setToast] = useState({type: "", message: "", id: 0});
    const [isProgress, setIsProgress] = useState(false);
    const [uinfo, setUinfo] = useState({uname: "", menus: []});
    const [activeComponent, setActiveComponent] = useState("");
    const [title, setTitle] = useState("");
    const [csrid, setCSRID] = useState("");

    useEffect(()=>{
        const sid = getSession("csrid");
        if(!sid) {window.location.replace("/"); return;};
        
        setIsProgress(true);
        setCSRID(sid);
        setActiveComponent("");
        const data = {token: sid};
        callApi("POST", APIURL + "users/uinfo", JSON.stringify(data), getUinfo, errorHandler);
    },[]);

    function errorHandler(err){
        showToast("error", err);
        setIsProgress(false);
    }

    function showToast(typ, msg){
        setToast({ type: typ, message: msg, id: Date.now() });
    }

    function getUinfo(res){
        if(res.code === 401){
            showToast("error", res.msg);
            logout();
        }         
        else
            setUinfo(res);
        handleMenuClick(1);
        setIsProgress(false);
    }

    function logout(){
        setSession("csrid", "", -1);
        setIsProgress(true);
        callApi("POST", APIURL + "users/logout", "", () => {setIsProgress(false); window.location.replace("/"); return;}, errorHandler, csrid);    
    }

    function handleMenuClick(menuId){
        const components = {
            1: {comp: <Dashboard onLogout={logout} errorHandler={errorHandler} showToast={showToast} />, title: "Dashboard"},
            2: {comp: <Mytasks onLogout={logout} errorHandler={errorHandler} showToast={showToast} />, title: "My Task"},
            3: {comp: <Taskmanager onLogout={logout} errorHandler={errorHandler} showToast={showToast} />, title: "Task Manager"},
            4: {comp: <Users onLogout={logout} errorHandler={errorHandler} showToast={showToast} />, title: "User Management"},
            5: "",
            6: {comp: <Profile onLogout={logout} errorHandler={errorHandler} showToast={showToast} />, title: "My Profile"}
        };
        setActiveComponent(components[menuId].comp);
        setTitle(components[menuId].title);
    }


    return (
        <div className='home'>
            <div className='header'>
                <img src={IMGURL + "logo.png"} alt='' />
                <div>
                    <label>{uinfo.uname}</label>
                    <img src={IMGURL + "logout.png"} alt='' onClick={()=>logout()} />
                </div>
            </div>
            <div className='menus'>
                <div className='mtitle'><span>&#9776;</span> MENU</div>
                <nav>
                    <Menubar menuList={uinfo.menus} onMenuClick={handleMenuClick}/>
                </nav>
            </div>
            <div className='workspace'>
                <div className='wtitle'>{title}</div>
                <div className='wspace'>{activeComponent}</div>
            </div>
            <div className='footer'>Copyright @ 2026. All rights reserved.</div>

            <Progress isProgress={isProgress}/>
            <Toast toastData={toast} />
        </div>
    );
}

export default Home;
