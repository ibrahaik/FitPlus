// api.js
import axios from 'axios';

const API_BASE = 'https://2375-158-180-16-205.ngrok-free.app';

export default axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});
