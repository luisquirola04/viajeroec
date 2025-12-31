const URL_BACKEND = "http://192.168.1.29:5000";

import axios from "axios";
export const GET_USER = async (resource) => {
    return await axios.get(URL_BACKEND + resource);
}
