"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";

// Hooks
import { registroParroquia } from '@/hooks/ServiceParroquia'; // Tu nuevo hook
import { listarCanton } from '@/hooks/ServiceCanton'; // Para llenar el combo

export default function CrearParroquiaForm() {
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  
  // Lista para el Combo Box de Cantones
  const [listaCantones, setListaCantones] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    info: '',
    canton_external: '', // External del Cantón padre
    tipo_parroquia: ''   // 'URBANA' o 'RURAL'
  });

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // 1. CARGAR CANTONES
  useEffect(() => {
    const cargarCantones = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const respuesta = await listarCanton(token);
            if (respuesta && respuesta.cantones) {
                setListaCantones(respuesta.cantones);
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar la lista de cantones", "error");
        }
    };
    cargarCantones();
  }, []);

  // 2. SUBIDA DE IMAGEN
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
      
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
          .fire({ icon: 'success', title: 'Imagen cargada' });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. ENVIAR FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!imagenUrl) return Swal.fire('Atención', 'Sube una imagen', 'warning');
    if (!form.canton_external) return Swal.fire('Atención', 'Selecciona un Cantón', 'warning');
    if (!form.tipo_parroquia) return Swal.fire('Atención', 'Selecciona el tipo (Urbana/Rural)', 'warning');

    const dataToSend = { 
        nombre: form.nombre,
        info: form.info,
        imagen: imagenUrl,
        externalCanton: form.canton_external,
        tipoParroquia: form.tipo_parroquia
    };

    try {
        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando parroquia...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await registroParroquia(dataToSend);

        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Registrado!',
                text: res.msj,
                confirmButtonColor: '#0d9488', 
            });
            // Reset
            setForm({ nombre: '', info: '', canton_external: '', tipo_parroquia: '' });
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
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 self-start">1. Imagen Parroquial</h3>
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
                                {loading ? <span className="text-slate-500 animate-pulse">Subiendo...</span> : <><div className="bg-teal-100 p-4 rounded-full mb-3 text-teal-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div><span className="text-slate-600 font-medium">Sube una foto</span></>}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Lado Derecho: Formulario */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800">Nueva Parroquia</h2>
                        <p className="text-slate-500">Registra una parroquia urbana o rural.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                            <input type="text" required placeholder="Ej: Vilcabamba" className="input-field w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none" 
                                value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} 
                            />
                        </div>

                        {/* SELECT CANTON */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cantón</label>
                            <div className="relative">
                                <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none appearance-none cursor-pointer"
                                    value={form.canton_external}
                                    onChange={(e) => setForm({...form, canton_external: e.target.value})}
                                >
                                    <option value="">-- Selecciona Cantón --</option>
                                    {listaCantones.map((c: any) => (
                                        <option key={c.external} value={c.external}>{c.nombre}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                            </div>
                        </div>

                        {/* SELECT TIPO */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Parroquia</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${form.tipo_parroquia === 'URBANA' ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <input type="radio" name="tipo" value="URBANA" className="hidden" onChange={(e) => setForm({...form, tipo_parroquia: e.target.value})} />
                                    <span className="font-bold text-sm">🏙️ Urbana</span>
                                </label>
                                <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${form.tipo_parroquia === 'RURAL' ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <input type="radio" name="tipo" value="RURAL" className="hidden" onChange={(e) => setForm({...form, tipo_parroquia: e.target.value})} />
                                    <span className="font-bold text-sm">🌲 Rural</span>
                                </label>
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                            <textarea required rows={2} placeholder="Detalles..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none resize-none" 
                                value={form.info} onChange={(e) => setForm({...form, info: e.target.value})} 
                            />
                        </div>
                        
                        <div className="flex justify-center pt-2">
                            <button type="submit" disabled={loading || !imagenUrl} 
                                className={`w-full md:w-auto px-10 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 ${loading || !imagenUrl ? 'bg-slate-300' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'}`}
                            >
                                {loading ? '...' : 'Guardar Parroquia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
  );
}