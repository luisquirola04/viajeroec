"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";

// 1. IMPORTAMOS LOS HOOKS NECESARIOS
// Asegúrate de que registroCanton esté en este archivo o ajusta la ruta
import { registroCanton } from '@/hooks/ServiceCanton'; 
import { listarProvincia } from '@/hooks/ServiceProvincia'; 

export default function CrearCantonForm() {
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  
  // Estado para guardar la lista de PROVINCIAS para el combo box
  const [listaProvincias, setListaProvincias] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    info: '',
    provincia_external: '' // Aquí guardaremos el external de la provincia seleccionada
  });

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // --- 1. CARGAR PROVINCIAS AL INICIO ---
  useEffect(() => {
    const cargarProvincias = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const respuesta = await listarProvincia(token);
            // Validamos estructura: { provincias: [...] }
            // Ajustamos según tu respuesta anterior donde venía "provincias"
            if (respuesta && respuesta.provincias) {
                setListaProvincias(respuesta.provincias);
            }
        } catch (error) {
            console.error("Error cargando provincias:", error);
            Swal.fire("Error", "No se pudo cargar la lista de provincias", "error");
        }
    };
    cargarProvincias();
  }, []);

  // --- 2. SUBIR IMAGEN (Igual que siempre) ---
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
      
      Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      }).fire({ icon: 'success', title: 'Imagen cargada' });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ENVIAR AL BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!imagenUrl) return Swal.fire('Atención', 'Debes subir una imagen', 'warning');
    if (!form.provincia_external) return Swal.fire('Atención', 'Selecciona una provincia', 'warning');

    // Mapeamos los datos para el Backend
    const dataToSend = { 
        nombre: form.nombre,
        info: form.info,
        imagen: imagenUrl,
        externalProvincia: form.provincia_external // <--- AQUÍ enviamos el externalProvincia
    };

    try {
        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando cantón en el sistema.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Llamamos al hook de CANTON
        const res = await registroCanton(dataToSend);

        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Cantón Creado!',
                text: res.msj || 'Registrado correctamente.',
                confirmButtonColor: '#0d9488', 
            });
            // Resetear form
            setForm({ nombre: '', info: '', provincia_external: '' });
            setImagenUrl('');
        } else {
            Swal.fire('Error', res.msj || 'No se pudo guardar.', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo de conexión', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
        
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                
                {/* Lado Izquierdo: Imagen */}
                <div className="md:w-1/2 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 self-start">1. Imagen del Cantón</h3>

                    <div className="w-full relative group">
                        {imagenUrl ? (
                            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-md ring-2 ring-teal-500/20">
                                <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium backdrop-blur-sm">
                                    <span className="flex items-center gap-2">Cambiar Imagen</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        ) : (
                            <label className={`border-2 border-dashed rounded-xl w-full h-64 md:h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${loading ? 'bg-slate-100' : 'bg-white hover:border-teal-500 hover:bg-teal-50'}`}>
                                {loading ? (
                                    <span className="text-slate-500 text-sm font-medium animate-pulse">Subiendo...</span>
                                ) : (
                                    <>
                                        <div className="bg-teal-100 p-4 rounded-full mb-3 text-teal-600">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <span className="text-slate-600 font-medium">Sube una foto</span>
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
                        <h2 className="text-3xl font-bold text-slate-800">Nuevo Cantón</h2>
                        <p className="text-slate-500">Registra un cantón dentro de una provincia.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cantón</label>
                            <input type="text" required placeholder="Ej: Catamayo" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none" 
                                value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} 
                            />
                        </div>

                        {/* SELECT PROVINCIA */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Provincia Perteneciente</label>
                            <div className="relative">
                                <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none appearance-none cursor-pointer text-slate-700"
                                    value={form.provincia_external}
                                    onChange={(e) => setForm({...form, provincia_external: e.target.value})}
                                >
                                    <option value="">-- Selecciona Provincia --</option>
                                    {listaProvincias.map((prov: any) => (
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

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                            <textarea required rows={3} placeholder="Información turística..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none resize-none" 
                                value={form.info} onChange={(e) => setForm({...form, info: e.target.value})} 
                            />
                        </div>
                        
                        {/* Botón */}
                        <div className="flex justify-center pt-2">
                            <button type="submit" disabled={loading || !imagenUrl} 
                                className={`w-full md:w-auto px-12 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 
                                ${loading || !imagenUrl ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'}`}
                            >
                                {loading ? 'Procesando...' : 'Guardar Cantón'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    </div>
  );
}