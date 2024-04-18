import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardRestaurant.css';


function DashboardRestaurant() {
  const navigate = useNavigate();

  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  return (
    <div className='dashboard-restaurant-div'>
        dashboard restaurant
        <button onClick={signOut}>Sign Out</button>
    </div>
    
  );
}
export default DashboardRestaurant;