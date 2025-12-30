"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";
import { useRouter } from 'next/navigation';

// Hooks
import { registroCanton } from '@/hooks/ServiceCanton'; 
import { listarProvincia } from '@/hooks/ServiceProvincia'; 

export default function CrearCantonForm() {
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const router = useRouter();

  // Estado para guardar la lista de PROVINCIAS
  const [listaProvincias, setListaProvincias] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    info: '',
    provincia_external: '' 
  });

  // 1. CARGAR PROVINCIAS
  useEffect(() => {
    const cargarProvincias = async () => {
        try {
            const respuesta = await listarProvincia(token);
            if (respuesta && respuesta.provincias) {
                setListaProvincias(respuesta.provincias);
            }
        } catch (error) {
            console.error("Error cargando provincias:", error);
            Swal.fire("Error", "No se pudo cargar la lista de provincias", "error");
        }
    };
    cargarProvincias();
  }, [token]);

  // 2. ENVIAR AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!form.provincia_external) return Swal.fire('Atención', 'Selecciona una provincia', 'warning');

    // Mapeamos los datos (SIN IMAGEN)
    const dataToSend = { 
        nombre: form.nombre,
        info: form.info,
        externalProvincia: form.provincia_external
    };

    try {
        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando cantón en el sistema.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await registroCanton(token, dataToSend);

        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Cantón Creado!',
                text: res.msj || 'Registrado correctamente.',
                confirmButtonColor: '#0d9488', 
            });
            // Resetear form
            setForm({ nombre: '', info: '', provincia_external: '' });
            router.push('/admin/canton/lista');

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
            {/* Contenedor centrado y más estrecho */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
                
                <div className="mb-8 text-center">
                    <div className="inline-block p-3 rounded-full bg-teal-50 text-teal-600 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Nuevo Cantón</h2>
                    <p className="text-slate-500 mt-2">Registra un cantón dentro de una provincia.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cantón</label>
                        <input type="text" required placeholder="Ej: Catamayo" className="input-field w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors" 
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

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                        <textarea required rows={4} placeholder="Información turística o general..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none resize-none" 
                            value={form.info} onChange={(e) => setForm({...form, info: e.target.value})} 
                        />
                    </div>
                    
                    {/* Botón */}
                    <div className="pt-4">
                        <button type="submit" disabled={loading} 
                            className={`w-full px-12 py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 
                            ${loading ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'}`}
                        >
                            {loading ? 'Procesando...' : 'Guardar Cantón'}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    </div>
  );
}