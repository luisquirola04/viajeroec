"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { getPais, editarPais } from "@/hooks/ServicePais";
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditarPais() {
  const router = useRouter();
  const { external } = useParams(); 
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para ocultar el input de archivo
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    info: "",
    imagen: "",
    externalPais: external
  });

  useEffect(() => {
    if (external) cargarPais();
  }, [external]);

  const cargarPais = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        router.push("/admin/pais");
        return;
    }

    try {
      const respuesta = await getPais(token, external);
      const p = respuesta.pais || respuesta; 

      if (p) {
        setFormData({
            nombre: p.nombre || "",
            info: p.info || "",
            imagen: p.imagen || "",
            externalPais: external as string
        });
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar la información", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para procesar la imagen subida y convertirla a Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Guarda la imagen en base64 en el formData
            setFormData({ ...formData, imagen: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const respuesta = await editarPais(token, formData);
        if (respuesta && respuesta.code === 200) {
            await Swal.fire('¡Éxito!', 'País actualizado correctamente.', 'success');
            router.push("/admin/pais/lista");
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
        <div className="w-full max-w-3xl">
            <Link href="/admin/pais" className="text-teal-600 hover:text-teal-800 flex items-center gap-2 mb-6 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Destino</h1>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Cargando...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del País</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción Completa</label>
                            <textarea name="info" value={formData.info} onChange={handleChange} rows={6} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-sans leading-relaxed"></textarea>
                        </div>

                        {/* NUEVA LÓGICA DE IMAGEN */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen Actual</label>
                            
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-64 mb-4">
                                {formData.imagen ? (
                                    <img src={formData.imagen} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">Sin imagen</div>
                                )}
                            </div>

                            {/* Input tipo archivo oculto */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                            
                            {/* Botón visual para subir la imagen */}
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl border border-slate-300 transition-colors flex justify-center items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                Subir nueva imagen
                            </button>
                        </div>

                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 mt-4">
                            Actualizar Información del País
                        </button>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}