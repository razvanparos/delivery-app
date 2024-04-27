import './restaurantIndividual.css';
import { useParams } from 'react-router-dom';

function RestaurantIndividual(){
    const {restaurantName}  = useParams();
    
    return(
        <div className='restaurant-individual-div dashboard'>
            <h2 className='restaurant-name'>{restaurantName.replace('-', ' ')}</h2>
        </div>
        
    );
}

export default RestaurantIndividual;