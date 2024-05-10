import './restaurantIndividual.css';
import { useParams } from 'react-router-dom';
import {getDocs,getDoc, collection, query, where, doc, setDoc, updateDoc, arrayUnion} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {storage} from '../../firebase-config'
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
    const [productsData, setProductsData] = useState()
    const [newProductName, setNewProductName] = useState('')
    const [newProductPrice, setNewProductPrice] = useState('')

    const navigate = useNavigate();

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
    useEffect(()=>{
        getIndividualData();
    },[])

    const back = () =>{
       navigate('/dashboard-restaurant')
    }
    const viewProduct = (props) =>{
        setViewProductModal(true);
        setProductData(props);
    }
    const addNewProduct = async (e)=>{
        e.preventDefault();
        const fileInput = document.getElementById('file-product');
        const file = fileInput.files[0]; 
        const imageRef = ref(storage, newProductName);
        if(newProductName && newProductPrice && file ){
            try {
            setLoading(true);
            var newId = "id" + Math.random().toString(16).slice(2)
            await uploadBytes(imageRef, file);
            const imageUrl = await getDownloadURL(imageRef);
            const restaurantRef = doc(db, 'Restaurants', restaurantId);
            await updateDoc(restaurantRef,{
                products: arrayUnion({
                    id: newId,
                    name: newProductName,
                    price: Number(newProductPrice),
                    image: imageUrl
                })
            });
            setLoading(false);
            setNewProductName('')
            setNewProductPrice('')
            setProductModal(false); 
            getIndividualData();
        
        } catch (error) {
            setLoading(false);
            console.error("Error uploading image:", error);
        }
          }
    }

    const deleteProduct = async ()=>{
        setViewProductModal(false);
        setLoading(true);
        const restaurantRef = doc(db, 'Restaurants', restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);
        const products = restaurantDoc.data().products;
        const productIndex = products.findIndex(product => product.id === productData.id);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            await updateDoc(restaurantRef, { products });
        } 
        getIndividualData();
        setLoading(false);
    }

    // useEffect(()=>{
    //     console.log(productsData)
    // },[productsData])
    
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
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.image}
                                    viewProduct={viewProduct}
                                />
                    })}
                    
                </div>
            </div>
            }
            
            {loading?'':
                <div className={`product-modal ${productModal ? 'open':'close'}`}>
                    <button onClick={()=>{setProductModal(false)}} className='close-btn'><IoMdClose /></button>
                    <form className='add-product-form'>
                        <label htmlFor="">Name</label>
                        <input type="text" placeholder='Product name' value={newProductName}  onChange={(e)=>{setNewProductName(e.target.value)}}/>
                        <label htmlFor="">Price</label>
                        <input type="number" placeholder='Price of the product' value={newProductPrice}  onChange={(e)=>{setNewProductPrice(e.target.value)}}/>
                        <label htmlFor="">Product image</label>
                        <input type="file" className='file-product' id='file-product'/>
                        <button className='product-modal-submit' onClick={addNewProduct}>Submit</button>
                    </form>
                </div>    
            }
            
            {loading?'':
           
                <div className={`product-view-modal ${viewProductModal ? 'open':'close'}`}>
                    <button onClick={()=>{setViewProductModal(false); setProductQty(1)}} className='close-btn'><IoMdClose /></button>
                    <img src={productData?.image} alt="" className='product-modal-image'/>
                    <div className='product-details'>
                        <p className='product-name'>{productData?.name}</p>
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga deserunt, dolore minima, deleniti accusamus exercitationem voluptas ipsum necessitatibus asperiores numquam et cumque! Pariatur quasi nemo quas et corrupti! Atque, incidunt!</p>
                        <p className='product-price'>{productData?.price},00 lei</p>
                    </div>
                    {userType === 'restaurant'?
                    <div className='buttons-div'>
                        <button className='delete-btn' onClick={deleteProduct}>Delete product</button>
                        <button className='edit-btn'>Edit Product</button>
                    </div>
                    :
                    <div className='buttons-div'>
                        <div className='qty-div'>
                            <button onClick={()=>{if(productQty>1){setProductQty(productQty-1)}}}>-</button>
                            <p>{productQty}</p>
                            <button onClick={()=>{setProductQty(productQty+1)}}>+</button>
                        </div>
                        <button>Add {productData?.price*productQty},00 lei</button>
                    </div>
                    }
                    
                
                </div>
            }
       
        </div>
        
    );
}

export default RestaurantIndividual;