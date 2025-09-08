// frontend/src/api.js
import axios from 'axios';
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  timeout: 30000
});

export default API;

// add at bottom of file after axios instance
API.interceptors.response.use((resp)=> resp, async (err) => {
  // on network error, optionally queue
  if (!err.response && err.config && (err.config.method === 'post' || err.config.method === 'put')) {
    // queue
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push({ url: err.config.url, method: err.config.method, data: err.config.data });
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
    alert('Você está offline. A ação foi enfileirada e será sincronizada quando voltar online.');
    return Promise.resolve({ data: { queued: true }});
  }
  return Promise.reject(err);
});

// sync function
export async function syncOfflineQueue() {
  const q = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  for (const item of q) {
    try {
      await API({ method: item.method, url: item.url, data: JSON.parse(item.data) });
    } catch(e){}
  }
  localStorage.removeItem('offlineQueue');
}

// window event to trigger sync
window.addEventListener('online', () => {
  syncOfflineQueue();
});
