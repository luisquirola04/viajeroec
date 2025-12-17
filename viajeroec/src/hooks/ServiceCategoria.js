import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroCategoria(data) {
  let datos = null;
  try {
    datos = await POST("/categoria/crear", data);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
export async function listarCategoria(token) {
  let datos = null;
  try {
    datos = await GET("/categoria/get", token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}