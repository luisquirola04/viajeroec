"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { getCanton, editarCanton } from "@/hooks/ServiceCanton"; 
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditarCanton() {
  const router = useRouter();
  const { external } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    info: "",
    externalCanton: external 
  });

  useEffect(() => {
    if (external) cargarCanton();
  }, [external]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    console.log("1. token:", token);
    console.log("2. formData:", formData);
    console.log("3. external del param:", external);
    if (!formData.nombre || !formData.info) {
        Swal.fire("Atención", "Los campos Nombre e Información son obligatorios", "warning");
        return;
    }

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const respuesta = await editarCanton(token, formData);
        if (respuesta && respuesta.code === 200) {
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
            <Link href="/admin/canton" className="text-teal-600 hover:text-teal-800 flex items-center gap-2 mb-6 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Cantón</h1>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Cargando datos del cantón...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
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