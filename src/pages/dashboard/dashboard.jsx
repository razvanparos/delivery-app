import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import {getDocs,getDoc, collection, query, where, doc, setDoc,updateDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import Loader from '../../components/Loader/Loader';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import NavbarClient from '../../components/NavbarClient/NavbarClient';
import { FaSearch } from "react-icons/fa";

function Dashboard(){
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));
    const [userData, setUserData]=useState();
    const [restaurantData, setRestaurantData]=useState([]);
    const [userCart, setUserCart]=useState([]);
    const [loading, setLoading] = useState(false)
    const [hideNav, setHideNav] = useState(false)
    const [searchInput, setSearchInput]=useState('');
    const [initialScroll, setInitialScroll]=useState(0);
    const [originalRestaurantData, setOriginalRestaurantData]=useState([]);
    const [clientTab, setClientTab]=useState('home');
    const [cartTotal, setCartTotal]=useState(0);


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

    useEffect(() => {
        let currentUID = localStorage.getItem('currentUserId')
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
            setHideNav(false)
        }
        if(clientTab==='profile'){
            setHideNav(false)
        }
        
    
    })

    const signOut = () =>{
        localStorage.setItem('LoggedIn',false)
        localStorage.setItem('RememberMe',false)
        localStorage.setItem('currentUserId',0)
        navigate('/');
    }
    const showCart = () =>{
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
    const deleteCartProduct= async(item)=>{
        console.log(item)
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
    } catch (error) {
        console.log(error)
    }
        
    }
        

    return(
        <div className="dashboard-div dashboard">
            {clientTab==='home' ?
                <div className='dashboard-div'>
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
                <div>
                     {loading ? <Loader/> : userCart.map((item) => (
                        <div key={item.id}>
                            <button onClick={()=>{deleteCartProduct(item)}}>delete</button>
                            <p>{`${item.productName} - ${item.productPrice},00 lei`}</p>
                        </div>
                           
                        ))}
                        <p>{`TOTAL: ${cartTotal},00 lei`}</p>
                </div>
            :''}

            {clientTab==='profile' ?
                <div>
                    aici e profile
                    <button onClick={signOut}>sign out</button>
                </div>
            :''}
            
            <NavbarClient hideNav={hideNav} goHome={()=>{setClientTab('home')}} showCart={showCart} focusSearch={focusSearch} showProfile={showProfile}/>
            
        </div>
    );
    
}

export default Dashboard;  
