import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardDelivery.css';


function DashboardDelivery() {
  const navigate = useNavigate();

  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  return (
    <div className='dashboard-restaurant-div'>
        dashboard delivery
        <button onClick={signOut}>Sign out</button>
    </div>
    
  );
}
export default DashboardDelivery;