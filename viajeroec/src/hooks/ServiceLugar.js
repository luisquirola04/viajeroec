import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroLugar(token ,data) {
  let datos = null;
  try {
    datos = await POST("/lugar/crear", data, token);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
export async function listarLugar(token) {
  let datos = null;
  try {
    datos = await GET("/lugar/get", token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}