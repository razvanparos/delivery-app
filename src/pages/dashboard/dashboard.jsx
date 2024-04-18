import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import {getDocs, collection, query, where, doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'



function Dashboard(){
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
    const [userData, setUserData]=useState();

    const usersDb = collection(db,'UsersDetails')
   
    useEffect(() => {
      if (isLoggedIn === "false" || !isLoggedIn) {
            navigate('/login');
        }  
    }, [isLoggedIn]);

    useEffect(() => {
        let currentUID = localStorage.getItem('currentUserId')
        const getUserData = async () =>{
            try{
                const q = query(usersDb, where("id", "==", currentUID));
                const querySnapshot = await getDocs(q);
                const filteredData = querySnapshot.docs.map((doc)=>({
                   ...doc.data(),
                   id: doc.id,
               }))
                setUserData(filteredData[0])
               } catch(err){
                   console.log(err)
               }
        }
        getUserData();
        },[]
    )

    // useEffect(()=>{
    //     console.log(userData)
    // },[userData])
    

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
