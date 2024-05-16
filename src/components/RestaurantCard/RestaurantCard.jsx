import './RestaurantCard.css'
import { MdOutlineDeliveryDining } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function RestaurantCard(props){
    const navigate = useNavigate();
    const cardClick = ()=>{
        const formattedName = props.name.toLowerCase().replace(/\s+/g, '-');
        console.log(props.id)
        navigate(`/dashboard-restaurant/${props.name}/${props.id}`)
        
    }

    return(
        <div className='restaurant-card-div' onClick={cardClick}>
            <img src={props.image} alt="imagine-mancare" className='restaurant-image'/>
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