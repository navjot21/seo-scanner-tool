import axios from "axios";

const API = axios.create({
  baseURL: "https://seo-scanner-tool.onrender.com/api",
});

export default API;