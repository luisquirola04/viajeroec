import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroPais(data) {
  let datos = null;
  try {
    datos = await POST("/pais/crear", data);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
export async function listarPaises(token) {
  let datos = null;
  try {
    datos = await GET("/pais/get", token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}