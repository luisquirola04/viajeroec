"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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

// --- SUB-COMPONENTE: TARJETA INDIVIDUAL (MEMOIZADO) ---
const LugarCard = React.memo(({ lugar, onDelete, onLocate }) => {
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

  // Validación segura para evitar crasheos si la URL es indefinida
  const isVideo = (url) => {
    if (!url || typeof url !== 'string') return false;
    const u = url.toLowerCase();
    return u.includes(".mp4") || u.includes(".webm") || u.includes("video");
  };

  // Función para obtener miniatura de YouTube si es un link
  const obtenerMiniatura = (url) => {
    if (!url || typeof url !== 'string') return "";
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        return id ? `https://img.youtube.com/vi/${id}/0.jpg` : url;
    }
    return url;
  };

  const isActivo = lugar.estado !== false && lugar.estado !== 0 && lugar.estado !== "inactivo";

  // --- RENDERIZADO SEGURO DE MULTIMEDIA ---
  const renderMedia = () => {
    if (galeria.length === 0) {
      return <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50"><span className="text-xs">Sin imágenes</span></div>;
    }

    // EXTRAE LA URL DE FORMA SEGURA (Soporta strings puros u objetos)
    const item = galeria[currentIndex];
    const urlOriginal = typeof item === 'string' ? item : (item?.url || item?.enlace || "");
    
    if (!urlOriginal) {
        return <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50"><span className="text-xs">Archivo no disponible</span></div>;
    }

    const isYoutube = urlOriginal.includes('youtube.com') || urlOriginal.includes('youtu.be');
    const isVid = isVideo(urlOriginal);

    // Si es YouTube, mostramos la miniatura con un badge
    if (isYoutube) {
        return (
            <div className="relative w-full h-full">
                <img 
                    src={obtenerMiniatura(urlOriginal)} 
                    alt={lugar.nombre} 
                    loading="lazy"   
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
                    <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">YOUTUBE</span>
                </div>
            </div>
        );
    }
    
    let urlOptimizada = urlOriginal;
    
    if (urlOptimizada.includes('cloudinary')) {
        if (isVid) {
            urlOptimizada = urlOptimizada.replace('/upload/', '/upload/q_auto,f_auto/');
        } else {
            urlOptimizada = urlOptimizada.replace('/upload/', '/upload/c_scale,w_400,q_auto,f_auto/');
        }
    }

    if (isVid) {
      return (
        <video 
          src={urlOptimizada} 
          className="w-full h-full object-cover" 
          controls={true}  
          preload="none"   
        />
      );
    }

    return (
      <img 
        src={urlOptimizada} 
        alt={lugar.nombre} 
        loading="lazy"   
        decoding="async" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
    );
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full animate-in fade-in zoom-in duration-300 relative">
      
      {/* INDICADOR DE ESTADO */}
      <div className="absolute top-3 right-3 z-20">
        <span className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md border ${
          isActivo 
            ? "bg-green-100/90 text-green-700 border-green-200" 
            : "bg-red-100/90 text-red-700 border-red-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? "bg-green-500" : "bg-red-500"} animate-pulse`}></span>
          {isActivo ? "Activo" : "Inactivo"}
        </span>
      </div>

      {/* CARRUSEL OPTIMIZADO */}
      <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
        {renderMedia()}

        {galeria.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-sm border border-white/20">
            {currentIndex + 1} / {galeria.length}
          </div>
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
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50 z-20">
          {lugar.Categoria?.nombre || "Categoría"}
        </span>
      </div>

      {/* CONTENIDO */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1" title={lugar.nombre}>{lugar.nombre}</h3>
        
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="flex flex-col border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">País</span>
              <span className="text-xs font-semibold text-slate-700 truncate" title={pais?.nombre}>{pais?.nombre || "N/A"}</span>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Provincia</span>
              <span className="text-xs font-semibold text-slate-700 truncate" title={provincia?.nombre}>{provincia?.nombre || "N/A"}</span>
            </div>
            <div className="col-span-2 h-px bg-slate-200 my-0"></div>
            <div className="flex flex-col border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Cantón</span>
              <span className="text-xs font-bold text-teal-700 truncate" title={canton?.nombre}>{canton?.nombre || "N/A"}</span>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[10px] uppercase font-bold text-teal-600/70 tracking-wider">Parroquia</span>
              <span className="text-xs font-bold text-teal-700 truncate" title={parroquia?.nombre}>{parroquia?.nombre || "N/A"}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{lugar.descripcion}</p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{lugar.horario || "N/A"}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => onLocate(lugar.external)} 
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1.5 rounded-md border border-indigo-200 font-medium transition-colors flex items-center gap-1"
              title="Aislar y ver en el mapa superior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Ubicar
            </button>
            <Link href={`/admin/lugar/editar/${lugar.external}`} className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-1.5 rounded-md border border-amber-200 font-medium transition-colors">Editar</Link>
            <button onClick={() => onDelete(lugar.external, lugar.nombre)} className="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1.5 rounded-md border border-red-200 font-medium transition-colors flex items-center gap-1">Eliminar</button>
            <a href={`https://www.google.com/maps/search/?api=1&query=${lugar.latitud},${lugar.longitud}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 font-medium bg-teal-50 px-2 py-1 rounded-md border border-teal-100 transition-colors">Google Maps</a>
          </div>
        </div>
      </div>
    </div>
  );
});
LugarCard.displayName = "LugarCard";


// --- COMPONENTE PRINCIPAL ---
export default function ListaLugares() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  
  const [isMapVisible, setIsMapVisible] = useState(true);

  const [selectedExternal, setSelectedExternal] = useState(null);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos"); 
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [paisFiltro, setPaisFiltro] = useState("");
  const [provinciaFiltro, setProvinciaFiltro] = useState("");
  const [cantonFiltro, setCantonFiltro] = useState("");
  const [parroquiaFiltro, setParroquiaFiltro] = useState("");

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

  // --- OPCIONES DINÁMICAS ---
  const opcionesCategorias = useMemo(() => {
    const valores = lugares.map(l => l.Categoria?.nombre);
    return [...new Set(valores.filter(v => typeof v === 'string' && v.trim() !== ''))].sort();
  }, [lugares]);

  const opcionesPaises = useMemo(() => {
    const valores = lugares.map(l => l.Parroquia?.Canton?.Provincia?.Pais?.nombre);
    return [...new Set(valores.filter(v => typeof v === 'string' && v.trim() !== ''))];
  }, [lugares]);

  const opcionesProvincias = useMemo(() => {
    const valores = lugares
      .filter(l => !paisFiltro || l.Parroquia?.Canton?.Provincia?.Pais?.nombre === paisFiltro)
      .map(l => l.Parroquia?.Canton?.Provincia?.nombre);
    return [...new Set(valores.filter(v => typeof v === 'string' && v.trim() !== ''))];
  }, [lugares, paisFiltro]);

  const opcionesCantones = useMemo(() => {
    const valores = lugares
      .filter(l => !provinciaFiltro || l.Parroquia?.Canton?.Provincia?.nombre === provinciaFiltro)
      .map(l => l.Parroquia?.Canton?.nombre);
    return [...new Set(valores.filter(v => typeof v === 'string' && v.trim() !== ''))];
  }, [lugares, provinciaFiltro]);

  const opcionesParroquias = useMemo(() => {
    const valores = lugares
      .filter(l => !cantonFiltro || l.Parroquia?.Canton?.nombre === cantonFiltro)
      .map(l => l.Parroquia?.nombre);
    return [...new Set(valores.filter(v => typeof v === 'string' && v.trim() !== ''))];
  }, [lugares, cantonFiltro]);

  // --- FILTRADO GLOBAL ---
  const lugaresFiltrados = useMemo(() => {
    return lugares.filter(l => {
      if (selectedExternal && l.external !== selectedExternal) return false;

      const busqueda = busquedaTexto.toLowerCase();
      if (busqueda && !l.nombre?.toLowerCase().includes(busqueda) && !l.descripcion?.toLowerCase().includes(busqueda)) return false;

      const esActivo = l.estado !== false && l.estado !== 0 && l.estado !== "inactivo";
      if (estadoFiltro === "activos" && !esActivo) return false;
      if (estadoFiltro === "desactivos" && esActivo) return false;

      if (categoriaFiltro && l.Categoria?.nombre !== categoriaFiltro) return false;
      if (paisFiltro && l.Parroquia?.Canton?.Provincia?.Pais?.nombre !== paisFiltro) return false;
      if (provinciaFiltro && l.Parroquia?.Canton?.Provincia?.nombre !== provinciaFiltro) return false;
      if (cantonFiltro && l.Parroquia?.Canton?.nombre !== cantonFiltro) return false;
      if (parroquiaFiltro && l.Parroquia?.nombre !== parroquiaFiltro) return false;

      return true;
    });
  }, [lugares, selectedExternal, busquedaTexto, estadoFiltro, categoriaFiltro, paisFiltro, provinciaFiltro, cantonFiltro, parroquiaFiltro]);

  useEffect(() => {
    setVisibleCount(6);
  }, [busquedaTexto, estadoFiltro, categoriaFiltro, paisFiltro, provinciaFiltro, cantonFiltro, parroquiaFiltro, selectedExternal]);

  const lugaresVisibles = lugaresFiltrados.slice(0, visibleCount);

  const limpiarFiltros = () => {
    setBusquedaTexto("");
    setEstadoFiltro("todos");
    setCategoriaFiltro("");
    setPaisFiltro("");
    setProvinciaFiltro("");
    setCantonFiltro("");
    setParroquiaFiltro("");
    setSelectedExternal(null);
  };

  const handleCentrarMapa = () => {
    setSelectedExternal(null);
  };

  const handleEliminar = useCallback(async (external, nombre) => {
    const token = sessionStorage.getItem("token");
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el lugar "${nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'Eliminando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const respuesta = await eliminarLugar(token, external);
        if (respuesta && respuesta.code === 200) {
            Swal.fire('¡Eliminado!', respuesta.msg || 'Eliminado.', 'success');
            setLugares((prev) => prev.filter((l) => l.external !== external));
            setSelectedExternal((prev) => prev === external ? null : prev);
        } else {
            Swal.fire('Error', respuesta.msg || 'Error al eliminar', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo de conexión', 'error');
      }
    }
  }, []);

  const handleLocate = useCallback((external) => {
    setSelectedExternal(external);
    setIsMapVisible(true); 

    setTimeout(() => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
          mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 150);
  }, []);

  const handleCargarMas = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Lugares Turísticos</h1>
            <p className="text-slate-500 mt-1">Explora, busca y filtra los puntos de interés.</p>
          </div>
          <Link href="/admin/lugar/nuevo" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg flex gap-2 transition-all hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Nuevo Lugar
          </Link>
        </div>

        {/* --- PANEL DE FILTROS --- */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nombre o descripción..." 
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-48">
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo Activos</option>
                <option value="desactivos">Solo Inactivos</option>
              </select>
            </div>
            
            <button 
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              suppressHydrationWarning
            >
              <option value="">Cualquier Categoría</option>
              {opcionesCategorias.map((c, i) => <option key={`cat-${i}-${c}`} value={c}>{c}</option>)}
            </select>

            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              value={paisFiltro}
              onChange={(e) => { setPaisFiltro(e.target.value); setProvinciaFiltro(""); setCantonFiltro(""); setParroquiaFiltro(""); }}
              suppressHydrationWarning
            >
              <option value="">Cualquier País</option>
              {opcionesPaises.map((p, i) => <option key={`pais-${i}-${p}`} value={p}>{p}</option>)}
            </select>

            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
              value={provinciaFiltro}
              onChange={(e) => { setProvinciaFiltro(e.target.value); setCantonFiltro(""); setParroquiaFiltro(""); }}
              disabled={opcionesProvincias.length === 0}
              suppressHydrationWarning
            >
              <option value="">Cualquier Provincia</option>
              {opcionesProvincias.map((p, i) => <option key={`prov-${i}-${p}`} value={p}>{p}</option>)}
            </select>

            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
              value={cantonFiltro}
              onChange={(e) => { setCantonFiltro(e.target.value); setParroquiaFiltro(""); }}
              disabled={opcionesCantones.length === 0}
              suppressHydrationWarning
            >
              <option value="">Cualquier Cantón</option>
              {opcionesCantones.map((c, i) => <option key={`can-${i}-${c}`} value={c}>{c}</option>)}
            </select>

            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
              value={parroquiaFiltro}
              onChange={(e) => setParroquiaFiltro(e.target.value)}
              disabled={opcionesParroquias.length === 0}
              suppressHydrationWarning
            >
              <option value="">Cualquier Parroquia</option>
              {opcionesParroquias.map((p, i) => <option key={`parr-${i}-${p}`} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* CONTENEDOR DEL MAPA (Muestra el mapa o el botón para abrirlo) */}
        {!loading && lugares.length > 0 && (
          <div className="mb-8 w-full transition-all duration-300 ease-in-out">
            {isMapVisible ? (
              <div className="h-72 md:h-80 w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 z-0 relative animate-in fade-in slide-in-from-top-4">
                <MapaVisualizador 
                    lugares={lugaresFiltrados} 
                    onSelect={(external) => setSelectedExternal(external)} 
                />
                
                {/* BOTONES FLOTANTES DEL MAPA (Abajo Izquierda) */}
                <div className="absolute bottom-4 left-4 flex gap-2 z-[400]">
                    <button 
                      onClick={() => setIsMapVisible(false)}
                      className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl text-slate-700 shadow-sm border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1.5 font-medium text-sm"
                      title="Ocultar mapa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                      Ocultar Mapa
                    </button>

                    <button 
                      onClick={handleCentrarMapa}
                      className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl text-slate-700 shadow-sm border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-colors flex items-center gap-1.5 font-medium text-sm"
                      title="Centrar mapa y ver todos"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2m10-10h-2M4 12H2m13.414-3.414A5.96 5.96 0 0012 6a5.96 5.96 0 00-4.414 2.586"></path><circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle></svg>
                      Centrar
                    </button>
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 shadow-sm border border-slate-200 pointer-events-none z-[400]">
                    Toca un marcador para aislarlo
                </div>
              </div>
            ) : (
              /* BOTÓN PARA ABRIR MAPA CUANDO ESTÁ OCULTO */
              <div className="flex justify-center md:justify-end animate-in fade-in zoom-in-95">
                <button 
                  onClick={() => setIsMapVisible(true)}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 font-medium py-2 px-6 rounded-xl shadow-sm flex items-center gap-2 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  Mostrar Mapa
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESUMEN DE RESULTADOS */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-slate-500 text-sm font-medium">
            Mostrando <span className="text-teal-700 font-bold">{lugaresVisibles.length}</span> de <span className="font-bold">{lugaresFiltrados.length}</span> {lugaresFiltrados.length === 1 ? 'lugar' : 'lugares'}
          </p>
          
          {selectedExternal && (
             <div className="bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Lugar aislado en el mapa
                </span>
                <button 
                    onClick={() => setSelectedExternal(null)} 
                    className="bg-white hover:bg-blue-100 text-blue-600 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-blue-200 transition-colors shadow-sm"
                >
                    Remover
                </button>
             </div>
          )}
        </div>

        {/* GRID DE TARJETAS */}
        {loading ? (
          <div className="text-center py-10 text-slate-400">Cargando lugares...</div>
        ) : (
          <div className="pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lugaresFiltrados.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <p className="text-slate-600 font-medium text-lg">No se encontraron lugares</p>
                  <p className="text-slate-400 text-sm mt-1">Intenta ajustando o limpiando los filtros de búsqueda.</p>
                  <button onClick={limpiarFiltros} className="mt-4 text-teal-600 hover:text-teal-700 font-medium text-sm hover:underline">
                    Limpiar todos los filtros
                  </button>
                </div>
              )}

              {lugaresVisibles.map((lugar) => (
                <LugarCard 
                  key={lugar.external} 
                  lugar={lugar} 
                  onDelete={handleEliminar}
                  onLocate={handleLocate} 
                />
              ))}
            </div>

            {/* BOTÓN CARGAR MÁS */}
            {visibleCount < lugaresFiltrados.length && (
              <div className="mt-10 flex justify-center">
                <button 
                  onClick={handleCargarMas}
                  className="bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold py-2.5 px-8 rounded-xl transition-colors shadow-sm"
                >
                  Cargar más lugares ({lugaresFiltrados.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}