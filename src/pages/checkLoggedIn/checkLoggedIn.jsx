import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
function CheckLoggedIn() {
    const navigate = useNavigate();

    useEffect(() => {
        let rememberMe = localStorage.getItem('RememberMe') === 'true'; 
        if(rememberMe===false){
            localStorage.setItem('LoggedIn',false)
        }
        let loggedIn = localStorage.getItem('LoggedIn') === 'true'; 
        if (loggedIn) {
            navigate('/dashboard-client');
        } else {
            navigate('/login');
        }
    }, []); 

    return null;
}

export default CheckLoggedIn;