import React from 'react';
import { useNavigate } from 'react-router-dom';
import './goBack.css';
import { FaArrowLeft } from "react-icons/fa6";

export default function GoBack({ colour }) {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate('/login');
  };

  return (
    <div className='go-back-div'>
        <button
        to='/'
        className={`go-back ${colour === 'white' ? 'white' : ''}`}
        onClick={navigateBack}
      >
     <FaArrowLeft className='arrow' />
    </button>
    </div>
    
  );
}