import axios from "axios";

export const spionapi = axios.create({
  baseURL: "https://randomuser.me/api",
  timeout: 5000,
});
