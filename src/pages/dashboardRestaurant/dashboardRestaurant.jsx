import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardRestaurant.css';
import { useEffect, useState } from 'react';
import {getDocs, collection, query, where, doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';



function DashboardRestaurant() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [addRestaurant, setAddRestaurant]=useState(false);
  const [restaurantData, setRestaurantData]=useState([]);
  const [loading, setLoading] = useState(false)

  const restaurantsDb = collection(db,'Restaurants')


  useEffect(() => {
    let userType = localStorage.getItem('userType')
    if (isLoggedIn === "false" || !isLoggedIn ) {
          navigate('/login');
      }
    if(userType != 'restaurant'){
      navigate(`/dashboard-${userType}`)
    }
  }, []);

  useEffect(() => {
    let currentUID = localStorage.getItem('currentUserId')
    const getUserData = async () =>{
        try{
          setLoading(true);
            const q = query(restaurantsDb, where("owner", "==", currentUID));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map((doc)=>({
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
    getUserData();
    }, [])

     useEffect(()=>{
        console.log(restaurantData)
    },[restaurantData])
    


  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  return (
    <div className='dashboard-restaurant-div dashboard'>
        {addRestaurant ? 
          <form className='add-restaurant-form'>
            <label htmlFor="">Name</label>
            <input type="text" />
            <label htmlFor="">Image</label>
            <input type="file" />

            <button onClick={()=>{setAddRestaurant(false)}}>Cancel</button>
          </form> :
            <div className='restaurants-list'>
            <h2>My restaurants</h2>
            <button onClick={()=>{setAddRestaurant(true)}}>Add new restaurant</button>
            <button onClick={signOut}>Sign Out</button>
                    {loading ? <Loader/> : restaurantData.map((restaurant) => (
                      <RestaurantCard 
                          key={restaurant.id}
                          name={restaurant.name}
                          image={restaurant.image}
                  />
              ))}
              </div>
        }
        
    </div>
    
  );
}
export default DashboardRestaurant;