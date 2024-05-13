import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import {getDocs,getDoc, collection, query, where, doc, setDoc,updateDoc,arrayUnion} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import NavbarClient from '../../components/NavbarClient/NavbarClient';
import { FaSearch } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

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
    const [payment, setPayment]=useState('Cash');


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
    const getUserData = async () =>{
        try{
            const q = query(usersDb, where("id", "==", localStorage.getItem('currentUserId')));
            const querySnapshot = await getDocs(q);
            const filteredData = querySnapshot.docs.map((doc)=>({
                ...doc.data(),
                id: doc.id,
            }))
            setUserData(filteredData[0])
            
            setCartQty(filteredData[0].cart.length)
            
            } catch(err){
                   console.log(err)
             }    
        }
    
      useEffect(() => {
        
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
               setOriginalRestaurantData(filteredData)
               setLoading(false);
               } catch(err){
                setLoading(false);
                   console.log(err)
               }
        }
        getRestaurantData();
        },[])

        useEffect(() => {
            let originalData=originalRestaurantData;
            const filteredData = originalData.filter(item => item.name.toLowerCase().includes(searchInput.toLowerCase()));
            setRestaurantData(filteredData);       
        }, [searchInput]);

    useEffect(()=>{
        console.log(restaurantData)
    },[searchInput])

  
    window.addEventListener('scroll',function(){
   
        let maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
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
        if(clientTab==='cart'){
            setHideNav(true)
        }
        if(clientTab==='profile'){
            setHideNav(true)
        }
        
    
    })

    const signOut = () =>{
        localStorage.setItem('LoggedIn',false)
        localStorage.setItem('RememberMe',false)
        localStorage.setItem('currentUserId',0)
        navigate('/');
    }
    const back = () =>{
        setClientTab('home')
     }
    const showCart = () =>{
        setHideNav(true)
        setClientTab('cart')
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
    const confirmOrder=async()=>{
       if(address){
            setAddressError(false);
            var newId = "id" + Math.random().toString(16).slice(2)
                try {
                // setLoading(true);
                await setDoc(doc(db, "Orders", newId), {
                    id: newId,
                    phone: userData.phone,
                    address: address,
                    products: userCart,
                    paymentMethod: payment,
                    total: delivery+tip+cartTotal,
                    orderedBy: localStorage.getItem('currentUserId'),
                    status:'ordered'
                  });
                // setLoading(false);
                setOrderModal(false); 
                setAddress('')
        } catch (error) {
            // setLoading(false);
        }
        

       }else {
            setAddressError(true)
       }
    }
    const deleteCartProduct= async(item)=>{
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
        

    return(
        <div className="dashboard-div dashboard">
            {clientTab==='home' ?
                <div className='home-dashboard'>
                <input type="text" className='search-bar' placeholder='Search for restaurants' value={searchInput} onChange={(e)=>{setSearchInput(e.target.value)}} />
                    <FaSearch className='search-bar-magnification'/>
                    <div className='restaurants-list'>
                        {loading ? <Loader/> : restaurantData.map((restaurant) => (
                            <RestaurantCard 
                                key={restaurant.id}
                                id={restaurant.id}
                                name={restaurant.name}
                                image={restaurant.image}
                            />
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
                        {loading ? <Loader/> : userCart.map((item) => (
                            <div key={item.id} className='cart-item-div'>
                                <img src={item.image} alt="" className='cart-item-img'/>
                                <div >
                                    <p className='cart-item-name'>{item.productName}</p>
                                    <p className='cart-item-price'>{`${item.productPrice},00 lei`}</p>
                                    
                                </div>
                                <button onClick={()=>{deleteCartProduct(item)}} className='trash'><IoTrashOutline className='trash'/></button>

                            </div>
                        ))}
                    </div>
                    {cartQty>0 ?  <div className='cart-div-bottom'>
                        <p>{`TOTAL: ${cartTotal},00 lei`}</p>
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
                <div>
                    aici e profile
                    <button onClick={signOut}>sign out</button>
                </div>
            :''}
            
            <NavbarClient hideNav={hideNav} cartQty={cartQty} goHome={()=>{setClientTab('home')}} showCart={showCart} focusSearch={focusSearch} showProfile={showProfile}/>
            
        </div>
    );
    
}

export default Dashboard;  
