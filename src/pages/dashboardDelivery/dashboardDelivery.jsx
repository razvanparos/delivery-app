import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardDelivery.css';
import { useEffect, useState } from 'react';


function DashboardDelivery() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));

  useEffect(() => {
    let userType = localStorage.getItem('userType')
    if (isLoggedIn === "false" || !isLoggedIn ) {
          navigate('/login');
      }
    if(userType != 'delivery'){
      navigate(`/dashboard-${userType}`)
    }
  }, []);

  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  return ( 
    <div className='dashboard-restaurant-div dashboard'>
        dashboard delivery
        <button onClick={signOut}>Sign out</button>
    </div>
    
  );
}
export default DashboardDelivery;