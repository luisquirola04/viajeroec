
import { GET_USER } from "./ConectionService";
// LA CORRECCIÓN ESTÁ AQUÍ:
export async function listarPaises() {
    let datos = null;
    try {
        datos = await GET_USER("/pais/get");


        console.log("Respuesta del Backend:", datos.data);


        return datos.data;

    } catch (error) {
        console.error("Error en listarPaises:", error);

        return null;
    }
}

export async function listarProvinciasEc() {
    let datos = null;
    try {
        datos = await GET_USER("/provincia/getEc");


        console.log("Respuesta del Backend:", datos.data);


        return datos.data;

    } catch (error) {
        console.error("Error en listarPaises:", error);

        return null;
    }
}

export async function listarCantonesProvincia(external) {
    let datos = null;
    try {
        datos = await GET_USER("/canton/get/"+ external);


        console.log("Respuesta del Backend:", datos.data);


        return datos.data;

    } catch (error) {
        console.error("Error en listarPaises:", error);

        return null;
    }
}


export async function listarParroquiasCanton(external) {
    let datos = null;
    try {
        datos = await GET_USER("/parroquia/get/"+ external);


        console.log("Respuesta del Backend:", datos.data);


        return datos.data;

    } catch (error) {
        console.error("Error en listarPaises:", error);

        return null;
    }
}
export async function listarCategorias() {
    let datos = null;
    try {
        datos = await GET_USER("/categoria/get");


        console.log("Respuesta del Backend:", datos.data);


        return datos.data;

    } catch (error) {
        console.error("Error en listarPaises:", error);

        return null;
    }
}

