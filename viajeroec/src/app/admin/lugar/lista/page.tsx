"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarLugar } from "@/hooks/ServiceLugar"; 
import Swal from "sweetalert2";
import dynamic from 'next/dynamic'; 

const MapaVisualizador = dynamic(() => import('@/components/MapaVisualizador'), { 
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">Cargando mapa...</div>
});

export default function ListaLugares() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await listarLugar(token);
            if (res && res.lugares) setLugares(res.lugares);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    cargar();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Lugares Turísticos</h1>
                <p className="text-slate-500 mt-1">Explora los puntos de interés registrados.</p>
            </div>
            <Link href="/admin/lugar/nuevo" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg flex gap-2 transition-all hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo Lugar
            </Link>
        </div>

        {/* MAPA */}
        {!loading && lugares.length > 0 && (
            <div className="mb-10 w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-md border border-slate-200 z-0">
                <MapaVisualizador lugares={lugares} />
            </div>
        )}

        {/* GRID DE TARJETAS */}
        {loading ? <div className="text-center py-10 text-slate-400">Cargando lugares...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {lugares.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No hay lugares registrados.</p>
                    </div>
                )}

                {lugares.map((lugar: any) => {
                    // Desglosamos la jerarquía para tener el código limpio
                    const parroquia = lugar.Parroquia;
                    const canton = parroquia?.Canton;
                    const provincia = canton?.Provincia;
                    const pais = provincia?.Pais;

                    return (
                        <div key={lugar.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
                            
                            {/* IMAGEN DEL LUGAR */}
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                <img 
                                    src={lugar.imagen} 
                                    alt={lugar.nombre} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596422846543-75c6a19caa00?q=80&w=1000'}
                                />
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50">
                                    {lugar.Categoria?.nombre}
                                </span>
                            </div>

                            {/* CONTENIDO */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1" title={lugar.nombre}>
                                    {lugar.nombre}
                                </h3>

                                {/* --- BLOQUE DE UBICACIÓN DETALLADO (GRID 2x2) --- */}
                                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-4">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                        
                                        {/* PAÍS */}
                                        <div className="flex flex-col border-r border-slate-200 pr-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                                 País
                                            </span>
                                            <span className="text-xs font-semibold text-slate-700 truncate" title={pais?.nombre}>
                                                {pais?.nombre || "N/A"}
                                            </span>
                                        </div>

                                        {/* PROVINCIA */}
                                        <div className="flex flex-col pl-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                                 Provincia
                                            </span>
                                            <span className="text-xs font-semibold text-slate-700 truncate" title={provincia?.nombre}>
                                                {provincia?.nombre || "N/A"}
                                            </span>
                                        </div>

                                        {/* SEPARADOR HORIZONTAL */}
                                        <div className="col-span-2 h-px bg-slate-200 my-0"></div>

                                        {/* CANTÓN */}
                                        <div className="flex flex-col border-r border-slate-200 pr-2">
                                            <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider flex items-center gap-1">
                                                 Cantón
                                            </span>
                                            <span className="text-xs font-bold text-teal-700 truncate" title={canton?.nombre}>
                                                {canton?.nombre || "N/A"}
                                            </span>
                                        </div>

                                        {/* PARROQUIA (CON TIPO) */}
                                        <div className="flex flex-col pl-2">
                                            <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider flex items-center gap-1">
                                                 Parroquia
                                            </span>
                                            <div className="flex items-center gap-1 truncate">
                                                <span className="text-xs font-bold text-teal-700" title={parroquia?.nombre}>
                                                    {parroquia?.nombre || "N/A"}
                                                </span>
                                                {/* Indicador Urbano/Rural */}
                                                {parroquia?.tipoParroquia && (
                                                    <span className={`text-[9px] px-1 rounded border ${parroquia.tipoParroquia === 'RURAL' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                                                        {parroquia.tipoParroquia === 'RURAL' ? 'Rural' : 'Urbana'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                {/* --------------------------------------- */}

                                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                                    {lugar.descripcion}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                         {lugar.horario || 'N/A'}
                                    </span>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=$?q=${lugar.latitud},${lugar.longitud}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 font-medium bg-teal-50 px-2 py-1 rounded-md border border-teal-100 transition-colors"
                                    >
                                        Ver Mapa 
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </main>
    </div>
  );
}