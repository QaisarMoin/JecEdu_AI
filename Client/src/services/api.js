import axios from "axios";

const API = axios.create({
    baseURL: "https://jecedu-ai.onrender.com/api"
    // baseURL: "http://localhost:3000/api"
});

API.interceptors.request.use((req) => {

    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

export default API;