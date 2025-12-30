"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarLugar, eliminarLugar } from "@/hooks/ServiceLugar"; 
import dynamic from "next/dynamic";
import Swal from 'sweetalert2'; 

const MapaVisualizador = dynamic(
  () => import("@/components/MapaVisualizador"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">
        Cargando mapa...
      </div>
    ),
  }
);

// --- SUB-COMPONENTE: TARJETA INDIVIDUAL ---
const LugarCard = ({ lugar, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const galeria = lugar.Multimedia && lugar.Multimedia.length > 0 ? lugar.Multimedia : [];
  const parroquia = lugar.Parroquia;
  const canton = parroquia?.Canton;
  const provincia = canton?.Provincia;
  const pais = provincia?.Pais;

  const nextSlide = (e) => {
    e.preventDefault(); 
    setCurrentIndex((prev) => (prev === galeria.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? galeria.length - 1 : prev - 1));
  };

  const isVideo = (url) => url.includes(".mp4") || url.includes(".webm") || url.includes("video");

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full animate-in fade-in zoom-in duration-300">
      
      {/* CARRUSEL */}
      <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
        {galeria.length > 0 ? (
          <>
            {isVideo(galeria[currentIndex].url) ? (
              <video src={galeria[currentIndex].url} className="w-full h-full object-cover" controls={false} autoPlay muted loop />
            ) : (
              <img src={galeria[currentIndex].url} alt={lugar.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
            {galeria.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50"><span className="text-xs">Sin imágenes</span></div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50 z-20">
          {lugar.Categoria?.nombre}
        </span>
      </div>

      {/* CONTENIDO */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1" title={lugar.nombre}>{lugar.nombre}</h3>
        
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="flex flex-col border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">País</span>
              <span className="text-xs font-semibold text-slate-700 truncate">{pais?.nombre || "N/A"}</span>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Provincia</span>
              <span className="text-xs font-semibold text-slate-700 truncate">{provincia?.nombre || "N/A"}</span>
            </div>
            <div className="col-span-2 h-px bg-slate-200 my-0"></div>
            <div className="flex flex-col border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Cantón</span>
              <span className="text-xs font-bold text-teal-700 truncate">{canton?.nombre || "N/A"}</span>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Parroquia</span>
              <span className="text-xs font-bold text-teal-700" title={parroquia?.nombre}>{parroquia?.nombre || "N/A"}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{lugar.descripcion}</p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{lugar.horario || "N/A"}</span>
          <div className="flex gap-2">
            <Link href={`/admin/lugar/editar/${lugar.external}`} className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-1.5 rounded-md border border-amber-200 font-medium transition-colors">Editar</Link>
            <button onClick={() => onDelete(lugar.external, lugar.nombre)} className="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1.5 rounded-md border border-red-200 font-medium transition-colors flex items-center gap-1">Eliminar</button>
            <a href={`http://maps.google.com/maps?q=${lugar.latitud},${lugar.longitud}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 font-medium bg-teal-50 px-2 py-1 rounded-md border border-teal-100 transition-colors">Mapa</a>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---
export default function ListaLugares() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. NUEVO ESTADO: Almacena el external del lugar seleccionado en el mapa
  const [selectedExternal, setSelectedExternal] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await listarLugar(token);
        if (res && res.lugares) setLugares(res.lugares);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // 2. FUNCIÓN DE FILTRADO: Si hay selección, mostramos solo ese, si no, todos
  const lugaresFiltrados = selectedExternal 
    ? lugares.filter(l => l.external === selectedExternal) 
    : lugares;

  const handleEliminar = async (external, nombre) => {
    const token = sessionStorage.getItem("token");
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el lugar "${nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'Eliminando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const respuesta = await eliminarLugar(token, external);
        if (respuesta && respuesta.code === 200) {
            Swal.fire('¡Eliminado!', respuesta.msg || 'Eliminado.', 'success');
            setLugares((prev) => prev.filter((l) => l.external !== external));
            
            // Si eliminamos el que estaba seleccionado, limpiamos la selección
            if (selectedExternal === external) setSelectedExternal(null);
        } else {
            Swal.fire('Error', respuesta.msg || 'Error al eliminar', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo de conexión', 'error');
      }
    }
  };

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

        {/* MAPA GENERAL */}
        {!loading && lugares.length > 0 && (
          <div className="mb-8 w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-md border border-slate-200 z-0 relative">
            <MapaVisualizador 
                lugares={lugares} 
                onSelect={(external) => setSelectedExternal(external)} // <--- PASAMOS LA FUNCIÓN
            />
            {/* Instrucción flotante */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 shadow-sm border border-slate-200 pointer-events-none z-[400]">
                Toca un marcador para filtrar
            </div>
          </div>
        )}

        {/* BARRA DE FILTRO ACTIVO (Aparece solo si hay selección) */}
        {selectedExternal && (
             <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Filtro de Mapa Activo</h4>
                        <p className="text-xs text-blue-700">Mostrando 1 lugar seleccionado en el mapa.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedExternal(null)} // <--- LIMPIAR FILTRO
                    className="bg-white hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-lg border border-blue-200 transition-colors shadow-sm"
                >
                    Ver Todos
                </button>
             </div>
        )}

        {/* GRID DE TARJETAS */}
        {loading ? (
          <div className="text-center py-10 text-slate-400">Cargando lugares...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {lugaresFiltrados.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">No hay lugares para mostrar.</p>
              </div>
            )}

            {lugaresFiltrados.map((lugar) => (
              <LugarCard key={lugar.external} lugar={lugar} onDelete={handleEliminar} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}