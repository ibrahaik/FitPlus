import axios from 'axios';

const API_BASE = ' https://1e90-158-180-16-205.ngrok-free.app';

export default axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});
