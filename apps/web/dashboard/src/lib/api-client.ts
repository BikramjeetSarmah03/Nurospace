import env from "@packages/env/client";
import axios from "axios";

export const API = axios.create({
  baseURL: `${env.VITE_SERVER_URL}/api/v1`,
  withCredentials: true,
});
