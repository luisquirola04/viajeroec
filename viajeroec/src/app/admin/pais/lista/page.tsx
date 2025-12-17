"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarPaises } from "@/hooks/ServicePais"; 
import Swal from "sweetalert2";

export default function ListaPaises() {
  const [paises, setPaises] = useState([]);
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
      const respuesta = await listarPaises(token);
      
      // --- CAMBIO IMPORTANTE AQUI ---
      // Tu JSON llega como { paises: [...] }, asi que accedemos a respuesta.paises
      if (respuesta && respuesta.paises && Array.isArray(respuesta.paises)) {
        setPaises(respuesta.paises);
      } else {
        console.error("Formato inesperado:", respuesta);
        setPaises([]); 
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para validar si la imagen es una URL válida
  // Si es "asdadsad" o no empieza con http, mostramos una imagen por defecto
  const obtenerImagenValida = (url: string) => {
    if (!url || !url.startsWith("http")) {
        // Retorna una imagen placeholder de turismo genérica si la URL está rota
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop";
    }
    return url;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Destinos Turísticos</h1>
                <p className="text-slate-500 mt-1">Gestiona los países registrados en el sistema.</p>
            </div>
            
            <Link 
                href="/admin/pais/nuevo" 
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo País
            </Link>
        </div>

        {/* Carga o Lista */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white h-80 rounded-2xl shadow-sm animate-pulse border border-slate-100">
                        <div className="h-48 bg-slate-200 rounded-t-2xl"></div>
                        <div className="p-4 space-y-3">
                            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <>
                {paises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                             <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No hay países registrados</p>
                        <p className="text-slate-400 text-sm">Empieza creando uno nuevo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                        {paises.map((pais: any) => (
                            <div 
                                key={pais.external} 
                                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col h-full"
                            >
                                {/* IMAGEN CON VALIDACIÓN */}
                                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                                    <img 
                                        src={obtenerImagenValida(pais.imagen)} // <--- Usamos la función aquí
                                        alt={pais.nombre}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            // Fallback extra por si la URL parece buena pero falla al cargar
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop";
                                        }}
                                    />
                                    
                                    {/* Badge Estado */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md border border-white/20
                                            ${pais.estado 
                                                ? 'bg-emerald-500/90 text-white' 
                                                : 'bg-red-500/90 text-white'
                                            }`}
                                        >
                                            {pais.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-800 line-clamp-1" title={pais.nombre}>
                                            {pais.nombre}
                                        </h3>
                                    </div>
                                    
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">
                                        {pais.info}
                                    </p>

                                    {/* Botones */}
                                    <div className="pt-4 border-t border-slate-100 flex gap-3 mt-auto">
                                        <Link 
                                            href={`/admin/pais/editar/${pais.external}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-teal-50 hover:text-teal-600 transition-colors border border-transparent hover:border-teal-100"
                                        >
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