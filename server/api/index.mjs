import Axios from 'axios'

export const mediaApi = Axios.create({
  baseURL: process.env.MEDIA_SERVICE_RESTFUL_API_URL
})