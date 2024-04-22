import './RestaurantCard.css'

function RestaurantCard(props){
    return(
        <div className='restaurant-card-div'>
            <img src={props.image} alt="imagine-mancare" className='restaurant-image'/>
            <p>{props.name}</p>
        </div>
        
    );
}

export default RestaurantCard;