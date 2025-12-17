import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function login(data) {
  let datos = null;
  try {
    datos = await POST("/auth/login", data);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
