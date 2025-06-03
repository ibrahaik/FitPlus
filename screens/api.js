import axios from 'axios';

const API_BASE = 'https://abe8-138-2-143-84.ngrok-free.app';

export default axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});
