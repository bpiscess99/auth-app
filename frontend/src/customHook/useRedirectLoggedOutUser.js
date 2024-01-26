import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../redux/features/auth/authService';

const useRedirectLoggedOutUser = (path) => {
    const navigate = useNavigate();

    useEffect(() => {
        let isLoggedIn;
        const redirectLoggedOutUser = async () => {
            try {
               isLoggedIn = await authService.loginStatus(); 
            } catch (error) {
                console.log(error.message);
            }

            if(!isLoggedIn){
                toast.info("Session expired, please login to continue");
                navigate(path)
            }
        }
        redirectLoggedOutUser();
    }, [path, navigate]);

};

export default useRedirectLoggedOutUser
