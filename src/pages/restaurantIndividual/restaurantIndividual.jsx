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
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

function RestaurantIndividual(){
    const {restaurantName, restaurantId}  = useParams();
    const [individualData, setIndividualData]=useState();
    const [userType, setUserType]=useState(localStorage.getItem('userType'));
    const restaurantsDb = collection(db,'Restaurants')
    const [loading, setLoading] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [cartError, setCartError] = useState(false)
    const [productModal, setProductModal] = useState(false)
    const [viewProductModal, setViewProductModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [productQty, setProductQty] = useState(1)
    const [productData, setProductData] = useState()
    const [newProductName, setNewProductName] = useState('')
    const [editProductName, setEditProductName] = useState('')
    const [newProductPrice, setNewProductPrice] = useState('')
    const [editProductPrice, setEditProductPrice] = useState('')
    const [editProductButtonText, setEditProductButtonText] = useState('Edit Product')

    const navigate = useNavigate();

   const getIndividualData = async () =>{
            try{
                setLoading(true)
                const docRef = doc(db, 'Restaurants',restaurantId)
                const querySnapshot = await getDoc(docRef);
                console.log(querySnapshot.data())
                setIndividualData(querySnapshot.data())
                setLoading(false)
                } catch(err){
                    setLoading(false)
                    console.log(err)
                }
    }
    useEffect(()=>{
        getIndividualData();
        console.log(individualData)
    },[])

    const back = () =>{
       navigate('/dashboard-restaurant')
    }
    const  viewProduct = (props) =>{
        setViewProductModal(true);
        setProductData(props);
        setEditProductName(props.name)
        setEditProductPrice(props.price)
    }
    const addNewProduct = async (e)=>{
        e.preventDefault();
        var newId = "id" + Math.random().toString(16).slice(2)
        const fileInput = document.getElementById('file-product');
        const file = fileInput.files[0]; 
        const imageRef = ref(storage, newId);
        if(newProductName && newProductPrice && file ){
            try {
            setLoading(true);
            await uploadBytes(imageRef, file);
            const imageUrl = await getDownloadURL(imageRef);
            const restaurantRef = doc(db, 'Restaurants', restaurantId);
            await updateDoc(restaurantRef,{
                products: arrayUnion({
                    id: newId,
                    name: newProductName,
                    price: Number(newProductPrice),
                    image: imageUrl,
                    restaurantId: restaurantId
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
        const restaurantRef = doc(db, 'Restaurants', restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);
        const products = restaurantDoc.data().products;
        const productIndex = products.findIndex(product => product.id === productData.id);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            await updateDoc(restaurantRef, { products });
        } 
        getIndividualData();
        setTimeout(() => {
            setViewProductModal(false);   
        }, 500);
        
    }
    const editProduct = async ()=>{
        if(editProductButtonText==='Save Changes'){
            if(editProductName && editProductPrice){
                try {
                    const restaurantRef = doc(db, 'Restaurants', restaurantId);
                    const restaurantDoc = await getDoc(restaurantRef);
                    const products = restaurantDoc.data().products;
                    const productIndex = products.findIndex(product => product.id === productData.id);
                    if (productIndex !== -1) {
                        products[productIndex] = {
                            id: productData.id,
                            name: editProductName,
                            price: Number(Math.floor(editProductPrice)), 
                            image: productData.image,
                            restaurantId: restaurantId
                        };
                        await updateDoc(restaurantRef, { products });
                    } 
            } catch (error) {
                setLoading(false);
            }
            setEditMode(false);
            setEditProductButtonText('Edit Product')
            getIndividualData();
            }
            
        }else{
            setEditProductButtonText('Save Changes')
            setEditMode(true);
            document.querySelector('#name-input').focus()
        }
    }

    const addProductToCart = async(item)=>{
        const productLoop=async()=>{
            for(let i=0;i<productQty;i++){
                try {
                    var newId = "id" + Math.random().toString(16).slice(2)
                    const userRef = doc(db, 'UsersDetails', localStorage.getItem('currentUserId'));
                    await updateDoc(userRef,{
                        cart: arrayUnion({
                            id: newId,
                            productName: item.name,
                            productPrice: Number(item.price),
                            image: item.image,
                            restaurant: individualData.name,
                            restaurantImg: individualData.image,
                            restaurantId: item.restaurantId
                        })
                    });
                    setShowDialog(true); 
                    setTimeout(() => {
                        setShowDialog(false); 
                    }, 3000);
                
                } catch (error) {
                    console.log(error)
                } 
         } 
         }
        try{
            const userRef = doc(db, 'UsersDetails', localStorage.getItem('currentUserId'));
            const querySnapshot = await getDoc(userRef);
            let cartQty=querySnapshot.data().cart.length;
            if(cartQty===0){
               productLoop();
            }else if(querySnapshot.data().cart[0].restaurantId===restaurantId){
                productLoop();
            }else {
                setCartError(true)
                setTimeout(() => {
                    setCartError(false)
                }, 3000);
            }
            
           } catch(err){
               console.log(err)
           }
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
                                    restaurantId={product.restaurantId}
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
                        <input type="text" id='name-input' className={`product-name ${editMode?'editable':'noedit'}`} value={editProductName} onChange={(e)=>{setEditProductName(e.target.value)}} />
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga deserunt, dolore minima, deleniti accusamus exercitationem voluptas ipsum necessitatibus asperiores numquam et cumque! Pariatur quasi nemo quas et corrupti! Atque, incidunt!</p>
                        <div className='price-div'>
                            <input type="number" style={{ width: `${(editProductPrice.toString().length + 5) * 10}px`, marginRight:`${(editProductPrice.toString().length-35)}px`}} className={`product-price ${editMode?'editable':'noedit'}`} value={editProductPrice} onChange={(e)=>{const newValue=Math.min(parseInt(e.target.value),9999); setEditProductPrice(newValue)}} max={9999}/>
                            <p>,00 lei</p>
                        </div>
                    </div>
                    {userType === 'restaurant'?
                    <div className='buttons-div'>
                        <button className='delete-btn' onClick={deleteProduct}>Delete product</button>
                        <button className='edit-btn' onClick={editProduct}>{editProductButtonText}</button>
                    </div>
                    :
                    <div className='buttons-div'>
                        <div className='qty-div'>
                            <button className='qty-change' onClick={()=>{if(productQty>1){setProductQty(productQty-1)}}}>-</button>
                            <p className='productQty'>{productQty}</p>
                            <button className='qty-change' onClick={()=>{setProductQty(productQty+1)}}>+</button>
                        </div>
                        <button onClick={()=>{addProductToCart(productData)}} className='add-to-cart-btn'>Add {productData?.price*productQty},00 lei</button>
                    </div>
                    }
                    
                   
                </div>
            }
            <div className={showDialog?'dialog-box-open':'dialog-box-closed'}><FaCheck/>Added to cart!</div>
            <div className={cartError?'dialog-cart-open':'dialog-cart-closed'}><IoClose className='x'/>Only one restaurant per order</div>
        </div>
        
    );
}

export default RestaurantIndividual;