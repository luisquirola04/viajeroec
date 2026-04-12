"use client";

import { useState } from 'react';
import { registroPais } from '@/hooks/ServicePais'; 
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";
import { useRouter } from 'next/navigation';

export default function CrearPaisForm() {
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
    const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    info: ''
  });
const token = sessionStorage.getItem("token");
console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // --- Subida de Imagen ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error("Fallo al subir");
      const data = await res.json();
      setImagenUrl(data.secure_url); 
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      Toast.fire({ icon: 'success', title: 'Imagen cargada correctamente' });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de imagen',
        text: 'No se pudo subir la imagen a la nube.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagenUrl) {
        return Swal.fire({
            icon: 'warning',
            title: 'Falta la imagen',
            text: 'Por favor espera a que se cargue la imagen antes de guardar.',
        });
    }

    const dataToSend = { ...form, imagen: imagenUrl };

    try {
        Swal.fire({
            title: 'Guardando...',
            text: 'Estamos registrando el nuevo destino.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await registroPais(token, dataToSend);

        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Destino Creado!',
                text: 'El país se ha registrado correctamente en el sistema.',
                confirmButtonColor: '#0d9488', 
            });
            router.push('/admin/pais/lista')
            setForm({ nombre: '', info: '' });
            setImagenUrl('');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.msj || 'El servidor no pudo guardar los datos.',
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No pudimos conectar con el servidor. Intenta más tarde.',
        });
    }
  };

  return (
    // CAMBIO 1: Contenedor principal es Flex Row para poner Sidebar a la izq y contenido a la derecha
    <div className="flex min-h-screen bg-slate-50">
        
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />

        {/* CAMBIO 2: Main ocupa el resto del espacio (flex-1) y centra SU contenido */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                
                {/* Lado Izquierdo: Visual / Upload */}
                <div className="md:w-1/2 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 self-start">1. Imagen del Pais</h3>

                    <div className="w-full relative group">
                        {imagenUrl ? (
                            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-md ring-2 ring-teal-500/20">
                                <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium backdrop-blur-sm">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        Cambiar Imagen
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        ) : (
                            <label className={`border-2 border-dashed rounded-xl w-full h-64 md:h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${loading ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-300 hover:border-teal-500 hover:bg-teal-50 hover:shadow-inner'}`}>
                                {loading ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <svg className="animate-spin h-10 w-10 text-teal-500 mb-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span className="text-slate-500 text-sm font-medium">Subiendo...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-teal-100 p-4 rounded-full mb-3 text-teal-600">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <span className="text-slate-600 font-medium">Sube una foto</span>
                                        <span className="text-slate-400 text-xs mt-1">JPG, PNG, WebP</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
                            </label>
                        )}
                    </div>
                  
                </div>

                {/* Lado Derecho: Formulario */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800">Nuevo Pais</h2>
                        <p className="text-slate-500">Agrega un nuevo punto turístico al sistema.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del País</label>
                            <input type="text" required placeholder="Ej: Ecuador" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 transition-all outline-none" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción Turística</label>
                            <textarea required rows={4} placeholder="Describe las maravillas de este lugar..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 transition-all outline-none resize-none" value={form.info} onChange={(e) => setForm({...form, info: e.target.value})} />
                        </div>
                        
                        {/* CAMBIO 3: Botón centrado */}
                        <div className="flex justify-center pt-2">
                            <button 
                                type="submit" 
                                disabled={loading || !imagenUrl} 
                                // Quitamos w-full, ponemos px-10 para que sea ancho pero no total, y md:w-auto
                                className={`w-full md:w-auto px-12 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 
                                ${loading || !imagenUrl 
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                                    : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'
                                }`}
                            >
                                {loading ? 'Procesando...' : 'Crear País'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    </div>
  );
}