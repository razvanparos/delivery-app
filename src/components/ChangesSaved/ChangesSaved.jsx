import { useState } from 'react';
import './ChangesSaved.css'
import { IoCheckmarkCircle } from "react-icons/io5";
function ChangesSaved(props){
    // const [changes,setChanges]=useState(props.ChangesSaved)
    return(
        <div className={`changes-saved-div ${props.changesSaved?'show':'hidden'}`}>
                <IoCheckmarkCircle className='verified'/>
                <p>Changes Saved!</p>
        </div>
        
    );
}

export default ChangesSaved;