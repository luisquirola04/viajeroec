import axios from "axios";

const URL_BACKEND = "http://192.168.1.5:5000";
export const GET_USER = async (resource) => {
  return await axios.get(URL_BACKEND + resource);
};
