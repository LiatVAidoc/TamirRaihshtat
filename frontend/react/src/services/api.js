import axios from 'axios';

class BaseApi {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get(url, config) {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post(url, data, config) {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put(url, data, config) {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async delete(url, config) {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  async patch(url, data, config) {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }
}

export default new BaseApi();
