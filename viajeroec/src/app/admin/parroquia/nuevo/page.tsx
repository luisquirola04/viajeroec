"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";
import { useRouter } from 'next/navigation';

// Hooks
import { registroParroquia } from '@/hooks/ServiceParroquia';
import { listarCanton } from '@/hooks/ServiceCanton';

export default function CrearParroquiaForm() {
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const router = useRouter();

  // Lista para el Combo Box de Cantones
  const [listaCantones, setListaCantones] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    info: '',
    canton_external: '', // External del Cantón padre
    tipo_parroquia: ''   // 'URBANA' o 'RURAL'
  });

  // 1. CARGAR CANTONES
  useEffect(() => {
    const cargarCantones = async () => {
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
  }, [token]);

  // 2. ENVIAR FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!form.canton_external) return Swal.fire('Atención', 'Selecciona un Cantón', 'warning');
    if (!form.tipo_parroquia) return Swal.fire('Atención', 'Selecciona el tipo (Urbana/Rural)', 'warning');

    // YA NO ENVIAMOS 'imagen'
    const dataToSend = { 
        nombre: form.nombre,
        info: form.info,
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

        const res = await registroParroquia(token, dataToSend);

        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Registrado!',
                text: res.msj,
                confirmButtonColor: '#0d9488', 
            });
            // Reset
            setForm({ nombre: '', info: '', canton_external: '', tipo_parroquia: '' });
            router.push('/admin/parroquia/lista');

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
            {/* Contenedor más estrecho (max-w-2xl) ya que no hay imagen al lado */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
                
                <div className="mb-8 text-center">
                    <div className="inline-block p-3 rounded-full bg-teal-50 text-teal-600 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Nueva Parroquia</h2>
                    <p className="text-slate-500 mt-2">Registra una zona urbana o rural.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Parroquia</label>
                        <input type="text" required placeholder="Ej: Vilcabamba" className="input-field w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors" 
                            value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} 
                        />
                    </div>

                    {/* SELECT CANTON */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cantón Perteneciente</label>
                        <div className="relative">
                            <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none appearance-none cursor-pointer"
                                value={form.canton_external}
                                onChange={(e) => setForm({...form, canton_external: e.target.value})}
                            >
                                <option value="">-- Selecciona Cantón --</option>
                                {listaCantones.map((c) => (
                                    <option key={c.external} value={c.external}>{c.nombre}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                        </div>
                    </div>

                    {/* SELECT TIPO */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Zona</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition-all ${form.tipo_parroquia === 'URBANA' ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500 shadow-md' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                <input type="radio" name="tipo" value="URBANA" className="hidden" onChange={(e) => setForm({...form, tipo_parroquia: e.target.value})} />
                                <span className="text-xl">🏙️</span>
                                <span className="font-bold text-sm">Urbana</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition-all ${form.tipo_parroquia === 'RURAL' ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500 shadow-md' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                <input type="radio" name="tipo" value="RURAL" className="hidden" onChange={(e) => setForm({...form, tipo_parroquia: e.target.value})} />
                                <span className="text-xl">🌲</span>
                                <span className="font-bold text-sm">Rural</span>
                            </label>
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Detalles</label>
                        <textarea required rows={3} placeholder="Información relevante..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none resize-none" 
                            value={form.info} onChange={(e) => setForm({...form, info: e.target.value})} 
                        />
                    </div>
                    
                    <div className="pt-4">
                        <button type="submit" disabled={loading} 
                            className={`w-full px-10 py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 ${loading ? 'bg-slate-300' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'}`}
                        >
                            {loading ? 'Guardando...' : 'Guardar Parroquia'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>
  );
}