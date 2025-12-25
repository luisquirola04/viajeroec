"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";
import dynamic from 'next/dynamic'; // Importante

// Hooks
import { registroLugar } from '@/hooks/ServiceLugar'; 
import { listarCategoria } from '@/hooks/ServiceCategoria'; 
import { listarParroquia } from '@/hooks/ServiceParroquia'; 

// --- IMPORTACIÓN DINÁMICA DEL MAPA ---
// Esto le dice a Next.js: "No cargues esto en el servidor, espera al navegador"
const MapaSelector = dynamic(() => import('@/components/MapaSelector'), { 
    ssr: false,
    loading: () => <p className="text-center p-10 bg-slate-100 text-slate-400">Cargando mapa...</p>
});

export default function CrearLugarForm() {
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaParroquias, setListaParroquias] = useState([]);
const token = sessionStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    horario: '',
    latitud: -3.99313, // Coordenada por defecto (Loja)
    longitud: -79.20422,
    categoria_external: '',
    parroquia_external: ''
  });

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // 1. CARGAR COMBOS
  useEffect(() => {
    const cargarCombos = async () => {
        try {
            const [resCat, resParr] = await Promise.all([
                listarCategoria(token),
                listarParroquia(token)
            ]);
            if (resCat && resCat.categorias) setListaCategorias(resCat.categorias);
            if (resParr && resParr.parroquias) setListaParroquias(resParr.parroquias);
        } catch (error) {
            console.error(error);
        }
    };
    cargarCombos();
  }, []);

  // 2. IMAGEN
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Fallo upload");
      const data = await res.json();
      setImagenUrl(data.secure_url); 
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }).fire({ icon: 'success', title: 'Imagen cargada' });
    } catch (error) {
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    } finally { setLoading(false); }
  };

  // 3. SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagenUrl) return Swal.fire('Falta imagen', 'Sube una foto del lugar', 'warning');
    if (!form.categoria_external || !form.parroquia_external) return Swal.fire('Datos incompletos', 'Selecciona categoría y parroquia', 'warning');

    const dataToSend = { 
        nombre: form.nombre,
        descripcion: form.descripcion,
        horario: form.horario,
        latitud: parseFloat(form.latitud.toString()), 
        longitud: parseFloat(form.longitud.toString()),
        imagen: imagenUrl,
        externalCategoria: form.categoria_external,
        externalParroquia: form.parroquia_external
    };

    try {
        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });
        const res = await registroLugar(token, dataToSend);

        if(res && res.code === 200) { 
            Swal.fire({ icon: 'success', title: '¡Lugar Creado!', text: res.msj, confirmButtonColor: '#0d9488' });
            // Reset
            setForm({ nombre: '', descripcion: '', horario: '', latitud: -3.99313, longitud: -79.20422, categoria_external: '', parroquia_external: '' });
            setImagenUrl('');
        } else {
            Swal.fire('Error', res.msj || 'Error desconocido', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Fallo de conexión', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                
                {/* IZQUIERDA: FOTO */}
                <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 self-start">1. Foto del Lugar</h3>
                    <div className="w-full relative group aspect-square mb-6">
                        {imagenUrl ? (
                            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md ring-2 ring-teal-500/20">
                                <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium">Cambiar</label>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed rounded-xl w-full h-full flex flex-col items-center justify-center cursor-pointer bg-white hover:border-teal-500 hover:bg-teal-50">
                                {loading ? <span className="animate-pulse text-slate-400">Subiendo...</span> : <span className="text-slate-500">Subir Foto</span>}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* DERECHA: DATOS + MAPA */}
                <div className="md:w-2/3 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Información y Ubicación</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        <div className="md:col-span-2">
                            <label className="label-text">Nombre del Lugar</label>
                            <input type="text" required className="input-field" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                        </div>

                        <div>
                            <label className="label-text">Categoría</label>
                            <select required className="input-field" value={form.categoria_external} onChange={(e) => setForm({...form, categoria_external: e.target.value})}>
                                <option value="">-- Seleccionar --</option>
                                {listaCategorias.map((c: any) => <option key={c.external} value={c.external}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Parroquia</label>
                            <select required className="input-field" value={form.parroquia_external} onChange={(e) => setForm({...form, parroquia_external: e.target.value})}>
                                <option value="">-- Seleccionar --</option>
                                {listaParroquias.map((p: any) => <option key={p.external} value={p.external}>{p.nombre}</option>)}
                            </select>
                        </div>

                        {/* MAPA DINÁMICO */}
                        <div className="md:col-span-2">
                             <label className="label-text flex justify-between">
                                <span>Ubicación en Mapa</span>
                                <span className="text-xs text-teal-600 font-normal">Haz clic para marcar</span>
                             </label>
                             <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                                {/* AQUÍ USAMOS EL COMPONENTE DINÁMICO */}
                                <MapaSelector 
                                    position={[form.latitud, form.longitud]} 
                                    setForm={setForm} 
                                />
                             </div>
                        </div>

                        <div>
                            <label className="label-text">Latitud</label>
                            <input type="number" step="any" required className="input-field font-mono text-xs" 
                                value={form.latitud} 
                                onChange={(e) => setForm({...form, latitud: parseFloat(e.target.value || '0')})} 
                            />
                        </div>
                        <div>
                            <label className="label-text">Longitud</label>
                            <input type="number" step="any" required className="input-field font-mono text-xs" 
                                value={form.longitud} 
                                onChange={(e) => setForm({...form, longitud: parseFloat(e.target.value || '0')})} 
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-text">Horario</label>
                            <input type="text" className="input-field" placeholder="Ej: Lunes a Viernes 8am - 5pm" value={form.horario} onChange={(e) => setForm({...form, horario: e.target.value})} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-text">Descripción</label>
                            <textarea required rows={3} className="input-field resize-none" value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} />
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-lg transition-all">
                                {loading ? '...' : 'Guardar Lugar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        

    </div>
  );
}