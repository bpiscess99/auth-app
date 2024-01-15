import React, { useState } from 'react';
import Card from '../../components/card/Card';
import styles from './auth.module.scss';
import { Link } from 'react-router-dom';
import { AiOutlineMail } from 'react-icons/ai';


const Forgot = () => {
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")

const handleInputChange = () =>{
  
}

const loginUser = () => {

}

  return ( 
  <div className={`container ${styles.auth}`}>
      
      <Card>
        <div className={styles.form}>
        
        <div className="--flex-center">
        <AiOutlineMail size={35} color="#999"/>
        </div>

        <h2>Forgot Password</h2>
        
        <form onSubmit={loginUser}>

      <input type="email" placeholder='Email' required name='email' value={email} onChange={handleInputChange} />
       
        

      <button type='submit' className="--btn --btn-primary --btn-block">Get Reset Email
        </button>  

      <div className={styles.links}>
        <Link to='/'>- Home</Link>
        <Link to='/login'>- Login</Link>
      </div>

        </form>

    
      
         
     </div>
      </Card>
    </div>
)  
}

export default Forgot;
