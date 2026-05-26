"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { getCanton, editarCanton } from "@/hooks/ServiceCanton"; 
import { listarProvincia } from "@/hooks/ServiceProvincia"; // <-- 1. Importamos el servicio
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditarCanton() {
  const router = useRouter();
  const { external } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [listaProvincias, setListaProvincias] = useState([]); // <-- 2. Estado para provincias

  const [formData, setFormData] = useState({
    nombre: "",
    info: "",
    externalProvincia: "", // <-- Agregamos este campo al estado
    externalCanton: external 
  });

  useEffect(() => {
    if (external) {
        cargarProvincias(); // <-- Cargamos provincias al montar
        cargarCanton();
    }
  }, [external]);

  // Función para cargar provincias
  const cargarProvincias = async () => {
    const token = sessionStorage.getItem("token");
    try {
        const respuesta = await listarProvincia(token);
        if (respuesta && respuesta.provincias) {
            setListaProvincias(respuesta.provincias);
        }
    } catch (error) {
        console.error("Error cargando provincias:", error);
    }
  };

  const cargarCanton = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        router.push("/admin/canton");
        return;
    }

    try {
      const respuesta = await getCanton(token, external);
      
      let c = null;
      if (respuesta && respuesta.canton && Array.isArray(respuesta.canton)) {
          c = respuesta.canton[0]; 
      } else if (respuesta && respuesta.canton) {
          c = respuesta.canton; 
      }

      if (c) {
        setFormData({
            nombre: c.nombre || "",
            info: c.info || "",
            // Asegúrate de que c.provincia?.external o c.externalProvincia sea como tu API te devuelve la provincia
            externalProvincia: c.provincia?.external || c.externalProvincia || c.provincia || "", 
            externalCanton: external 
        });
      } else {
        Swal.fire("Error", "No se encontró la información del cantón", "error");
        router.push("/admin/canton");
      }
    } catch (error) {
      console.error("Error al cargar:", error);
      Swal.fire("Error", "No se pudo cargar la información del cantón", "error");
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
    
    if (!formData.nombre || !formData.info || !formData.externalProvincia) {
        Swal.fire("Atención", "Todos los campos son obligatorios", "warning");
        return;
    }

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const respuesta = await editarCanton(token, formData);
        if (respuesta && (respuesta.code === 200 || respuesta.status === 200)) {
            await Swal.fire('¡Éxito!', 'Cantón actualizado correctamente.', 'success');
            router.push("/admin/canton/lista");
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
            <Link href="/admin/canton/lista" className="text-teal-600 hover:text-teal-800 flex items-center gap-2 mb-6 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Cantón</h1>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Cargando datos del cantón...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Campo Nombre */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Cantón</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                            />
                        </div>

                        {/* SELECT PROVINCIA (Agregado) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Provincia Perteneciente</label>
                            <div className="relative">
                                <select 
                                    name="externalProvincia"
                                    required 
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none appearance-none cursor-pointer text-slate-700 transition-all"
                                    value={formData.externalProvincia}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Selecciona Provincia --</option>
                                    {listaProvincias.map((prov) => (
                                        <option key={prov.external} value={prov.external}>
                                            {prov.nombre}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Campo Descripción */}
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
                            Actualizar Cantón
                        </button>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}