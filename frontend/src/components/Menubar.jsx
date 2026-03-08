import React, { useEffect, useState } from 'react';
import './Menubar.css';
import { IMGURL } from './lib';

const Menubar = ({menuList = [], onMenuClick}) => {
    const [activeMenu, setActiveMenu] = useState(1);

    function handleMenuClick(menuid){
        setActiveMenu(menuid);
        onMenuClick(menuid);
    }

    return (
        <div className='menubar'>
            <ul>
                {menuList.map((m)=>(
                    <li key={m.id} className={activeMenu === m.id ? 'active' : ''} onClick={()=>handleMenuClick(m.id)}>
                        <img src={IMGURL + m.icon} alt='' />
                        <span>{m.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Menubar;
