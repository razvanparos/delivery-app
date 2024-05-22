import { Fade } from 'react-awesome-reveal';
import './RestaurantCard.css'
import { MdOutlineDeliveryDining } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import 'lazysizes';



function RestaurantCard(props){
    const navigate = useNavigate();
    const cardClick = ()=>{
        navigate(`/dashboard-restaurant/${props.name}/${props.id}`)
        
    }

    return(
        <div className='restaurant-card-div' onClick={cardClick}>
            <img data-src={props.image} alt="imagine-mancare" className='restaurant-image lazyload'/>
            <div className='card-bottom'>
               <p className='card-name'>{props.name}</p> 
               <div className='flex'>
                    <MdOutlineDeliveryDining className='scooter'/>
                    <p className='delivery-price'>3,00 lei</p>
               </div>
            </div>
        </div>
    );
}

export default RestaurantCard;