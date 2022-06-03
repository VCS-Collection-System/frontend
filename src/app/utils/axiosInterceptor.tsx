import axios from "axios";

const axiosInterceptor = axios.create({})

axiosInterceptor.interceptors.request.use(
    config => {
        config.headers['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
        return config;
    },
    error => {
        Promise.reject(error)
    });
export default axiosInterceptor;