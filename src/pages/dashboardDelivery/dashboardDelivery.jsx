import React from 'react';
import {getDocs, collection, query, where, doc, setDoc, orderBy,updateDoc} from 'firebase/firestore';
import {db} from '../../firebase-config' 
import { useNavigate } from 'react-router-dom';
import './dashboardDelivery.css';
import { useEffect, useState } from 'react';


function DashboardDelivery() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
  const [ordersToDeliver, setOrdersToDeliver]=useState([]);
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
      const q = query(ordersDb, where("status", "in", [1,2]));
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

  return ( 
    <div className='dashboard-restaurant-div dashboard'>
        <button className='sign-out-delivery' onClick={signOut}>Sign out</button>
        <div className='orders-to-deliver'>
          {ordersToDeliver.map((data)=>{
            return(
              <div key={data.id} className='flex-order'>
                   <img className='my-orders-img' src={data.restaurantImg} alt="" />
                    <div className='my-order-details'>
                      <p>{data.orderDate}</p>
                      <p>{data.orderTime}</p>
                      <p>{data.fromRestaurant}</p>
                      <p>{data.total},00 lei</p>
                      <p>{status[data.status]}</p>
                      </div>
              </div>
            );
          })}
        </div>
    </div>
    
  );
}
export default DashboardDelivery;