import { useEffect, useState } from 'react';
import App from './components/App';
import Home from './components/Home';
import { cipher } from './components/lib';

const Index = () => {

    const [route, setRoute] = useState("");

    useEffect(()=>{
        const rout = localStorage.getItem("sid") ? cipher(localStorage.getItem("sid")) : "app";
        localStorage.setItem("sid", cipher(rout));
        setRoute(rout);
    },[]);

    function navigation(rout){
        // localStorage.setItem("sid", cipher(rout));
        // setRoute(rout);
        window.location.replace(rout);
    }

    const components = {
        app: <App onNavigate={navigation} />,
        home: <Home onNavigate={navigation} />
    };

    return (
        <>
            {components[route]}
        </>
    );
}

export default Index;