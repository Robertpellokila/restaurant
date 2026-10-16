
import axios from 'axios'

const api = axios.create({
  baseURL: (
    import.meta.env?.VITE_FIREBASE_DATABASE_URL ||
    'https://vue-project-7c5c3-default-rtdb.asia-southeast1.firebasedatabase.app'
  ).replace(/\/+$/, ''),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getApiError(error) {
  if ([401, 403].includes(error.response?.status)) {
    return 'Akses data ditolak. Silakan hubungi pengelola aplikasi.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'Permintaan terlalu lama. Silakan coba lagi.'
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Tidak dapat terhubung. Periksa koneksi internet dan coba lagi.'
  }

  return error.response?.data?.error || error.message || 'Gagal memuat data.'
}

export default api
