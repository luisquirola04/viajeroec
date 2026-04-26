"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarCanton, cambiarEstadoCanton } from "@/hooks/ServiceCanton"; // Asegúrate de tener cambiarEstadoCanton
import Swal from "sweetalert2";

export default function ListaCantones() {
  const [cantones, setCantones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

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

  const manejarEliminar = async (external: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se cambiará el estado de este cantón.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const respuesta = await cambiarEstadoCanton(token, external);
        if (respuesta && respuesta.code === 200) {
            Swal.fire('¡Actualizado!', 'El estado del cantón ha cambiado.', 'success');
            setCantones((prev) => prev.filter((c: any) => c.external !== external));
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo completar la acción.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Ocurrió un problema en el servidor.', 'error');
      }
    }
  };

  const cantonesFiltrados = cantones.filter((canton: any) => {
    const coincideBusqueda = canton.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (canton.info && canton.info.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideEstado = filtroEstado === "todos" ? true :
                           filtroEstado === "activos" ? canton.estado === true : 
                           canton.estado === false;

    return coincideBusqueda && coincideEstado;
  });

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

        {/* Filtros y Buscador */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" placeholder="Buscar por nombre o descripción..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <div className="w-full md:w-64">
                <select className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="todos">Todos los estados</option>
                    <option value="activos">Solo Activos</option>
                    <option value="inactivos">Solo Inactivos</option>
                </select>
            </div>
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
                {cantonesFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                             <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No se encontraron resultados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10 items-start">
                        {cantonesFiltrados.map((canton: any) => {
                            const provincia = canton.Provincia;
                            const pais = provincia?.Pais;

                            return (
                                <div key={canton.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-auto">
                                    <div className="p-6 flex flex-col flex-1">
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1 flex-1 pr-2" title={canton.nombre}>
                                                    {canton.nombre}
                                                </h3>
                                                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${canton.estado ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} title={canton.estado ? 'Activo' : 'Inactivo'}></div>
                                            </div>

                                            <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 w-16">País</span>
                                                    <span className="text-xs font-semibold text-slate-700 truncate flex-1">
                                                        {pais?.nombre || "Sin País"}
                                                    </span>
                                                </div>
                                                <div className="h-px bg-slate-200 w-full"></div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 w-16">Provincia</span>
                                                    <span className="text-xs font-bold text-teal-600 truncate flex-1">
                                                        {provincia?.nombre  || "Sin Provincia"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Texto completo visible */}
                                            <div className="text-slate-500 text-sm mb-4 flex-1 whitespace-pre-wrap">
                                                {canton.info}
                                            </div>

                                            {/* Botones Edit/Delete compartiendo espacio */}
                                            <div className="pt-4 border-t border-slate-100 flex gap-3 mt-auto">
                                                <Link 
                                                    href={`/admin/canton/editar/${canton.external}`}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors text-sm font-medium"
                                                >
                                                    Editar
                                                </Link>
                                                <button 
                                                    onClick={() => manejarEliminar(canton.external)} 
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-sm font-medium"
                                                >
                                                    Eliminar
                                                </button>
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