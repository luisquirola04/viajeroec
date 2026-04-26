"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { getParroquia, editarParroquia } from "@/hooks/ServiceParroquia"; 
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditarParroquia() {
  const router = useRouter();
  const { external } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    info: "",
    tipoParroquia: "URBANA" // Asignamos un valor por defecto
  });

  useEffect(() => {
    if (external) cargarParroquia();
  }, [external]);

  const cargarParroquia = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        router.push("/admin/parroquia");
        return;
    }

    try {
      const respuesta = await getParroquia(token, external);
      
      // Manejamos las diferentes formas en que el backend podría responder
      let p = null;
      if (respuesta && respuesta.parroquia && Array.isArray(respuesta.parroquia)) {
          p = respuesta.parroquia[0]; 
      } else if (respuesta && respuesta.parroquia) {
          p = respuesta.parroquia; 
      } else if (respuesta && respuesta.msj) {
          p = respuesta.msj; // Cubrimos el escenario de msj
      }

      if (p) {
        setFormData({
            nombre: p.nombre || "",
            info: p.info || "",
            tipoParroquia: p.tipoParroquia || "URBANA"
        });
      } else {
        Swal.fire("Error", "No se encontró la información de la parroquia", "error");
        router.push("/admin/parroquia");
      }
    } catch (error) {
      console.error("Error al cargar:", error);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!formData.nombre || !formData.info) {
        Swal.fire("Atención", "Los campos Nombre e Información son obligatorios", "warning");
        return;
    }

    // Armamos el payload directamente asegurando el externalParroquia
    const payload = {
        nombre: formData.nombre,
        info: formData.info,
        tipoParroquia: formData.tipoParroquia,
        externalParroquia: external as string // Clave para tu backend
    };

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const respuesta = await editarParroquia(token, payload);
        if (respuesta && respuesta.code === 200) {
            await Swal.fire('¡Éxito!', 'Parroquia actualizada correctamente.', 'success');
            router.push("/admin/parroquia/lista");
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo actualizar', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Error de conexión', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen flex justify-center">
        <div className="w-full max-w-2xl">
            <Link href="/admin/parroquia" className="text-teal-600 hover:text-teal-800 flex items-center gap-2 mb-6 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver a la lista
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Parroquia</h1>

                {loading ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-slate-500">Cargando información...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Parroquia</label>
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    value={formData.nombre} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Parroquia</label>
                                <select 
                                    name="tipoParroquia" 
                                    value={formData.tipoParroquia} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all bg-white"
                                >
                                    <option value="URBANA">Urbana</option>
                                    <option value="RURAL">Rural</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción Completa</label>
                            <textarea 
                                name="info" 
                                value={formData.info} 
                                onChange={handleChange} 
                                rows={8} 
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-sans leading-relaxed transition-all resize-y"
                            ></textarea>
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