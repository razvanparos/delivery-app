import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardRestaurant.css';
import { useEffect, useState } from 'react';
import {getDocs, collection, query, where, doc, setDoc, orderBy} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import {storage} from '../../firebase-config'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ChangesSaved from '../../components/ChangesSaved/ChangesSaved';
import { IoMdClose } from "react-icons/io";
import { disablePageScroll, enablePageScroll, scrollLock  } from 'scroll-lock';



function DashboardRestaurant() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [currentUID, setCurrentUID]=useState(localStorage.getItem('currentUserId'));
  const [addRestaurant, setAddRestaurant]=useState(false);
  const [restaurantData, setRestaurantData]=useState([]);
  const [myRestaurantsId, setMyRestaurantsId]=useState([]);
  const [userData, setUserData]=useState();
  const [loading, setLoading] = useState(false)
  const [changesSaved, setChangesSaved] = useState(false)
  const [receivedOrders, setReceivedOrders] = useState(false)
  const [newRestaurantName, setNewRestaurantName] = useState('')
  const [myReceivedOrdersData, setMyReceivedOrdersData] = useState([])
  const [newRestaurantAddress, setNewRestaurantAddress] = useState('')

  const restaurantsDb = collection(db,'Restaurants')
  const usersDb = collection(db,'UsersDetails')
  const ordersDb = collection(db,'Orders')
  
  const myReceivedOrders = async (myRestaurants) =>{
    try{
        const q = query(ordersDb, where("orderedTo", "in", myRestaurants),orderBy('orderDate','desc'),orderBy('orderTime','desc'));
        const querySnapshot = await getDocs(q);
        const filteredData = querySnapshot.docs.map((doc)=>({
            ...doc.data(),
            id: doc.id,
        }))
        setMyReceivedOrdersData(filteredData)
        } catch(err){
               console.log(err)
         }    
    }
  const getMyRestaurants = async () =>{
    try{
      setLoading(true);
        const q = query(restaurantsDb, where("owner", "==", currentUID));
        const querySnapshot = await getDocs(q);
        const filteredData = querySnapshot.docs.map((doc)=>({
           ...doc.data(),
           id: doc.id,
       }))
        let myRestaurants=[];
        filteredData.forEach((r)=>{myRestaurants.push(r.id)})
        // console.log(myRestaurants)
        setRestaurantData(filteredData)
        
        myReceivedOrders(myRestaurants)
        
        setLoading(false);
       } catch(err){
        setLoading(false);
           console.log(err)
       }
}
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

     useEffect(()=>{
      const scrollableElement = document.querySelector('.pointer-none');
        if(receivedOrders===true){
          disablePageScroll(scrollableElement);
        }else{enablePageScroll(scrollableElement);}
    },[receivedOrders])
    
  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  const addNewRestaurant = async (e)=>{
      e.preventDefault()
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0]; 
      const imageRef = ref(storage, newRestaurantName);
      if(newRestaurantName && file && newRestaurantAddress){
        try {
        setLoading(true);
        var newId = "id" + Math.random().toString(16).slice(2)
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        await setDoc(doc(db, "Restaurants", newId), {
            name: newRestaurantName,
            restaurantAddress:newRestaurantAddress,
            image: imageUrl, 
            owner: currentUID
        });
        setLoading(false);
        setChangesSaved(true);
        setNewRestaurantName('')
        setTimeout(() => {
          getMyRestaurants();
          setChangesSaved(false);
          setAddRestaurant(false); 
        }, 2000);
    } catch (error) {
        setLoading(false);
        console.error("Error uploading image:", error);
    }
      }
      
  }
  const showReceivedOrders = ()=>{
    setReceivedOrders(true);
    getMyRestaurants();
  }

 

  return (
    <div className='dashboard-restaurant-div dashboard'>
        {addRestaurant ?
          <div>
            {loading ? <Loader/> :
              <form className='add-restaurant-form'>  
                <label htmlFor="">Name </label>
                <input type="text" value={newRestaurantName}  onChange={(e)=>{setNewRestaurantName(e.target.value)}}/>
                
                <label htmlFor="">Restaurant address </label>
                <textarea  value={newRestaurantAddress}  onChange={(e)=>{setNewRestaurantAddress(e.target.value)}}/>

                <label htmlFor="">Image </label>
                <input type="file" id='fileInput' onChange={(e)=>{console.log(e.target.elements)}}/>

                <button onClick={addNewRestaurant}>Submit</button>
                <button onClick={()=>{setAddRestaurant(false)}}>Cancel</button>
              </form>  
            }
           </div>:
            <div className={`${receivedOrders ? 'pointer-none':''} restaurants-list`}>
              <div>
                <h2>My restaurants</h2>
                <p>{userData?.email}</p>
                <p>{userData?.phone}</p>
              </div>
              <button onClick={()=>{setAddRestaurant(true)}}>Add new restaurant</button>
              <button onClick={showReceivedOrders}>Received Orders</button>
              <button onClick={signOut}>Sign Out</button>
              {loading ? <Loader/> : restaurantData.map((restaurant) => (
                  <RestaurantCard 
                      key={restaurant.id}
                      id={restaurant.id}
                      name={restaurant.name}
                      image={restaurant.image}
                  />
              ))}
            </div>
        }

        <div className={`received-orders-modal ${receivedOrders?'open':'close'}`}>
          <button onClick={()=>{setReceivedOrders(false)}} className='close-btn'><IoMdClose /></button>
          <div className='my-orders-div'>
            {myReceivedOrdersData?.map((data)=>{
              return(
                <div key={data.id} className='flex-order'>
                  <img className='my-orders-img' src={data.restaurantImg} alt="" />
                  <div className='my-order-details'>
                    <p>{data.orderDate}</p>
                    <p>{data.orderTime}</p>
                    <p>{data.fromRestaurant}</p>
                    <p>{data.total},00 lei</p>
                    <p style={{textTransform:'capitalize'}}>{data.status}</p>
                    </div>
                </div>
              )})}
              </div> 
        </div>


      <ChangesSaved changesSaved={changesSaved}/>

    </div>
    
  );
}
export default DashboardRestaurant;