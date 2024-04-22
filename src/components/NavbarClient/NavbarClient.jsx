import './NavbarClient.css'
import { FaHouse } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaUser } from "react-icons/fa";



function NavbarClient(){
    return(
        <div className='navbar-client-div'>
            <FaHouse className='icon'/>
            <FaSearch className='icon'/>
            <FaShoppingCart className='icon'/>
            <FaUser className='icon'/>
        </div>
        
    );
}

export default NavbarClient;