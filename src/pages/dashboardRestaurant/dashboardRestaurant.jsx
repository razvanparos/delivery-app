import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardRestaurant.css';
import { useEffect, useState } from 'react';
import {getDocs, collection, query, where, doc, setDoc, orderBy,updateDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import {storage} from '../../firebase-config'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ChangesSaved from '../../components/ChangesSaved/ChangesSaved';
import { IoMdClose } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import collect from 'collect.js';
import { useTransition, animated } from 'react-spring';



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
  const [showIndividualOrder, setShowIndividualOrder] = useState(false)
  const [showIndividualOrderData, setShowIndividualOrderData] = useState([])
  const [newRestaurantName, setNewRestaurantName] = useState('')
  const [myReceivedOrdersData, setMyReceivedOrdersData] = useState([])
  const [individualOrderItems, setIndividualOrderItems] = useState({})
  const [newRestaurantAddress, setNewRestaurantAddress] = useState('')
  let status=['Ordered','Preparing','Delivering','Delivered'];

  const restaurantsDb = collection(db,'Restaurants')
  const usersDb = collection(db,'UsersDetails')
  const ordersDb = collection(db,'Orders')

  const transition = useTransition(showIndividualOrder,{
      from:{x:800, y:0, opacity:1},
      enter:{x:0, y:0, opacity:1, delay:0 },
      leave:{x:800, y:0, opacity:1}
  })
  
  const myReceivedOrders = async (myRestaurants) =>{
    try{
        const q = query(ordersDb, where("orderedTo", "in", myRestaurants),orderBy('status','asc'),orderBy('orderDate','desc'),orderBy('orderTime','desc'));
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
        setMyRestaurantsId(myRestaurants)
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
  
    },[])

    
  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

  const addNewRestaurant = async (e)=>{
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
            id: newId,
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
  const showIndividualOrderFunc = (data)=>{
    setShowIndividualOrder(true);
    setShowIndividualOrderData(data)
    // console.log(data.products)
    let productNames=[];
    data.products.forEach((e)=>{
      productNames.push(e.productName)
    })
    const collection = collect(productNames);
    const counted = collection.countBy();
    counted.all();
    setIndividualOrderItems(counted.items)
  

  }

  const updateIndividualOrder = async(id)=>{
    try{
      const q = query(ordersDb, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs.map((doc)=>({
          ...doc.data(),
          id: doc.id,
      }))
      setShowIndividualOrderData(filteredData[0])
      myReceivedOrders(myRestaurantsId)
      } catch(err){
          console.log(err)
       }    
  }
  const updateStatus = async(id)=>{
    try {
      const ordersRef = doc(db, 'Orders', id);
      await updateDoc(ordersRef, { status: 1 });  
      updateIndividualOrder(id)
    } catch (error) {
      console.log(error)
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
                
                <label htmlFor="">Restaurant address </label>
                <textarea  value={newRestaurantAddress}  onChange={(e)=>{setNewRestaurantAddress(e.target.value)}}/>

                <label htmlFor="">Image </label>
                <input type="file" id='fileInput' onChange={(e)=>{console.log(e.target.elements)}}/>

                <button onClick={addNewRestaurant}>Submit</button>
                <button onClick={()=>{setAddRestaurant(false)}}>Cancel</button>
              </form>  
            }
           </div>:
            <div className={`${receivedOrders ? 'pointer-none-scroll':''} restaurants-list`}>
              <div>
                <h2>My restaurants</h2>
                <p>{userData?.email}</p>
                <p>{userData?.phone}</p>
              </div>
              <button onClick={()=>{setAddRestaurant(true)}}>Add new restaurant</button>
              <button onClick={showReceivedOrders}>Received orders</button>
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
          {showIndividualOrder?
          <div className='individual-back' onClick={()=>{setShowIndividualOrder(false)}}>
              <FaArrowLeftLong />
          </div>
          :''}
          {transition((style,item)=>
              item ? 
              <animated.div style={style} className='individual-order-div'>
                <img src={showIndividualOrderData.restaurantImg} alt="" className='individual-order-img'/>
                <p>{showIndividualOrderData.fromRestaurant}</p>
                <p>{`Order #${showIndividualOrderData.id}`}</p>
                <p>Ordered on: {showIndividualOrderData.orderDate}, {showIndividualOrderData.orderTime}</p>
                <div>
                    {Object.entries(individualOrderItems).map(([key, value]) => <p key={key}>{`${value} x ${key}`}</p>)}
                </div>
                <p>Total: {showIndividualOrderData.total},00 lei</p>
                <p>Payment method: {showIndividualOrderData.paymentMethod}</p>
                <p>Delivery address: {showIndividualOrderData.deliveryAddress}</p>
                <p>Client phone: {showIndividualOrderData.phone}</p>
                <p style={{fontSize:'24px'}}>Status: {status[showIndividualOrderData.status]}</p>
                {showIndividualOrderData.status===0?<button onClick={()=>{updateStatus(showIndividualOrderData.id)}} className='order-status-btn'>{`Change order status to "${status[showIndividualOrderData.status+1]}"`}</button>:''}
            </animated.div> :
            <animated.div style={style} className='my-orders-div'>
              {myReceivedOrdersData?.map((data)=>{
                return(
                  <div key={data.id} className='flex-order' onClick={()=>{showIndividualOrderFunc(data)}}>
                    <img className='my-orders-img' src={data.restaurantImg} alt="" />
                    <div className='my-order-details'>
                      <p>{data.orderDate}</p>
                      <p>{data.orderTime}</p>
                      <p>{data.fromRestaurant}</p>
                      <p>{data.total},00 lei</p>
                      <p>{status[data.status]}</p>
                      </div>
                  </div>
                )})}
            </animated.div> 
          )}      
        </div>


      <ChangesSaved changesSaved={changesSaved}/>

    </div>
    
  );
}
export default DashboardRestaurant;