import './NavbarClient.css'
import { FaHouse } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaUser } from "react-icons/fa";



function NavbarClient(props){
    return(
        <div className={`navbar-client-div ${props.hideNav ? 'hideNav' : 'showNav' }` }>
            <FaHouse className='icon' onClick={props.goHome}/>
            <FaSearch className='icon' onClick={props.focusSearch}/>
            <div style={{position:'relative'}}>
                {props.cartQty>0?<div className='cart-qty'>{props.cartQty}</div>:''}
                <FaShoppingCart className='icon' onClick={props.showCart}/>
            </div>
            
            <FaUser className='icon' onClick={props.showProfile}/>
        </div>
        
    );
}

export default NavbarClient;