"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarParroquia } from "@/hooks/ServiceParroquia"; 
import Swal from "sweetalert2";

export default function ListaParroquias() {
  const [parroquias, setParroquias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return Swal.fire("Error", "No hay sesión", "error");

    setLoading(true);
    try {
      const respuesta = await listarParroquia(token);
      if (respuesta && respuesta.parroquias) {
        setParroquias(respuesta.parroquias);
      } else {
        setParroquias([]); 
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error al cargar datos", "error");
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
                <h1 className="text-3xl font-bold text-slate-800">Parroquias</h1>
                <p className="text-slate-500 mt-1">Gestión de zonas urbanas y rurales.</p>
            </div>
            <Link href="/admin/parroquia/nuevo" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nueva Parroquia
            </Link>
        </div>

        {/* Estado de carga */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-white h-48 rounded-2xl shadow-sm animate-pulse border border-slate-100"></div>)}
            </div>
        ) : (
            <>
                {parroquias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-400">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No hay parroquias registradas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                        {parroquias.map((p) => {
                            // DESGLOSAMOS LA JERARQUÍA COMPLETA
                            const canton = p.Canton;
                            const provincia = canton?.Provincia;
                            const pais = provincia?.Pais;

                            return (
                                <div key={p.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full">
                                    
                                    <div className="p-6 flex flex-col flex-1">
                                            
                                            {/* HEADER DE LA TARJETA: NOMBRE Y BADGES */}
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1" title={p.nombre}>{p.nombre}</h3>
                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${p.tipoParroquia === 'RURAL' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                                        {p.tipoParroquia === 'RURAL' ? '🌲 Rural' : '🏙️ Urbana'}
                                                    </span>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full mt-2 ${p.estado ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} title={p.estado ? 'Activo' : 'Inactivo'}></div>
                                            </div>

                                            {/* --- BLOQUE DE UBICACIÓN --- */}
                                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-4">
                                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                    
                                                    {/* País */}
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">País</span>
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{pais?.nombre || "N/A"}</span>
                                                    </div>

                                                    {/* Provincia */}
                                                    <div className="flex flex-col border-l border-slate-200 pl-4">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Provincia</span>
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{provincia?.nombre || "N/A"}</span>
                                                    </div>

                                                    <div className="col-span-2 h-px bg-slate-200 my-1"></div>

                                                    {/* Cantón */}
                                                    <div className="col-span-2 flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Cantón</span>
                                                        <span className="text-sm font-bold text-teal-700 truncate">{canton?.nombre || "N/A"}</span>
                                                    </div>

                                                </div>
                                            </div>

                                            <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">{p.info}</p>

                                            <div className="pt-4 border-t border-slate-100 mt-auto">
                                                <Link href={`/admin/parroquia/editar/${p.external}`} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    Editar Parroquia
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