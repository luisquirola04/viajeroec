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
export async function validarToken(token) {
  let datos = null;
  try {
    datos = await GET("/auth/validar", token);
  } catch (error) {
    return error;
  }
    console.log("aqui esta el validar");

  console.log(datos.data);
  return datos.data;
}
