import React, { useEffect, useState } from 'react';
import Card from '../../components/card/Card';
import styles from './auth.module.scss';
import { TiUserAddOutline } from 'react-icons/ti';
import { Link } from 'react-router-dom';
import PasswordInput from '../../components/passwordInput/PasswordInput.js';
import { FaTimes } from 'react-icons/fa';
import { BsCheck2All } from 'react-icons/bs';


const initialState = {
    name: "",
    email: "",
    password: "",
    password2: "",
}

const Register = () => {
    const [formData, setFormData] = useState(initialState);
    const {name, email, password, password2} = formData;

    const [uCase, setUCase] = useState(false)
    const [num, setNum] = useState(false)
    const [sChar, setSChar] = useState(false)
    const [passLength, setPassLength] = useState(false)

    const timesIcon = <FaTimes color='red' size={15}/>;
    const checkIcon = <BsCheck2All color='green' size={15}/>;
    
    const switchIcon = (condition) =>{
      if (condition){
        return checkIcon 
      }
       return timesIcon
    }

    const handleInputChange = (e) =>{
      const {name, value} = e.target;
      setFormData({...formData, [name]: value})
    }

  //   useEffect(() => {
      
  //   // Check Lower & Upper Case
  //   if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) ){
  //     setUCase(true)
  //   }else{
  //     setUCase(false)
  //   }

  //   // Check for Number
  //   if (password.match(/([0-9])/)){
  //     setNum(true)
  //   }else{
  //     setNum(false)
  //   }

  //  // Check for Special Character
  //  if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)){
  //     setSChar(true)
  //  }else{
  //     setSChar(false)
  //  }

  // // Check for password length
  // if (password.length > 5){
  //    setPassLength(true)
  // }else{
  //    setPassLength(false)
  // }

  //   }, [password])
    
    const loginUser = () => {
    
    }

  return (

    <div className={`container ${styles.auth}`}>
      
      <Card>
        <div className={styles.form}>
        
        <div className="--flex-center">
        <TiUserAddOutline size={35} color="#999"/>
        </div>

        <h2>Register</h2>        

        <form onSubmit={loginUser}>

        <input type="text" placeholder='Name' required name='name' value={name} onChange={handleInputChange}/>

      <input type="email" placeholder='Email' required name='email' value={email} onChange={handleInputChange} />
       
       <PasswordInput placeholder='Password' name='password' value={password} onChange={handleInputChange}/>

       <PasswordInput placeholder='Confirm Password' name='password2' value={password2} onChange={handleInputChange}/>
       

      {/* <input type="password" placeholder='Password' required name='password' value={password} onChange={handleInputChange} /> */} 

      {/* password strength portion */}

       <Card cardClass={styles.group}> 
       <ul className='form-list'>
        
        <li>
            <span className='styles.indicator'>
                {switchIcon(uCase)}&nbsp; Lowercase & Uppercase
            </span>
        </li>

        <li>
            <span className='styles.indicator'>
                {switchIcon(num)}&nbsp; Number(0-9)
            </span>
        </li>

        <li>
            <span className='styles.indicator'>
                {switchIcon(sChar)}&nbsp; Special Length(!@#$*)
            </span>
        </li>

        <li>
            <span className='styles.indicator'>
                {switchIcon(passLength)}&nbsp; At least 6 Character 
            </span>
        </li>
        
       </ul>
        </Card>   

      <button type='submit' className="--btn --btn-primary --btn-block">Register
        </button>  
        
        </form>

      <span className={styles.register}>
        <Link to='/'>Home</Link>
        <p>&nbsp;Already have an account?&nbsp;</p>
        <Link to='/login'>Login</Link>
      </span>
         
     </div>
      </Card>
    </div>
    

  )
}

export default Register
