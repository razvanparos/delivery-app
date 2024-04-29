import './restaurantIndividual.css';
import { useParams } from 'react-router-dom';
import {getDocs,getDoc, collection, query, where, doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import { useEffect, useState } from 'react';
import { FaSquarePlus } from "react-icons/fa6";
import ProductCard from '../../components/ProductCard/ProductCard';
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';



function RestaurantIndividual(){
    const {restaurantName, restaurantId}  = useParams();
    const [individualData, setIndividualData]=useState();
    const [userType, setUserType]=useState(localStorage.getItem('userType'));
    const restaurantsDb = collection(db,'Restaurants')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    useEffect(()=>{
        const getIndividualData = async () =>{
            try{
                setLoading(true)
                const docRef = doc(db, 'Restaurants',restaurantId)
                const querySnapshot = await getDoc(docRef);
                setIndividualData(querySnapshot.data())
                setLoading(false)
                } catch(err){
                    setLoading(false)
                    console.log(err)
                }
        }
        getIndividualData();
    },[])

    const back = () =>{
       navigate('/dashboard-restaurant')
    }
    // useEffect(()=>{
    //     console.log(individualData)
    // },[individualData])
    
    return(
        <div className='restaurant-individual-div'>
            {loading ? <Loader/> : 
            <div className='restaurant-individual-div'>
                <div className='individual-back' onClick={back}>
                    <FaArrowLeftLong />
                </div>
                <img src={individualData?.image} alt="" className='individual-image'/>
                <h2 className='restaurant-name'>{individualData?.name}</h2>
                {userType==='restaurant' ?
                    <button className='add-product-btn'>
                        Add product<FaSquarePlus className='add-product-icon'/>
                    </button>: ''}

                <div className='products-list'>
                    {individualData?.products?.map((product)=>{
                        return <ProductCard
                                    key={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.image}
                                />
                    })}
                    
                </div>
            </div>
            
            }
            
        </div>
        
    );
}

export default RestaurantIndividual;