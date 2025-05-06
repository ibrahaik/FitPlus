import axios from 'axios';

const API_BASE = 'https://b5ef-132-226-192-137.ngrok-free.app';

export default axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});
