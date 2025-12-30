"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarCanton } from "@/hooks/ServiceCanton"; 
import Swal from "sweetalert2";

export default function ListaCantones() {
  const [cantones, setCantones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        Swal.fire("Error", "No hay sesión activa", "error");
        return;
    }

    setLoading(true);
    try {
      const respuesta = await listarCanton(token);
      
      if (respuesta && respuesta.cantones && Array.isArray(respuesta.cantones)) {
        setCantones(respuesta.cantones);
      } else {
        setCantones([]); 
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Cantones Registrados</h1>
                <p className="text-slate-500 mt-1">Administra los cantones y su asignación provincial.</p>
            </div>
            
            <Link 
                href="/admin/canton/nuevo" 
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo Cantón
            </Link>
        </div>

        {/* Carga o Lista */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white h-48 rounded-2xl shadow-sm animate-pulse border border-slate-100"></div>
                ))}
            </div>
        ) : (
            <>
                {cantones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                             <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No hay cantones registrados</p>
                        <p className="text-slate-400 text-sm">Registra el primero.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                        {cantones.map((canton) => {
                            // Extraemos datos de jerarquía
                            const provincia = canton.Provincia;
                            const pais = provincia?.Pais;

                            return (
                                <div key={canton.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full">
                                    
                                    <div className="p-6 flex flex-col flex-1">
                                            
                                            {/* Header de la Tarjeta */}
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1 flex-1 pr-2" title={canton.nombre}>
                                                    {canton.nombre}
                                                </h3>
                                                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${canton.estado ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} title={canton.estado ? 'Activo' : 'Inactivo'}></div>
                                            </div>

                                            {/* --- BLOQUE DE JERARQUÍA (UBICACIÓN) --- */}
                                            <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col gap-2">
                                                {/* Fila País */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 w-16">País</span>
                                                    <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                                                        {pais?.nombre || "Sin País"}
                                                    </span>
                                                </div>
                                                
                                                <div className="h-px bg-slate-200 w-full"></div>

                                                {/* Fila Provincia */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 w-16">Provincia</span>
                                                    <span className="text-xs font-bold text-teal-600 truncate flex-1">
                                                        {provincia?.nombre  || "Sin Provincia"}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">
                                                {canton.info}
                                            </p>

                                            {/* Botones */}
                                            <div className="pt-4 border-t border-slate-100 mt-auto">
                                                <Link 
                                                    href={`/admin/canton/editar/${canton.external}`}
                                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    Editar Cantón
                                                </Link>
                                            </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
}