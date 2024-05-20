import './loginPage.css';
import React from 'react';
import { useEffect, useState } from 'react';
import { FaCheck } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import {auth} from '../../firebase-config';
import {signInWithEmailAndPassword} from 'firebase/auth';
import Loader from '../../components/Loader/Loader';
import {getDocs, collection, query, where, doc, setDoc} from 'firebase/firestore';
import {db} from '../../firebase-config'
import { Slide } from 'react-awesome-reveal';

function LoginPage() {
  const [inputEmail, setInputEmail] = useState('')
  const [inputPassword, setInputPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [result, setResult] = useState()
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem('LoggedIn'));

  const navigate = useNavigate();

  const usersDb = collection(db,'UsersDetails')

  useEffect(() => {
    if (isLoggedIn === "true") {
          navigate('/dashboard-client');
      }
  }, []);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(inputEmail && inputPassword){
      try{
        setLoading(true);
        await signInWithEmailAndPassword(auth, inputEmail, inputPassword);
        setResult()
        const q = query(usersDb, where("id", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                const filteredData = querySnapshot.docs.map((doc)=>({
                   ...doc.data(),
                   id: doc.id,
               }))
               
        let userType = filteredData[0].userType
        navigate(`/dashboard-${userType}`)
        localStorage.setItem('LoggedIn',true)
        localStorage.setItem('currentUserId',auth.currentUser.uid)
        localStorage.setItem('userType',userType)
        if(rememberMe===true){
          localStorage.setItem('RememberMe',true)
        }
        setLoading(false);
      } catch(err){
        setLoading(false);
        setResult('Invalid Credentials')
        console.error(err)
      }
    }
  }


  return (
    <Slide direction='down' duration={300}>
      <div className="login-page-div">
      {loading ? <Loader/> :
        <form className='login-form'>
            <h2>Sign In</h2>
            <input className='input' type="email" placeholder='Email' value={inputEmail} onChange={(e)=>{setInputEmail(e.target.value)}}/>
            <input className='input' type="password" placeholder='Password' value={inputPassword} onChange={(e)=>{setInputPassword(e.target.value)}}/>
            <div className='remember-me'>
              <div className={`${rememberMe?'hidden':'remember-me-checkbox-false'}`} onClick={()=>{setRememberMe(!rememberMe)}}></div>
              <div className={`${rememberMe?'remember-me-checkbox-true':'hidden'}`}  onClick={()=>{setRememberMe(!rememberMe)}}><FaCheck className='fa-check'/></div>
              <p>Remember me</p>
            </div>
            <button className="login-button" onClick={handleSubmit}>Login</button>
            <p className='error'>{result}</p>
            <p>Not a member? <a href='/register' className='register-button'>Register now!</a></p>
        </form>
        }
    </div>
    </Slide>
    
  );
}

export default LoginPage;
