import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroCanton(data) {
  let datos = null;
  try {
    datos = await POST("/canton/crear", data);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
export async function listarCanton(token) {
  let datos = null;
  try {
    datos = await GET("/canton/get", token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}