import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import authService from './authService';


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