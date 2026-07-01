import axios from 'axios'

const aiApi = axios.create({
  baseURL: 'http://localhost:8001/ai',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default aiApi
