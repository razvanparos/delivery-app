import { useEffect, useState } from 'react';
import './dashboard.css'
import { useNavigate } from 'react-router-dom';
import {getDocs, collection, query, where, doc, setDoc} from 'firebase/firestore';
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
    const [loading, setLoading] = useState(false)
    const [hideNav, setHideNav] = useState(false)
    const [searchInput, setSearchInput]=useState('');
    const [initialScroll, setInitialScroll]=useState(0);
    const [originalRestaurantData, setOriginalRestaurantData]=useState([]);


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
    if(window.scrollY > maxScroll-50){
        setHideNav(true)
    }
    })

   

    const signOut = () =>{
        localStorage.setItem('LoggedIn',false)
        localStorage.setItem('RememberMe',false)
        localStorage.setItem('currentUserId',0)
        navigate('/');
    }
        
        

    return(
        <div className="dashboard-div dashboard">
            <input type="text" className='search-bar' placeholder='Search for restaurants' value={searchInput} onChange={(e)=>{setSearchInput(e.target.value)}} />
            <FaSearch className='search-bar-magnification'/>
            <div className='restaurants-list'>
                {loading ? <Loader/> : restaurantData.map((restaurant) => (
                    <RestaurantCard 
                        key={restaurant.id}
                        name={restaurant.name}
                        image={restaurant.image}
                    />
                ))}
            </div>
            {restaurantData.length> 0 ? '': 'No results'}
            <NavbarClient hideNav={hideNav}/>
            {/* <button onClick={signOut}>sign out</button> */}
        </div>
    );
    
}

export default Dashboard;  
