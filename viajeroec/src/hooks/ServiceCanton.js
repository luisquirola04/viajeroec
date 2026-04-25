import { PATCH, POST } from "./Connection";
import { GET } from "./Connection";

export async function registroCanton(token, data) {
  let datos = null;
  try {
    datos = await POST("/canton/crear", data,token);
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
export async function getCanton(token, externalCanton) {
  let datos = null;
  try {
    datos = await GET("/canton/getCanton/"+externalCanton, token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}

export async function editarCanton(token, data) {
  let datos = null;
  try {
    datos = await POST("/canton/editar", data,token);
  } catch (error) {
    console.log(error);
    return error;
  }

  return datos;
}

export async function cambiarEstadoCanton(token,externalCanton) {
  let datos = null;
  try {
    datos = await GET("/canton/cambiarEstadoCanton/"+externalCanton, token);
  } catch (error) {
    return error;
  }
  console.log(datos.data);
  return datos.data;
}