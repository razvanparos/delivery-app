import './RestaurantCard.css'
import { MdOutlineDeliveryDining } from "react-icons/md";

function RestaurantCard(props){
    return(
        <div className='restaurant-card-div' onClick={()=>{console.log(props.name)}}>
            <img src={props.image} alt="imagine-mancare" className='restaurant-image'/>
            <div className='card-bottom'>
               <p className='card-name'>{props.name}</p> 
               <div className='flex'>
                    <MdOutlineDeliveryDining className='scooter'/>
                    <p className='delivery-price'>2,99 lei</p>
               </div>
               
            </div>
            
        </div>
        
    );
}

export default RestaurantCard;