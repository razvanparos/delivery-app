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
import { IoMdClose } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import collect from 'collect.js';
import { useTransition, animated } from 'react-spring';
import {Slide} from 'react-awesome-reveal';



function DashboardRestaurant() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [currentUID, setCurrentUID]=useState(localStorage.getItem('currentUserId'));
  const [addRestaurant, setAddRestaurant]=useState(false);
  const [restaurantData, setRestaurantData]=useState([]);
  const [myRestaurantsId, setMyRestaurantsId]=useState([]);
  const [userData, setUserData]=useState();
  const [loading, setLoading] = useState(false)
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
      e.preventDefault();
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
        setNewRestaurantName('')
        getMyRestaurants();
        setAddRestaurant(false); 
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
          <div style={{width:'100%'}}>
            {loading ? <Loader/> :
            <Slide direction='down' duration={200} style={{width:'100%'}}>
              <form className='add-restaurant-form'>  
                <label htmlFor="">Name: </label>
                <input className='restaurant-add-name' type="text" value={newRestaurantName}  onChange={(e)=>{setNewRestaurantName(e.target.value)}}/>
                
                <label htmlFor="">Restaurant address: </label>
                <textarea className='restaurant-add-name' value={newRestaurantAddress}  onChange={(e)=>{setNewRestaurantAddress(e.target.value)}}/>

                <label htmlFor="">Image </label>
                <label className="custum-file-upload" htmlFor="fileInput">
                <div className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g strokeWidth="0" id="SVGRepo_bgCarrier"></g><g strokeLinejoin="round" stroklinecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path fill="" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clipRule="evenodd" fillRule="evenodd"></path> </g></svg>
                </div>
                <div className="text">
                  <span>Click to upload image</span>
                  </div>
                  <input type="file" id='fileInput'/>
                </label>

                <button className='product-modal-submit' onClick={addNewRestaurant}>Submit</button>
                <button className='product-modal-cancel' onClick={()=>{setAddRestaurant(false)}}>Cancel</button>
              </form>  
            </Slide>}
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
                 <Slide duration={200} triggerOnce="true" key={restaurant.id}> 
                  <RestaurantCard 
                      id={restaurant.id}
                      name={restaurant.name}
                      image={restaurant.image}
                  />
                 </Slide> 
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
    </div>
    
  );
}
export default DashboardRestaurant;