"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
// Asumo que tienes una función getCategoria en tu ServiceCategoria
import { getCategoria, editarCategoria } from "@/hooks/ServiceCategoria"; 
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditarCategoria() {
  const router = useRouter();
  const { external } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    externalCategoria: external // Nombre de clave asumiendo tu convención habitual
  });

  useEffect(() => {
    if (external) cargarCategoria();
  }, [external]);

  const cargarCategoria = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        router.push("/admin/categoria");
        return;
    }

    try {
      // Necesitarás tener este GET en tu ServiceCategoria
      const respuesta = await getCategoria(token, external);
      
      let c = null;
      if (respuesta && respuesta.categoria && Array.isArray(respuesta.categoria)) {
          c = respuesta.categoria[0]; 
      } else if (respuesta && respuesta.categoria) {
          c = respuesta.categoria; 
      } else if (respuesta && respuesta.msj) {
          c = respuesta.msj; 
      }

      if (c) {
        setFormData({
            nombre: c.nombre || "",
            externalCategoria: external as string
        });
      } else {
        Swal.fire("Error", "No se encontró la categoría", "error");
        router.push("/admin/categoria");
      }
    } catch (error) {
      console.error("Error al cargar:", error);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!formData.nombre.trim()) {
        Swal.fire("Atención", "El nombre de la categoría es obligatorio", "warning");
        return;
    }

    const payload = {
        nombre: formData.nombre,
        externalCategoria: external as string 
    };

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const respuesta = await editarCategoria(token, payload);
        Swal.close();

        if (respuesta && respuesta.code === 200) {
            await Swal.fire('¡Éxito!', 'Categoría actualizada correctamente.', 'success');
            router.push("/admin/categoria/lista");
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo actualizar', 'error');
        }
    } catch (error) {
        Swal.close();
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen flex justify-center">
        <div className="w-full max-w-xl">
            <Link href="/admin/categoria" className="text-teal-600 hover:text-teal-800 flex items-center gap-2 mb-6 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver a la lista
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Categoría</h1>

                {loading ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-slate-500">Cargando información...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Categoría</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                                placeholder="Ej: Playas, Museos, Montañas..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 mt-4"
                        >
                            Guardar Cambios
                        </button>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}