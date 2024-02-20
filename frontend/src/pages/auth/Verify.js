import React from 'react';
import { RESET, verifyUser,  } from '../../redux/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/loader/Loader';
import { useParams } from 'react-router-dom';

const Verify = () => {
  const dispatch = useDispatch();
  const {verificationToken} = useParams();
  console.log("verificationToken", verificationToken);

  const {isLoading} = useSelector((state) => state.auth);

  const verifyAccount = async () =>{
     await dispatch(verifyUser(verificationToken))
     await dispatch(RESET())
  }
  // console.log("verifyAccount", verifyAccount)
  return (
    <section>
     {isLoading && <Loader/>}
     <div className="--center-all">
        
        <h2>Account Verification</h2>
        <p>To verify your account, click the button below...</p>
        <br />
   
        <button className="--btn --btn-primary" onClick={verifyAccount}>
            Verify Account
        </button>

    </div>
    
      
    </section>
  )
}

export default Verify
