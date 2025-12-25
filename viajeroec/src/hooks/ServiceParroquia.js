import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroParroquia(token,data) {
  let datos = null;
  try {
    datos = await POST("/parroquia/crear", data, token);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
export async function listarParroquia(token) {
  let datos = null;
  try {
    datos = await GET("/parroquia/get", token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}