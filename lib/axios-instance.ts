import axios from 'axios';

//const API_URL = "https://inventory-management-backend-brown.vercel.app"
const API_URL = "https://api.inovate.it.com"
//const API_URL = "http://localhost:2000"
const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;