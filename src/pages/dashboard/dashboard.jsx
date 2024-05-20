import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import {getDocs,getDoc, collection, query, where, doc, setDoc,updateDoc,orderBy} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import NavbarClient from '../../components/NavbarClient/NavbarClient';
import { FaSearch } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import {Fade, Slide} from 'react-awesome-reveal';
import Reveal from "react-awesome-reveal";
import { keyframes } from "@emotion/react";

function Dashboard(){
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
    const [userData, setUserData]=useState();
    const [restaurantData, setRestaurantData]=useState([]);
    const [userCart, setUserCart]=useState([]);
    const [loading, setLoading] = useState(false)
    const [hideNav, setHideNav] = useState(false)
    const [orderModal, setOrderModal] = useState(false)
    const [searchInput, setSearchInput]=useState('');
    const [initialScroll, setInitialScroll]=useState(0);
    const [originalRestaurantData, setOriginalRestaurantData]=useState([]);
    const [clientTab, setClientTab]=useState('home');
    const [cartTotal, setCartTotal]=useState(0);
    const [cartQty, setCartQty]=useState(0);
    const [tip, setTip]=useState(0);
    const [delivery, setDelivery]=useState(3);
    const [address, setAddress]=useState('');
    const [addressError, setAddressError]=useState(false);
    const [orderDialog, setOrderDialog]=useState(false);
    const [editPhoneMode, setEditPhoneMode]=useState(false);
    const [myOrdersModal, setMyOrdersModal]=useState(false);
    const [payment, setPayment]=useState('Cash');
    const [profilePhone, setProfilePhone]=useState('');
    const [myOrdersData, setMyOrdersData]=useState('');
    let status=['Ordered','Preparing','Delivering','Delivered'];



    const usersDb = collection(db,'UsersDetails')
    const ordersDb = collection(db,'Orders')
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
    const getUserData = async () =>{
        try{
            const q = query(usersDb, where("id", "==", localStorage.getItem('currentUserId')));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map((doc)=>({
                ...doc.data(),
                id: doc.id,
            }))
            setUserData(filteredData[0])
            setProfilePhone(filteredData[0].phone);
            setCartQty(filteredData[0].cart.length)
            
            } catch(err){
                   console.log(err)
             }    
        }
    const myOrders = async () =>{
        try{
            const q = query(ordersDb, where("orderedBy", "==", localStorage.getItem('currentUserId')), orderBy('orderDate','desc'),orderBy('orderTime','desc'));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map((doc)=>({
                ...doc.data(),
                id: doc.id,
            }))
            setMyOrdersData(filteredData)
            console.log(filteredData)
            } catch(err){
                   console.log(err)
             }    
        }
    
      useEffect(() => {

        getUserData();
        myOrders();
        const getRestaurantData = async () =>{
            try{
                setLoading(true);
                const restaurantDataDocs = await getDocs(restaurantsDb);
                const filteredData = restaurantDataDocs.docs.map((doc)=>({
                   ...doc.data(),
                   id: doc.id,
               }))
               setRestaurantData(filteredData)
               setOriginalRestaurantData(filteredData)
               setLoading(false);
               } catch(err){
                setLoading(false);
                   console.log(err)
               }
        }
        getRestaurantData();
        let orderDate = new Date();
        let orderDateFormat = `${orderDate.getDate()}.${orderDate.getMonth()+1}.${orderDate.getFullYear()}`
        console.log(orderDateFormat)
        },[])

        useEffect(() => {
            let originalData=originalRestaurantData;
            const filteredData = originalData.filter(item => item.name.toLowerCase().includes(searchInput.toLowerCase()));
            setRestaurantData(filteredData);       
        }, [searchInput]);

    // useEffect(()=>{
    //     console.log(restaurantData)
    // },[searchInput])

  
    window.addEventListener('scroll',function(){
        let maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if(clientTab==='cart'){
            setHideNav(true)
        }
        if(clientTab==='profile'){
            setHideNav(true)
        }
       
        if(initialScroll >  window.scrollY){
            setInitialScroll( window.scrollY)
            setHideNav(false)
        }   
        if(initialScroll <  window.scrollY){
            setInitialScroll( window.scrollY)
            setHideNav(true)
        }
        if(window.scrollY > maxScroll-150){
            setHideNav(true)
        }
        if(window.scrollY < maxScroll-400){
            setHideNav(false)
        }
        
        
    
    })

    const signOut = () =>{
        localStorage.setItem('LoggedIn',false)
        localStorage.setItem('RememberMe',false)
        localStorage.setItem('currentUserId',0)
        navigate('/');
    }
    const back = () =>{ 
        setEditPhoneMode(false)
        setHideNav(false);
        setClientTab('home')
     }
    const getUserCart = async () =>{
            try{
                const q = query(usersDb, where("id", "==", localStorage.getItem('currentUserId')));
                const querySnapshot = await getDocs(q);
                const filteredData = querySnapshot.docs.map((doc)=>({
                   ...doc.data(),
                   id: doc.id,
               }))
                let total=0;
                filteredData[0].cart.forEach((p)=>{total=total+(p.productPrice)})
                setCartTotal(total)
                setUserCart(filteredData[0].cart)
               } catch(err){
                   console.log(err)
               }
        }
     const showCart = () =>{
        setHideNav(true)
        setClientTab('cart')
        
        getUserCart();
    }
    
    const focusSearch=()=>{
        setClientTab('home')
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            document.querySelector('.search-bar').focus()
          }, 300);
        
    }
    const showProfile=()=>{
        setClientTab('profile')
        
    }
    const editPhone=async()=>{
        if(editPhoneMode===false){
            setEditPhoneMode(true)
            document.querySelector('.profile-phone').focus();
        }else {
            if(profilePhone){
                const userRef = doc(db, 'UsersDetails', localStorage.getItem('currentUserId'));
                await updateDoc(userRef, { phone:profilePhone });  
                setEditPhoneMode(false)
                getUserData();
            }
        }
        
    }
    const emptyCart = async()=>{
        try {
            const userRef = doc(db, 'UsersDetails', localStorage.getItem('currentUserId'));
            await updateDoc(userRef, { cart:[] });  
    } catch (error) {
        console.log(error)
    }
    }
    const confirmOrder=async()=>{
       if(address){
            setAddressError(false);
            const q = query(restaurantsDb, where("id", "==", userCart[0].restaurantId));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map((doc)=>({
                ...doc.data(),
                id: doc.id,
            }))
            console.log(filteredData)
            var newId = "id" + Math.random().toString(16).slice(2);
            let orderDate = new Date();
            let orderDateFormat = `${orderDate.getDate()}.${orderDate.getMonth()+1}.${orderDate.getFullYear()}`
            let orderTime = new Date();
            let orderTimeFormat;
            if(orderTime.getMinutes()<10){
                orderTimeFormat = orderTime.getHours().toLocaleString()+':0'+orderTime.getMinutes()
            }else{
                orderTimeFormat = orderTime.getHours().toLocaleString()+':'+orderTime.getMinutes()
            }
                try {
                await setDoc(doc(db, "Orders", newId), {
                    id: newId,
                    phone: userData.phone,
                    deliveryAddress: address,
                    pickupAddress:filteredData[0].restaurantAddress,
                    fromRestaurant: userCart[0].restaurant,
                    restaurantImg: userCart[0].restaurantImg,
                    products: userCart,
                    paymentMethod: payment,
                    total: delivery+tip+cartTotal,
                    orderedBy: localStorage.getItem('currentUserId'),
                    orderedTo: userCart[0].restaurantId,
                    status: 0,
                    orderDate: orderDateFormat,
                    orderTime: orderTimeFormat
                  });
                setOrderModal(false); 
                setOrderDialog(true); 
                setTimeout(() => {
                    setOrderDialog(false); 
                    window.location.reload();
                }, 2000);
                emptyCart();
        } catch (error) {
            console.log(error)
        }
       }else {
            setAddressError(true)
       }
    }
    const deleteCartProduct= async(item,index)=>{
        let deleteItems = document.querySelectorAll('.cart-item-div')
        deleteItems[index].classList.add('remove-animation')
        try {
            const userRef = doc(db, 'UsersDetails', localStorage.getItem('currentUserId'));
            const userDoc = await getDoc(userRef);
            const cart = userDoc.data().cart;
            const productIndex = cart.findIndex(c => c.id === item.id);
            if (productIndex !== -1) {
                cart.splice(productIndex, 1);
                await updateDoc(userRef, { cart });
            } 
            showCart();
            getUserData();
    } catch (error) {
        console.log(error)
    }
        
    }

    const customAnimation = keyframes`
        from {
            opacity: 0;
            transform: translate3d(100px, -100px, 0);
        }

        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
`;
    
        

    return(
            <div className="dashboard-div dashboard">
            {clientTab==='home' ?
                <div className='home-dashboard'>
                <input type="text" className='search-bar' placeholder='Search for restaurants' value={searchInput} onChange={(e)=>{setSearchInput(e.target.value)}} />
                    <FaSearch className='search-bar-magnification'/>
                    <div className='restaurants-list'>
                        {loading ? <Loader/> : restaurantData.map((restaurant,index) => (
                            <Slide duration={100} triggerOnce='true' key={restaurant.id}>
                              <RestaurantCard 
                                id={restaurant.id}
                                name={restaurant.name}
                                image={restaurant.image}
                            />  
                            </Slide> 
                        ))}
                    </div>
                    {restaurantData.length> 0 || loading ? '': <p style={{textAlign:'center', color:'white', fontSize:'24px', width:'100%'}}>No results</p>} 
                </div>
            :''}
            
            {clientTab==='cart' ?
                <div className='cart-div' >
                 <div className={`individual-back ${orderModal?'pointer-none':''}`} onClick={back}>
                    <FaArrowLeftLong />
                </div>
                    <div className={`cart-item-list ${orderModal?'pointer-none':''}`} >
                        {loading ? <Loader/> : userCart.map((item, index) => (
                            <Slide key={item.id} triggerOnce="true" duration={index*100}>
                                <div className='cart-item-div'>
                                    <img src={item.image} alt="" className='cart-item-img'/>
                                    <div >
                                        <p className='cart-item-name'>{item.productName}</p>
                                        <p className='cart-item-price'>{`${item.productPrice},00 lei`}</p>
                                        
                                    </div>
                                    <button onClick={()=>{deleteCartProduct(item,index)}} className='trash'><IoTrashOutline className='trash'/></button>

                                </div>
                            </Slide>
                            
                        ))}
                    </div>
                    {cartQty>0 ?  <div className='cart-div-bottom'>
                        <p style={{fontSize:'24px'}}>{`Total: ${cartTotal},00 lei`}</p>
                        <button className='place-order-btn' onClick={()=>{setOrderModal(true)}}>Continue</button>
                     </div>
                    :<div className='empty'>
                        <p>Empty Cart</p>
                        <button onClick={()=>{setClientTab('home')}}>Add products</button>
                    </div>}
                     <div className={`order-modal ${orderModal?'open':'close'}`}>
                        <button onClick={()=>{setOrderModal(false)}} className='close-btn'><IoMdClose /></button>
                        <div className='order-review'>
                            <p>Phone: {userData?.phone}</p>
                            <div>
                                <p htmlFor="">Address:</p>
                                <textarea  value={address} onChange={(e)=>{setAddress(e.target.value)}} className={`address-area ${addressError?'error-area':''}`} name="" id="" cols="30" rows="3" ></textarea>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', rowGap:'8px'}}>
                                <p>Tip the courier?</p>
                                <div className='flex-space'>
                                    <button onClick={()=>{setTip(0)}} className={`tip-btn ${tip===0 ?'active':''}`}>No tips</button>
                                    <button onClick={()=>{setTip(3)}} className={`tip-btn ${tip===3 ?'active':''}`}>3,00 lei</button>
                                    <button onClick={()=>{setTip(5)}} className={`tip-btn ${tip===5 ?'active':''}`}>5,00 lei</button>
                                    <button onClick={()=>{setTip(10)}} className={`tip-btn ${tip===10 ?'active':''}`}>10,00 lei</button>
                                </div>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', rowGap:'4px'}}>
                                <div className='flex-space'><p>Subtotal: </p><p>{cartTotal},00 lei</p></div>
                                <div className='flex-space'><p>Tip:</p><p>{tip},00 lei</p></div>
                                <div className='flex-space'><p>Delivery:</p><p>{delivery},00 lei</p></div>
                                <div className='flex-space'><p>Total:</p><p>{delivery+tip+cartTotal},00 lei</p></div>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', rowGap:'4px'}}>
                                <p>Payment method:</p>
                                <div className='payment-div'>
                                    <button onClick={()=>{setPayment('Cash')}} className={`${payment==='Cash'?'active':'inactive'}`}>Cash</button>
                                    <button onClick={()=>{setPayment('Card')}} className={`${payment==='Card'?'active':'inactive'}`}>Card</button>
                                </div>
                            </div>
                        </div>
                        <button onClick={confirmOrder} className='confirm-order-btn'>Confirm Order</button>
                    </div>
                </div>   
            :''}

            {clientTab==='profile' ?
                <div className='profile-div'>
                     <div className={`individual-back ${myOrdersModal?'pointer-none':''}`} onClick={back}>
                        <FaArrowLeftLong />
                    </div>
                    <h2>{userData?.email}</h2>
                    <div>
                        <input className={`${editPhoneMode?'editable':'noedit'} profile-phone`} type="number" value={profilePhone} onChange={(e)=>{setProfilePhone(e.target.value)}} />
                        {editPhoneMode?<FaCheck style={{fontSize:'20px', marginLeft:'12px'}} onClick={editPhone}/>:<FaRegEdit onClick={editPhone} style={{fontSize:'20px', marginLeft:'12px'}}/>}
                    </div>
                    <button className='sign-out' onClick={()=>{setMyOrdersModal(true)}}>My Orders</button>
                    <button className='sign-out' onClick={signOut}>Log out</button>
                    <div className={`my-orders-modal ${myOrdersModal ? 'open':'close'}`}>
                        <button onClick={()=>{setMyOrdersModal(false)}} className='close-btn'><IoMdClose /></button>
                        {myOrdersData.length>0 ?
                            <div className='my-orders-div'>
                                {myOrdersData?.map((data)=>{
                                    return(
                                        <div key={data.id} className='flex-order'>
                                            <img className='my-orders-img' src={data.restaurantImg} alt="" />
                                            <div className='my-order-details'>
                                                <p>{data.orderDate}</p>
                                                <p>{data.orderTime}</p>
                                                <p>{data.fromRestaurant}</p>
                                                <p>{data.total},00 lei</p>
                                                <p style={{textTransform:'capitalize'}}>{status[data.status]}</p>
                                            </div>
                                            
                                        </div>
                                        )   
                                })}
                            </div> 
                        : <div className='no-orders'>
                            <p>No orders</p>
                            <button onClick={()=>{setClientTab('home')}}>Add products</button>
                        </div>}
                    </div>
                </div>
            :''}
            
            <NavbarClient hideNav={hideNav} cartQty={cartQty} goHome={()=>{setClientTab('home')}} showCart={showCart} focusSearch={focusSearch} showProfile={showProfile}/>
            <div className={orderDialog?'dialog-order-open':'dialog-order-closed'}><FaCheck/>Order successfully placed!</div>
        </div>
    );
    
}

export default Dashboard;  
