import axios from "axios";


export const apiUrl = import.meta.env.VITE_APP_API_URL;

export const postApi = async (path, data) => {
    try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.post(`${apiUrl}${path}`, data, config);
        return response;
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }
};


export const postApiForm = async (path, data, config) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${apiUrl}${path}`, data, config);
        return response;
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }
};

export const getApi = async (path) => {

    try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const response = await axios.get(`${apiUrl}${path}`, config);
        return response;
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }
};

export const deleteApi = async (path) => {
    try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const response = await axios.delete(`${apiUrl}${path}`, config);
        return response;
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }
};