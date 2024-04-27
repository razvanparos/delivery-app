import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardRestaurant.css';
import { useEffect, useState } from 'react';
import {getDocs, collection, query, where, doc, setDoc, addDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import {storage} from '../../firebase-config'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";



function DashboardRestaurant() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [currentUID, setCurrentUID]=useState(localStorage.getItem('currentUserId'));
  const [addRestaurant, setAddRestaurant]=useState(false);
  const [restaurantData, setRestaurantData]=useState([]);
  const [userData, setUserData]=useState();
  const [loading, setLoading] = useState(false)
  const [newRestaurantName, setNewRestaurantName] = useState('')

  const restaurantsDb = collection(db,'Restaurants')
  const usersDb = collection(db,'UsersDetails')


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
    const getMyRestaurants = async () =>{
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
    getMyRestaurants();
    }, [])

    //  useEffect(()=>{
    //     console.log(userData)
    // },[userData])
    
  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  const addNewRestaurant = async (e)=>{
      e.preventDefault()
      setLoading(true);
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0]; 
      const imageRef = ref(storage, newRestaurantName);
      try {
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        await setDoc(doc(db, "Restaurants", currentUID), {
            name: newRestaurantName,
            image: imageUrl, 
            owner: currentUID
        });
        setLoading(false);
        setAddRestaurant(false); 
        window.location.reload();
    } catch (error) {
        setLoading(false);
        console.error("Error uploading image:", error);
    }
      
  }

  return (
    <div className='dashboard-restaurant-div dashboard'>
        {addRestaurant ?
          <div>
            {loading ? <Loader/> :
              <form className='add-restaurant-form'>  
                <label htmlFor="">Name </label>
                <input type="text" value={newRestaurantName}  onChange={(e)=>{setNewRestaurantName(e.target.value)}}/>

                <label htmlFor="">Image </label>
                <input type="file" id='fileInput' onChange={(e)=>{console.log(e.target.elements)}}/>

                <button onClick={addNewRestaurant}>Submit</button>
                <button onClick={()=>{setAddRestaurant(false)}}>Cancel</button>
              </form>  
            }
           </div>:
            <div className='restaurants-list'>
              <div>
                <h2>My restaurants</h2>
                <p>{userData?.email}</p>
                <p>{userData?.phone}</p>
              </div>
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