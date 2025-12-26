"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarLugar } from "@/hooks/ServiceLugar";
import dynamic from "next/dynamic";

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

// --- SUB-COMPONENTE: TARJETA INDIVIDUAL (Maneja su propio carrusel) ---
const LugarCard = ({ lugar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Obtenemos el array. Si está vacío o nulo, ponemos un array vacío
  const galeria = lugar.Multimedia && lugar.Multimedia.length > 0 ? lugar.Multimedia : [];
  
  // Datos de ubicación
  const parroquia = lugar.Parroquia;
  const canton = parroquia?.Canton;
  const provincia = canton?.Provincia;
  const pais = provincia?.Pais;

  // Función para cambiar imagen
  const nextSlide = (e) => {
    e.preventDefault(); // Evita que el Link principal se active
    setCurrentIndex((prev) => (prev === galeria.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? galeria.length - 1 : prev - 1));
  };

  // Helper para saber si es video (extensión básica o lógica de Cloudinary)
  const isVideo = (url) => {
    return url.includes(".mp4") || url.includes(".webm") || url.includes("video");
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
      
      {/* --- CARRUSEL DE IMÁGENES --- */}
      <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
        {galeria.length > 0 ? (
          <>
            {/* Renderizado de Multimedia */}
            {isVideo(galeria[currentIndex].url) ? (
              <video 
                src={galeria[currentIndex].url} 
                className="w-full h-full object-cover" 
                controls={false} // Ocultar controles nativos para limpieza
                autoPlay 
                muted 
                loop 
              />
            ) : (
              <img
                src={galeria[currentIndex].url}
                alt={`Imagen ${currentIndex + 1} de ${lugar.nombre}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            {/* Controles de Navegación (Solo si hay más de 1 imagen) */}
            {galeria.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                
                {/* Indicadores (Puntos) */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                    {galeria.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                    ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Fallback si no hay imágenes
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
             <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <span className="text-xs">Sin imágenes</span>
          </div>
        )}

        {/* Badge de Categoría */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50 z-20">
          {lugar.Categoria?.nombre}
        </span>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1" title={lugar.nombre}>
          {lugar.nombre}
        </h3>

        {/* Ubicación Grid */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {/* País */}
            <div className="flex flex-col border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">País</span>
              <span className="text-xs font-semibold text-slate-700 truncate">{pais?.nombre || "N/A"}</span>
            </div>
            {/* Provincia */}
            <div className="flex flex-col pl-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Provincia</span>
              <span className="text-xs font-semibold text-slate-700 truncate">{provincia?.nombre || "N/A"}</span>
            </div>
            {/* Separador */}
            <div className="col-span-2 h-px bg-slate-200 my-0"></div>
            {/* Cantón */}
            <div className="flex flex-col border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Cantón</span>
              <span className="text-xs font-bold text-teal-700 truncate">{canton?.nombre || "N/A"}</span>
            </div>
            {/* Parroquia */}
            <div className="flex flex-col pl-2">
              <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Parroquia</span>
              <div className="flex items-center gap-1 truncate">
                <span className="text-xs font-bold text-teal-700" title={parroquia?.nombre}>{parroquia?.nombre || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
          {lugar.descripcion}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            {lugar.horario || "N/A"}
          </span>
          <a
            href={`https://www.google.com/maps?q=$${lugar.latitud},${lugar.longitud}`}
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
};


// --- COMPONENTE PRINCIPAL ---
export default function ListaLugares() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await listarLugar(token);
        // Asegurarse de que el backend envíe 'lugares'
        if (res && res.lugares) setLugares(res.lugares);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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
            <h1 className="text-3xl font-bold text-slate-800">
              Lugares Turísticos
            </h1>
            <p className="text-slate-500 mt-1">
              Explora los puntos de interés registrados y sus galerías.
            </p>
          </div>
          <Link
            href="/admin/lugar/nuevo"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg flex gap-2 transition-all hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Lugar
          </Link>
        </div>

        {/* MAPA GENERAL */}
        {!loading && lugares.length > 0 && (
          <div className="mb-10 w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-md border border-slate-200 z-0">
            <MapaVisualizador lugares={lugares} />
          </div>
        )}

        {/* GRID DE TARJETAS (Usando el Sub-Componente) */}
        {loading ? (
          <div className="text-center py-10 text-slate-400">
            Cargando lugares...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {lugares.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">No hay lugares registrados.</p>
              </div>
            )}

            {lugares.map((lugar) => (
              <LugarCard key={lugar.external} lugar={lugar} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}