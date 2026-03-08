import React, { useEffect, useState } from 'react';
import './Progress.css';

const Progress = ({isProgress}) => {
    const [showProgress, setShowProgress] = useState(false);

    useEffect(()=>{
        setShowProgress(isProgress);
    },[isProgress]);

    return (
        <>
            {showProgress && <div className='progress'></div>}
        </>
    );
}

export default Progress;
