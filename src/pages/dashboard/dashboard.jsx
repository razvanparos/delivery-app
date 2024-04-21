import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import {getDocs, collection, query, where, doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';




function Dashboard(){
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
    const [userData, setUserData]=useState();
    const [restaurantData, setRestaurantData]=useState([]);
    const [loading, setLoading] = useState(false)

    const usersDb = collection(db,'UsersDetails')
    const restaurantsDb = collection(db,'Restaurants')
   
    useEffect(() => {
        let userType = localStorage.getItem('userType')
        if (isLoggedIn === "false" || !isLoggedIn ) {
              navigate('/login');
          }
        if(userType != 'client'){
          navigate(`/dashboard-${userType}`)
        }
      }, []);

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
        const getRestaurantData = async () =>{
            try{
                setLoading(true);
                const restaurantDataDocs = await getDocs(restaurantsDb);
                const filteredData = restaurantDataDocs.docs.map((doc)=>({
                   ...doc.data(),
                   id: doc.id,
               }))
               setRestaurantData(filteredData)
               setLoading(false);
               } catch(err){
                setLoading(false);
                   console.log(err)
               }
        }
        getRestaurantData();
        },[])

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
        <div className="dashboard-div dashboard">
            client
            <div className='restaurants-list'>
                {loading ? <Loader/> : restaurantData.map((restaurant) => (
                   <p key={restaurant.id}>{restaurant.name}</p>
                ))}
            </div>
            <button onClick={signOut}>sign out</button>
        </div>
    );
}

export default Dashboard;  
