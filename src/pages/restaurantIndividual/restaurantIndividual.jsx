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
import { IoMdClose } from "react-icons/io";




function RestaurantIndividual(){
    const {restaurantName, restaurantId}  = useParams();
    const [individualData, setIndividualData]=useState();
    const [userType, setUserType]=useState(localStorage.getItem('userType'));
    const restaurantsDb = collection(db,'Restaurants')
    const [loading, setLoading] = useState(false)
    const [productModal, setProductModal] = useState(false)
    const [viewProductModal, setViewProductModal] = useState(false)
    const [productQty, setProductQty] = useState(1)
    const [productData, setProductData] = useState()
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
    const viewProduct = (props) =>{
        setViewProductModal(true);
        setProductData(props);
    }
    // useEffect(()=>{
    //     console.log(productData)
    // },[productData])
    
    return(
        <div>
            {loading ? <Loader/> : 
            <div className={`restaurant-individual-div ${productModal ?'pointer-none':''} ${viewProductModal ?'pointer-none':''}`}>
                <div className='individual-back' onClick={back}>
                    <FaArrowLeftLong />
                </div>
                <img src={individualData?.image} alt="" className='individual-image'/>
                <h2 className='restaurant-name'>{individualData?.name}</h2>
                {userType==='restaurant' ?
                    <button className='add-product-btn' onClick={()=>{setProductModal(true); window.scrollTo({ top: 0, behavior: 'smooth' });}}>
                        Add product<FaSquarePlus className='add-product-icon'/>
                    </button>: ''}

                <div className='products-list'>
                    {individualData?.products?.map((product)=>{
                        return <ProductCard
                                    key={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.image}
                                    viewProduct={viewProduct}
                                />
                    })}
                    
                </div>
            </div>
            }

            <div className={`product-modal ${productModal ? 'open':'close'}`}>
                <button onClick={()=>{setProductModal(false)}} className='close-btn'><IoMdClose /></button>
                <form className='add-product-form'>
                    <label htmlFor="">Name</label>
                    <input type="text" placeholder='Product name'/>
                    <label htmlFor="">Price</label>
                    <input type="number" placeholder='Price of the product'/>
                    <label htmlFor="">Product image</label>
                    <input type="file" className='file-product'/>
                    <button className='product-modal-submit'>Submit</button>
                </form>
            </div>    
            <div className={`product-view-modal ${viewProductModal ? 'open':'close'}`}>
                <button onClick={()=>{setViewProductModal(false); setProductQty(1)}} className='close-btn'><IoMdClose /></button>
                <img src={productData?.image} alt="" className='product-modal-image'/>
                <div className='product-details'>
                    <p className='product-name'>{productData?.name}</p>
                    <p>{productData?.price},00 lei</p>
                </div>
                <div className='buttons-div'>
                    <button>Delete product</button>
                    <button>Edit Product</button>
                </div>
                <div className='buttons-div'>
                    <div className='qty-div'>
                        <button onClick={()=>{if(productQty>1){setProductQty(productQty-1)}}}>-</button>
                        <p>{productQty}</p>
                        <button onClick={()=>{setProductQty(productQty+1)}}>+</button>
                    </div>
                    <button>Add {productData?.price*productQty},00 lei</button>
                </div>
            </div>    
        
        </div>
        
    );
}

export default RestaurantIndividual;