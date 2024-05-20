import React from 'react';
import {getDocs, collection, query, where, doc, setDoc, orderBy,updateDoc} from 'firebase/firestore';
import {db} from '../../firebase-config' 
import { useNavigate } from 'react-router-dom';
import './dashboardDelivery.css';
import { useEffect, useState } from 'react';
import {Slide} from 'react-awesome-reveal';
import { IoMdClose } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useTransition, animated } from 'react-spring';
import collect from 'collect.js';



function DashboardDelivery() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [ordersToDeliver, setOrdersToDeliver]=useState([]);
  const [individualOrder, setIndividualOrder] = useState(false)
  const [showIndividualOrder, setShowIndividualOrder] = useState(false)
  const [showIndividualOrderData, setShowIndividualOrderData] = useState([])
  const [individualOrderItems, setIndividualOrderItems] = useState({})
  let status=['Ordered','Preparing','Delivering','Delivered'];


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
      const q = query(ordersDb, where("status", "==", 1));
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
  useEffect(()=>{
    getOrdersToDeliver();
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


  return ( 
    <div style={{padding:'50px 12px'}} className='dashboard-restaurant-div dashboard'>
        <button className='sign-out-delivery' onClick={signOut}>Sign out</button>
        <div className={`orders-to-deliver ${individualOrder?'pointer-none-scroll':''}`}>
          {ordersToDeliver.map((data,index)=>{
            return(
              <Slide key={data.id} duration={index*100} triggerOnce='true'>
                <div className='flex-order' onClick={()=>{individualOrderFunc(data)}}>
                   <img className='my-orders-img' src={data.restaurantImg} alt="" />
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
                <img src={showIndividualOrderData.restaurantImg} alt="" className='individual-order-img-delivery'/>
                <p>{showIndividualOrderData.fromRestaurant}</p>
                <p>{`Order #${showIndividualOrderData.id}`}</p>
                <p>Ordered on: {showIndividualOrderData.orderDate}, {showIndividualOrderData.orderTime}</p>
                <div>
                    {Object.entries(individualOrderItems).map(([key, value]) => <p key={key}>{`${value} x ${key}`}</p>)}
                </div>
                <p>Total: {showIndividualOrderData.total},00 lei</p>
                <p>Payment method: {showIndividualOrderData.paymentMethod}</p>
                <p>Pickup address: {showIndividualOrderData.pickupAddress}</p>
                <p>Delivery address: {showIndividualOrderData.deliveryAddress}</p>
                <p>Client phone: {showIndividualOrderData.phone}</p>
                <p style={{fontSize:'24px'}}>Status: {status[showIndividualOrderData.status]}</p>
                <button style={{marginBottom:'4px'}} className='order-status-btn'>{`Take order`}</button>
                {showIndividualOrderData.status===1?<button className='order-status-btn'>{`Change order status to "${status[showIndividualOrderData.status+1]}"`}</button>:''}
            </div>
        </div>
    </div>
    
  );
}
export default DashboardDelivery;