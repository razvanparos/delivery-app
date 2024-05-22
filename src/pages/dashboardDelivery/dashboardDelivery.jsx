import React from 'react';
import {getDocs, collection, query, where, doc, setDoc, orderBy,updateDoc} from 'firebase/firestore';
import {db} from '../../firebase-config' 
import { useNavigate } from 'react-router-dom';
import './dashboardDelivery.css';
import { useEffect, useState } from 'react';
import {Slide} from 'react-awesome-reveal';
import { IoMdClose } from "react-icons/io";
import collect from 'collect.js';
import Confetti from 'react-dom-confetti';
import {Fade} from 'react-awesome-reveal';



function DashboardDelivery() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [ordersToDeliver, setOrdersToDeliver]=useState([]);
  const [individualOrder, setIndividualOrder] = useState(false)
  const [showIndividualOrderData, setShowIndividualOrderData] = useState([])
  const [currentOrderData, setCurrentOrderData] = useState([])
  const [individualOrderItems, setIndividualOrderItems] = useState({})
  const [confetti, setConfetti] = useState(false);
  const [currentError, setCurrentError] = useState(false);
  let status=['Ordered','Preparing','Delivering','Delivered'];

  const config = {
    angle: 90,
    spread: 1360,
    startVelocity: 70,
    elementCount: 300,
    dragFriction: 0.17,
    duration: 4000,
    stagger: 3,
    width: "12px",
    height: "10px",
    perspective: "900px",
    colors: ["#a864fd", "#29cdff", "#ff718d", "#fdff6a",'rgba(50, 187, 120)']
  };


  const ordersDb = collection(db,'Orders')

  useEffect(() => {
    let userType = localStorage.getItem('userType')
    if (isLoggedIn === "false" || !isLoggedIn ) {
          navigate('/login');
      }
    if(userType != 'delivery'){
      navigate(`/dashboard-${userType}`)
    }
  }, []);

  const signOut = () =>{
    localStorage.setItem('LoggedIn',false)
    localStorage.setItem('RememberMe',false)
    localStorage.setItem('currentUserId',0)
    navigate('/');
}

const getOrdersToDeliver = async () =>{
  try{
      const q = query(ordersDb, where("status", "==", 1), where('pickedUpBy','==',''));
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs.map((doc)=>({
          ...doc.data(),
          id: doc.id,
      }))
      setOrdersToDeliver(filteredData)
      } catch(err){
          console.log(err)
       }    
  }
const getCurrentOrder = async () =>{
  try{
      const q = query(ordersDb, where('status','!=',3), where('pickedUpBy','==',localStorage.getItem('currentUserId')));
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs.map((doc)=>({
          ...doc.data(),
          id: doc.id,
      }))
      setCurrentOrderData(filteredData)
      } catch(err){
          console.log(err)
       }    
  }

  useEffect(()=>{
    getOrdersToDeliver();
    getCurrentOrder();
  },[])

  const individualOrderFunc= (data)=>{
      setIndividualOrder(true);
      setShowIndividualOrderData(data);
      let productNames=[];
      data.products.forEach((e)=>{
      productNames.push(e.productName)
      })
      const collection = collect(productNames);
      const counted = collection.countBy();
      counted.all();
      setIndividualOrderItems(counted.items)
  }

  const takeOrder = async(id)=>{
    if(currentOrderData.length===0){
      try {
        const ordersRef = doc(db, 'Orders', id);
        await updateDoc(ordersRef, { pickedUpBy: localStorage.getItem('currentUserId') });  
        setIndividualOrder(false)
        getCurrentOrder();
        getOrdersToDeliver();
      } catch (error) {
          console.log(error)
      }
    }else{
      setCurrentError(true)
      setTimeout(() => {
        setCurrentError(false)
      }, 3000);
    }
  }

  const updateStatus = async(id,status)=>{
    try {
      const ordersRef = doc(db, 'Orders', id);
      if(status===1){
        await updateDoc(ordersRef, { status: 2 }); 
        updateStatusIndividual(id)
        getCurrentOrder();
      }else{
        await updateDoc(ordersRef, { status: 3 }); 
        updateStatusIndividual(id)
        getCurrentOrder();
        setConfetti(true);
        setTimeout(() => {
          setConfetti(false);
        }, 4000);
      }
    } catch (error) {
      console.log(error)
    }
    
  }
  const updateStatusIndividual = async(id)=>{
    try{
      const q = query(ordersDb, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs.map((doc)=>({
          ...doc.data(),
          id: doc.id,
      }))
      setShowIndividualOrderData(filteredData[0])
      } catch(err){
          console.log(err)
       }    
    
  }
  return ( 
    <div style={{padding:'50px 12px'}} className='dashboard-restaurant-div dashboard'>
        <div className={currentError?'dialog-cart-open':'dialog-cart-closed'}><IoMdClose className='x'/>Only one current order</div>
        <button className='sign-out-delivery' onClick={signOut}>Sign out</button>
        <h2 style={{color:'white'}}>Current Order</h2>
        {currentOrderData.length>0
          ? <div className='current-order'>
            {currentOrderData.map((data)=>{
            return(
              <Fade key={data.id} duration={700} triggerOnce='true'>
                <div className='flex-order-current' onClick={()=>{individualOrderFunc(data)}}>
                    <Fade duration={700}><img className='my-orders-img' src={data.restaurantImg} alt="" /></Fade>
                    <div className='my-order-details'>
                      <p>{data.orderDate}</p>
                      <p>{data.orderTime}</p>
                      <p>{data.fromRestaurant}</p>
                      <p>{data.total},00 lei</p>
                      <p>{status[data.status]}</p>
                      </div>
                </div>
              </Fade>
            );
          })}
          </div>
          :<p style={{color:'white'}}>No current order</p>
        }
        <h2 style={{color:'white'}}>Orders waiting to be delivered</h2>
        {ordersToDeliver.length>0?'':<p style={{color:'white'}}>Currently no orders to deliver</p>}
        <div className={`orders-to-deliver ${individualOrder?'pointer-none-scroll':''}`}>
          {ordersToDeliver.map((data,index)=>{
            return(
              <Slide key={data.id} duration={index*100} triggerOnce='true'>
                <div className='flex-order' onClick={()=>{individualOrderFunc(data)}}>
                    <Fade><img className='my-orders-img' src={data.restaurantImg} alt="" /></Fade>
                    <div className='my-order-details'>
                      <p>{data.orderDate}</p>
                      <p>{data.orderTime}</p>
                      <p>{data.fromRestaurant}</p>
                      <p>{data.total},00 lei</p>
                      <p>{status[data.status]}</p>
                      </div>
                </div>
              </Slide>
            );
          })}
        </div>
        <div className={`received-orders-modal ${individualOrder?'open':'close'}`}>
          <button onClick={()=>{setIndividualOrder(false)}} className='close-btn'><IoMdClose /></button>
          <div className='individual-order-div-delivery'>
                <div className='confetti-div'><Confetti active={ confetti } config={ config }/></div>
                <img src={showIndividualOrderData.restaurantImg} alt="" className='individual-order-img-delivery'/>
                <p>{showIndividualOrderData.fromRestaurant}</p>
                <p>{`Order #${showIndividualOrderData.id}`}</p>
                <p>Ordered on: {showIndividualOrderData.orderDate}, {showIndividualOrderData.orderTime}</p>
                <div>
                    {Object.entries(individualOrderItems).map(([key, value]) => <p key={key}>{`${value} x ${key}`}</p>)}
                </div>
                <p>Tip: {showIndividualOrderData.tip},00 lei</p>
                <p>Total: {showIndividualOrderData.total},00 lei</p>
                <p>Payment method: {showIndividualOrderData.paymentMethod}</p>
                <p>Pickup address: {showIndividualOrderData.pickupAddress}</p>
                <p>Delivery address: {showIndividualOrderData.deliveryAddress}</p>
                <p>Client phone: {showIndividualOrderData.phone}</p>
                <p style={{fontSize:'24px'}}>Status: {status[showIndividualOrderData.status]}</p>
                {showIndividualOrderData.pickedUpBy==localStorage.getItem('currentUserId')?'':<button style={{marginBottom:'4px'}} onClick={()=>{takeOrder(showIndividualOrderData.id)}} className='order-status-btn'>{`Take order`}</button>}
                {showIndividualOrderData.status===1&&showIndividualOrderData.pickedUpBy==localStorage.getItem('currentUserId')?<button onClick={()=>{updateStatus(showIndividualOrderData.id,showIndividualOrderData.status)}} className='order-status-btn'>{`Change order status to "${status[showIndividualOrderData.status+1]}"`}</button>:''}
                {showIndividualOrderData.status===2&&showIndividualOrderData.pickedUpBy==localStorage.getItem('currentUserId')?<button onClick={()=>{updateStatus(showIndividualOrderData.id,showIndividualOrderData.status)}} className='order-status-btn'> Finish order</button>:''}
            </div>
        </div>
        
    </div>
    
  );
}
export default DashboardDelivery;