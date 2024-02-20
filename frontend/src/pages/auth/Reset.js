import React, { useEffect, useState } from 'react';
import Card from '../../components/card/Card';
import styles from './auth.module.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MdPassword } from 'react-icons/md';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import { RESET, resetPassword } from '../../redux/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/loader/Loader';


const initialState = {
    password: "",
    password2: "",
}

const Reset = () => {
    const [formData, setFormData] = useState(initialState);
    const {password, password2} = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {resetToken} = useParams();
    console.log("in reset password ", resetToken);

    const {isLoading, isSuccess, message} = useSelector((state) => state.auth);

const handleInputChange = (e) =>{
  const {name, value} = e.target;
  setFormData({...formData, [name]: value})
};

const reset = async (e) => {
  e.preventDefault();

  if(password.length < 6){
    toast.error("Password length must be 6 characters");
  }
  if(password !== password2){
    toast.error("Password do not match");
  }

  const userData = {
    password,
  }

  await dispatch(resetPassword({userData, resetToken}))
}

useEffect(() => {
  if(isSuccess && message.includes("Reset Successful")){
    navigate("/login")
  }

  dispatch(RESET())
}, [dispatch, navigate, message, isSuccess])


  return ( 
  <div className={`container ${styles.auth}`}>
      {isLoading && <Loader/>}
      <Card>
        <div className={styles.form}>
        
        <div className="--flex-center">
        <MdPassword size={35} color="#999"/>
        </div>

        <h2>Reset Password</h2>
        
        <form onSubmit={reset}>
        
      <PasswordInput 
      placeholder='Password' 
      name='password' 
      value={password} 
      onChange={handleInputChange}/>

      <PasswordInput 
      placeholder='Confirm Password' 
      name='password2' 
      value={password2} 
      onChange={handleInputChange}/>  
        

      <button type='submit' className="--btn --btn-primary --btn-block">
        Reset Password
        </button>  

      <div className={styles.links}>
        <p>
        <Link to='/'>- Home</Link>
        </p>
        <p>
        <Link to='/login'>- Login</Link>
        </p>
      </div>

        </form>

    
      
         
     </div>
      </Card>
    </div>
)  
}

export default Reset;
