import './ProductCard.css'
import { useNavigate } from 'react-router-dom';

function ProductCard(props){
    const navigate = useNavigate();
    
    const cardClick = ()=>{
       
        
    }

    return(
        <div className='product-card-div' onClick={cardClick}>
            <div className='product-card-left'>
                <p>{props.name}</p>
                <p>{props.price},00 lei</p>
            </div>
            <img src={props.image} alt="" className='product-image' />
        </div>
        
    );
}

export default ProductCard;