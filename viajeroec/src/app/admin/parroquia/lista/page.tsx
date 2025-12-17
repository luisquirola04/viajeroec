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

  const obtenerImagenValida = (url: string) => {
    if (!url || !url.startsWith("http")) return "https://images.unsplash.com/photo-1518182170546-0766ce6fec93?q=80&w=1000"; 
    return url;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
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

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <div key={i} className="bg-white h-80 rounded-2xl shadow-sm animate-pulse border border-slate-100"></div>)}
            </div>
        ) : (
            <>
                {parroquias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-3"><svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                        <p className="text-slate-500 text-lg font-medium">No hay parroquias</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                        {parroquias.map((p: any) => (
                            <div key={p.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                                
                                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                                    <img src={obtenerImagenValida(p.imagen)} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    
                                    {/* BADGE TIPO (URBANA/RURAL) */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-md border border-white/20 uppercase tracking-wide
                                            ${p.tipoParroquia === 'RURAL' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                            {p.tipoParroquia === 'RURAL' ? '🌲 Rural' : '🏙️ Urbana'}
                                        </span>
                                    </div>

                                    {/* BADGE ESTADO */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md border border-white/20 ${p.estado ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                            {p.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    {/* CANTÓN PADRE */}
                                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                        Cantón: {p.Canton?.nombre || "N/A"}
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1" title={p.nombre}>{p.nombre}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">{p.info}</p>

                                    <div className="pt-4 border-t border-slate-100 flex gap-3 mt-auto">
                                        <Link href={`/admin/parroquia/editar/${p.external}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-teal-50 hover:text-teal-600 transition-colors border border-transparent hover:border-teal-100">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            Editar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
}