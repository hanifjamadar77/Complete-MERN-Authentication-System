import {create} from 'zustand';
import axios from 'axios';
// import { verify } from 'crypto';

const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true; // to send cookies with every request

export const useAuthStore = create((set) =>({
    user:null,
    isAuthenticated:false,
    isLoading:false,
    error:null,
    isCheackingAuth:true,
    message : null,

    signup : async(name, email, password) =>{
        set({isLoading:true, error:null});
        try{
            const response = await axios.post(`${API_URL}/signup`, {name, email, password});
            set({user:response.data.user, isAuthenticated:true, isLoading:false});
        }catch(error){
            const errorMessage = error.response?.data?.message || error.message;
            console.error("Signup error:", errorMessage);
            set({error: errorMessage, isLoading:false});
            throw error;
        }
    },

    login : async(email, password) =>{
        set({isLoading:true, error:null});
        try {
            const response = await axios.post(`${API_URL}/login`, {email, password});
            set({user:response.data.user, isAuthenticated:true, isLoading:false, error:null});
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error("Login error:", errorMessage);
            set({error: errorMessage, isLoading:false});
            throw error;
        }
    },

    logout: async() =>{
        set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
    },

    verifyEmail : async(code) =>{
        set({isLoading:true, error:null});
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {code});
            set({user:response.data.user, isAuthenticated:true, isLoading:false});
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error("Verify email error:", errorMessage);
            set({error: errorMessage, isLoading:false});
            throw error;
        }
    },

    checkAuth : async() =>{
        set({isCheackingAuth:true, error:null});
        try {
            const responce = await axios.get(`${API_URL}/check-auth`);
            set({user:responce.data.user, isAuthenticated:true, isCheackingAuth:false});
        } catch (error) {
            set({error: null, isCheackingAuth:false, isAuthenticated: false})
        }
    },

    forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
}));