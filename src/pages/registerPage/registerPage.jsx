import { useState, useEffect } from 'react'
import './registerPage.css'
import { useNavigate } from 'react-router-dom';
import {auth} from '../../firebase-config';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {db} from '../../firebase-config';
import { doc, setDoc } from "firebase/firestore"; 
import Loader from '../../components/Loader/Loader';

function RegisterPage(){
    const [inputPhone, setInputPhone] = useState('')
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')
    const [userType, setUserType] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    
    const handleRegister=async(e)=>{
        e.preventDefault();
        if(inputPhone && inputEmail && inputPassword && userType){
          try{
            setLoading(true);
            await createUserWithEmailAndPassword(auth, inputEmail, inputPassword) 
            await setDoc(doc(db, "UsersDetails", `${auth.currentUser.uid}`), {
              id: auth.currentUser.uid,
              email: inputEmail,
              phone: inputPhone,
              userType: userType
            });
            setLoading(false);
            navigate('/')
          } catch(err){
            console.log(err)
            setErrorMsg(err.message)
          }
    }
        
    }
    return(
        <div className="login-page-div">
          {loading ? <Loader/> : 
            <form action="" className='login-form'>
                <h2>Register</h2>
                <input className='input' type="number" maxLength={10} placeholder='Phone' value={inputPhone} onChange={(e)=>{setInputPhone(e.target.value)}}/>
                <input className='input' type="email" placeholder='Email' value={inputEmail} onChange={(e)=>{setInputEmail(e.target.value)}}/>
                <input className='input' type="password" placeholder='Password' value={inputPassword} onChange={(e)=>{setInputPassword(e.target.value)}}/>
                <div className="mydict">
                  <div className='radio-div'>
                    <label>
                      <input type="radio" name="radio" onClick={()=>{setUserType('client')}}/>
                      <span>Client</span>
                    </label>
                    <label>
                      <input type="radio" name="radio" onClick={()=>{setUserType('restaurant')}}/>
                      <span>Restaurant</span>
                    </label>
                    <label>
                      <input type="radio" name="radio" onClick={()=>{setUserType('delivery')}}/>
                      <span>Delivery</span>
                    </label>
                    
                  </div>
              </div>
                <p className={`error ${errorMsg===''?'off':'on'}`}>{errorMsg}</p>
                <button className="login-button" onClick={handleRegister}>Register</button>
            </form>
            }
        </div>
    );
}

export default RegisterPage;