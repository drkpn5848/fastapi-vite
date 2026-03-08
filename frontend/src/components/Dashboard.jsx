import { useEffect, useRef, useState } from 'react';
import './Dashboard.css';
import * as lib from './lib';
import Progress from './Progress';

const Dashboard = ({ onLogout, errorHandler, showToast }) => {
    const [isProgress, setIsProgress] = useState(false);
    const [data, setData] = useState({});
    const pieRef = useRef(null);

    useEffect(()=>{
        const csrid = lib.getSession("csrid");
        if(!csrid) { onLogout(); return; }
        
        setIsProgress(true);
        lib.callApi("GET", lib.APIURL + "dashboard/view", "", viewDashboard, (err)=>{setIsProgress(false); errorHandler(err);}, csrid);
    },[]);

    function viewDashboard(res){
        setData(res);
        setIsProgress(false);
    }

    // useEffect(() => {
    //     if (data.rid === 3) 
    //         updateChart();
    // }, [data]);

    function updateChart() {
        
        let labels = ["Active Users", "Deleted Users"];
        let values = [5, 6];
        let colors = ["#0ABF30", "#E24D4C"];

        let total = values.reduce((a, b) => a + b, 0);
        let percentages = values.map(v => (v / total) * 100);

        let cumulative = 0;
        let gradient = [];

        percentages.forEach((percent, i) => {
            let start = cumulative;
            cumulative += percent;
            gradient.push(`${colors[i]} ${start}% ${cumulative}%`);
        });

        document.getElementById("pieChart").style.background =
            `conic-gradient(${gradient.join(",")})`;

        // Remove old labels
        document.querySelectorAll(".label").forEach(el => el.remove());

        // Add labels inside slices
        cumulative = 0;
        let container = document.getElementById("chartContainer");
        let radius = 120; // distance from center

        percentages.forEach((percent, i) => {

            let midAngle = (cumulative + percent / 2) * 3.6; // convert % to degrees
            cumulative += percent;

            let rad = (midAngle - 90) * (Math.PI / 180);

            let x = 150 + radius * Math.cos(rad);
            let y = 150 + radius * Math.sin(rad);

            let label = document.createElement("div");
            label.className = "label";
            label.style.left = x + "px";
            label.style.top = y + "px";
            label.innerHTML = `${labels[i]}<br>${percent.toFixed(1)}%`;

            container.appendChild(label);
        });
    }

    return (
        <div className='dashboard'>
            {data.rid === 1 &&
                <div className='user'>
                    <div className='analysis'>
                        <div>
                            <h3>Assigned Tasks</h3>
                            <h1>{10}</h1>
                        </div>
                        <div>
                            <h3>Completed Tasks</h3>
                            <h1>{7}</h1>
                        </div>
                        <div>
                            <h3>Pending Tasks</h3>
                            <h1>{3}</h1>
                        </div>
                    </div>
                </div>
            }
            {data.rid === 2 &&
                <div className='manager'>
                    <div className='analysis'>
                        <div>
                            <h3>Total Tasks</h3>
                            <h1>{data.totaltasks}</h1>
                        </div>
                        <div>
                            <h3>Assigned</h3>
                            <h1>{data.assignedtasks}</h1>
                        </div>
                        <div>
                            <h3>In-Progress</h3>
                            <h1>{data.inprogresstasks}</h1>
                        </div>
                        <div>
                            <h3>Completed</h3>
                            <h1>{data.completedtasks}</h1>
                        </div>
                    </div>
                </div>
            }
            {data.rid === 3 &&
                <div className='admin'>
                    <div className='analysis'>
                        <div>
                            <h3>Total Users</h3>
                            <h1>{data.totalusers}</h1>
                        </div>
                        <div>
                            <h3>Active Users</h3>
                            <h1>{data.activeusers}</h1>
                        </div>
                        <div>
                            <h3>Deleted Users</h3>
                            <h1>{data.deletedusers}</h1>
                        </div>
                    </div>
                    {/* <div className='chart'>
                        <div className='chartContainer' id="chartContainer">
                            <div className="pie-chart" id="pieChart" ></div>
                        </div>
                    </div> */}
                </div>
            }
            <Progress isProgress={isProgress}/>
        </div>
    );
}

export default Dashboard;
