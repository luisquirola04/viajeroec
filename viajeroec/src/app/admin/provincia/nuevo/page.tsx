"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";

// Importamos los hooks
import { registroProvincia } from '@/hooks/ServiceProvincia'; 
import { listarPaises } from '@/hooks/ServicePais'; 

export default function CrearProvinciaForm() {
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  
  // Lista para el Combo Box
  const [listaPaises, setListaPaises] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    info: '',
    pais_external: '' // Estado interno del formulario
  });

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // 1. CARGAR PAISES AL INICIO
  useEffect(() => {
    const cargarPaises = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const respuesta = await listarPaises(token);
            // Validamos estructura: { paises: [...] }
            if (respuesta && respuesta.paises) {
                setListaPaises(respuesta.paises);
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar la lista de países", "error");
        }
    };
    cargarPaises();
  }, []);

  // 2. SUBIR IMAGEN A CLOUDINARY
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

  // 3. ENVIAR AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!imagenUrl) return Swal.fire('Atención', 'Debes subir una imagen', 'warning');
    if (!form.pais_external) return Swal.fire('Atención', 'Selecciona un país', 'warning');

    // --- AQUÍ ESTÁ LA CLAVE ---
    // Mapeamos los datos para que coincidan con lo que pide tu backend:
    // Backend espera: { nombre, info, imagen, externalPais }
    const dataToSend = { 
        nombre: form.nombre,
        info: form.info,
        imagen: imagenUrl,
        externalPais: form.pais_external // <--- ¡EXACTO! Aquí enviamos el valor con la key correcta
    };

    try {
        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando provincia en la base de datos.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await registroProvincia(dataToSend);

        // Verificamos el 'code: 200' que envía tu backend
        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Provincia Guardada!',
                text: res.msj, // "Provincia creada correctamente"
                confirmButtonColor: '#0d9488', 
            });
            // Resetear form
            setForm({ nombre: '', info: '', pais_external: '' });
            setImagenUrl('');
        } else {
            Swal.fire('Error', res.msj || 'Error desconocido', 'error');
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
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 self-start">1. Imagen Referencial</h3>

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
                        <h2 className="text-3xl font-bold text-slate-800">Nueva Provincia</h2>
                        <p className="text-slate-500">Completa los datos de la ubicación.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                            <input type="text" required placeholder="Ej: Loja" className="input-field w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none" 
                                value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} 
                            />
                        </div>

                        {/* SELECT PAIS */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">País</label>
                            <div className="relative">
                                <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none appearance-none cursor-pointer"
                                    value={form.pais_external}
                                    onChange={(e) => setForm({...form, pais_external: e.target.value})}
                                >
                                    <option value="">-- Selecciona --</option>
                                    {listaPaises.map((pais: any) => (
                                        <option key={pais.external} value={pais.external}>
                                            {pais.nombre}
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
                            <textarea required rows={3} placeholder="Detalles..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none resize-none" 
                                value={form.info} onChange={(e) => setForm({...form, info: e.target.value})} 
                            />
                        </div>
                        
                        {/* Botón */}
                        <div className="flex justify-center pt-2">
                            <button type="submit" disabled={loading || !imagenUrl} 
                                className={`w-full md:w-auto px-12 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 
                                ${loading || !imagenUrl ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'}`}
                            >
                                {loading ? 'Procesando...' : 'Guardar Provincia'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    </div>
  );
}