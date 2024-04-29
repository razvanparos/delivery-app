import './restaurantIndividual.css';
import { useParams } from 'react-router-dom';
import {getDocs,getDoc, collection, query, where, doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import { useEffect, useState } from 'react';
import { FaSquarePlus } from "react-icons/fa6";
import ProductCard from '../../components/ProductCard/ProductCard';




function RestaurantIndividual(){
    const {restaurantName, restaurantId}  = useParams();
    const [individualData, setIndividualData]=useState();
    const [userType, setUserType]=useState(localStorage.getItem('userType'));
    const restaurantsDb = collection(db,'Restaurants')

    useEffect(()=>{
        const getIndividualData = async () =>{
            try{
                const docRef = doc(db, 'Restaurants',restaurantId)
                const querySnapshot = await getDoc(docRef);
                setIndividualData(querySnapshot.data())
                } catch(err){
                    console.log(err)
                }
        }
        getIndividualData();
    },[])
    // useEffect(()=>{
    //     console.log(individualData)
    // },[individualData])
    
    return(
        <div className='restaurant-individual-div'>
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
        
    );
}

export default RestaurantIndividual;