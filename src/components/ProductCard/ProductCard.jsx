import { Fade } from 'react-awesome-reveal';
import './ProductCard.css'
import { useNavigate } from 'react-router-dom';

function ProductCard(props){
    const navigate = useNavigate();
    
    const cardClick = ()=>{
        props.viewProduct(props);
    }

    return(
        <div className='product-card-div' onClick={cardClick}>
            <div className='product-card-left'>
                <p className='product-name'>{props.name}</p>
                <p>{props.price},00 lei</p>
            </div>
            <Fade duration={2000}><img src={props.image} alt="" className='product-image' /></Fade>
        </div>
        
    );
}

export default ProductCard;