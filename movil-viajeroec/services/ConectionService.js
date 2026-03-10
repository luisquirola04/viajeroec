import axios from "axios";

const URL_BACKEND = "http://10.20.130.169:5000";
export const GET_USER = async (resource) => {
  return await axios.get(URL_BACKEND + resource);
};
