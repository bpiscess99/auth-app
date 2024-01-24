import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import authService from './authService';
import errorHandler from '../../../../../backend/middlewares/errorMiddleware';


const initialState = {
    isLoggedIn: false,
    user: null,
    users: {},
    twoFactor: false,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
    verifiedUsers: 0,
    suspendedUsers: 0,
}

// Register User
export const register = createAsyncThunk(
    "auth/register",
    async(userData, thunkAPI) => {
        try {
            return await authService.register(userData);
        } catch (error) {
         const message = 
         (error.response &&
            error.response.data &&
            error.response.data.message) || 
            error.message ||
            error.toString();
            return thunkAPI.rejectWithValue(message)           
        }
    }
);

// Login User
export const login = createAsyncThunk(
    "auth/login",
    async(userData, thunkAPI) => {
        try {
            return await authService.login(userData);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Logout User
export const logout = createAsyncThunk(
    "auth/logout",
    async(_, thunkAPI) => {
        try {
            return await authService.logout();
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
            }   
            }
            );

// Get Login Status
export const getLoginStatus = createAsyncThunk(
    "auth/getLoginStatus",
    async(_, thunkAPI) => {
        try {
            return await authService.getLoginStatus();
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get User
export const getUser = createAsyncThunk(
    "auth/getUser",
    async(_, thunkAPI) => {
        try {
            return await authService.getUser();
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update User
export const updateUser = createAsyncThunk(
    "auth/updateUser",
    async(userData, thunkAPI) => {
        try {
            return await authService.updateUser(userData);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message || 
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Send Email Verification
export const sendVerificationEmail = createAsyncThunk(
    "auth/sendVerificationEmail",
    async(_, thunkAPI) => {
        try {
            return await authService.sendVerificationEmail();
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Verify User
export const verifyUser = createAsyncThunk(
    "auth/verifyUser",
    async(verificationToken, thunkAPI) => {
        try {
            return authService.verifyUser(verificationToken);            
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data && 
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Change Password
export const changePassword = createAsyncThunk(
    "auth/changePassword",
    async(userData, thunkAPI) => {
        try {
            return authService.changePassword(userData);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async (userData, thunkAPI) => {
        try {
            return authService.forgotPassword(userData);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({userData, resetToken}, thunkAPI) => {
        try {
            return authService.resetPassword(userData, resetToken   );
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get Users
export const getUsers = createAsyncThunk(
    "auth/getUsers",
    async(_, thunkAPI) => {
        try {
            return authService.getUsers();
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete User
export const deleteUser = createAsyncThunk(
    "auth/deleteUser",
    async(id, thunkAPI) => {
        try {
            return authService.deleteUser(id);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Upgrade User
export const upgradeUser = createAsyncThunk(
    "auth/upgradeUser",
    async(userData, thunkAPI) => {
        try {
            return authService.upgradeUser(userData);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Send Login Code 
export const sendLoginCode = createAsyncThunk(
    "auth/sendLoginCode",
    async(email, thunkAPI) => {
        try {
            return authService.sendLoginCode(email);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Login With Code 
export const loginWithCode = createAsyncThunk(
    "auth/loginWithCode",
    async({code, email}, thunkAPI) => {
        try {
            return authService.loginWithCode(code, email);
        } catch (error) {
            const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);

// Login With Google
export const loginWithGoogle = createAsyncThunk(
    "auth/loginWithCode",
    async(userToken, thunkAPI) => {
        try {
            return authService.loginWithCode(userToken);
        } catch (error) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();
                return thunkAPI.rejectWithValue(message);
        }
    }
);