import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';


function Dashboard(){
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
   
    useEffect(() => {
      if (isLoggedIn === "false" || !isLoggedIn) {
            navigate('/login');
        }  
    }, [isLoggedIn]);
    

    const signOut = () =>{
        localStorage.setItem('LoggedIn',false)
        localStorage.setItem('RememberMe',false)
        localStorage.setItem('currentUserId',0)
        navigate('/');
    }
        
        

    return(
        <div className="dashboard-div">
            <button onClick={signOut}>sign out</button>
        </div>
    );
}

export default Dashboard;  
