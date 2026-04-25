import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroProvincia(token, data) {
  let datos = null;
  try {
    datos = await POST("/provincia/crear", data, token);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}
export async function listarProvincia(token) {
  let datos = null;
  try {
    datos = await GET("/provincia/get", token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}

export async function getProvincia(token, externalProvincia) {
  let datos = null;
  try {
    datos = await GET("/provincia/getProvincia/"+externalProvincia, token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}

export async function editarProvincia(token, data) {
  let datos = null;
  try {
    datos = await POST("/provincia/editar", data,token);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}


export async function cambiarEstadoProvincia(token,externalProvincia) {
  let datos = null;
  try {
    datos = await GET("/provincia/cambiarEstadoProvincia/"+externalProvincia, token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}