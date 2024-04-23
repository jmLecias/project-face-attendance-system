import axios from 'axios';
import StorageService from '../services/StorageService';

const ss = new StorageService();

// const serverIp = '172.23.249.243'; 
// const serverIp = '192.168.254.101';
const serverIp = '192.168.1.6';
// const serverIp = '192.168.1.13';
const flaskURL = `http://${((serverIp !== '') ? serverIp : 'localhost')}:5000`;
const faceApiBaseUrl = flaskURL;

const face_api = axios.create({
    baseURL: faceApiBaseUrl,
});


face_api.interceptors.request.use(
    config => {
        return config;
    },
    error => Promise.reject(error)
);

face_api.interceptors.response.use(
    response => response,
    async error => {
        return Promise.reject(error);
    }
);

export default face_api;
export { faceApiBaseUrl, serverIp };
