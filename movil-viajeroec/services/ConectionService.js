import axios from "axios";

const URL_BACKEND = process.env.EXPO_PUBLIC_BACKEND ;
export const GET_USER = async (resource) => {
  return await axios.get(URL_BACKEND + resource);
};
