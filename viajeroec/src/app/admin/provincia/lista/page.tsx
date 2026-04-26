"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarProvincia, cambiarEstadoProvincia } from "@/hooks/ServiceProvincia"; // Asegúrate de tener cambiarEstadoProvincia exportado en tu servicio
import Swal from "sweetalert2";

export default function ListaProvincias() {
  const [provincias, setProvincias] = useState([]);
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
      // Usamos el listar según tu controller, asumo que llamas a getProvinciasActivas o similar
      const respuesta = await listarProvincia(token);
      
      if (respuesta && respuesta.provincias && Array.isArray(respuesta.provincias)) {
        setProvincias(respuesta.provincias);
      } else {
        setProvincias([]); 
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
      text: "Se cambiará el estado de esta provincia. No se podrá eliminar si tiene cantones asociados.",
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
        const respuesta = await cambiarEstadoProvincia(token, external);
        console.log("hola")
        console.log(respuesta)
        // Tu backend devuelve code 400 si tiene cantones, lo manejamos aquí
        if (respuesta && respuesta.code === 200) {
            Swal.fire('¡Actualizado!', 'El estado de la provincia ha cambiado.', 'success');
            // Removemos de la vista o recargamos
            setProvincias((prev) => prev.filter((p: any) => p.external !== external));
            // cargarDatos(); // Descomenta esto si prefieres que se quede en pantalla como "Inactivo"
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo completar la acción.', 'error');
        }
      } catch (error) {
        console.log(error)

        Swal.fire('Error', 'Ocurrió un problema en el servidor.', 'error');
      }
    }
  };

  const obtenerImagenValida = (url: string) => {
    if (!url || !url.startsWith("http")) {
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop";
    }
    return url;
  };

  const provinciasFiltradas = provincias.filter((prov: any) => {
    const coincideBusqueda = prov.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (prov.info && prov.info.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideEstado = filtroEstado === "todos" ? true :
                           filtroEstado === "activos" ? prov.estado === true : 
                           prov.estado === false;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Provincias Registradas</h1>
                <p className="text-slate-500 mt-1">Gestiona las ubicaciones turísticas por provincia.</p>
            </div>
            <Link href="/admin/provincia/nuevo" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nueva Provincia
            </Link>
        </div>

        {/* Filtros */}
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

        {loading ? (
             <div className="text-center py-10 text-slate-500">Cargando...</div>
        ) : (
            <>
                {provinciasFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                             <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No se encontraron resultados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10 items-start">
                        {provinciasFiltradas.map((prov: any) => (
                            <div key={prov.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-auto">
                                <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                                    <img src={obtenerImagenValida(prov.imagen)} alt={prov.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${prov.estado ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {prov.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">{prov.nombre}</h3>

                                    <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase w-10 flex items-center gap-1">País</span>
                                            <div className="h-4 w-px bg-slate-300"></div>
                                            <span className="text-sm font-bold text-teal-700 truncate">{prov.Pais?.nombre || "Sin País"}</span>
                                        </div>
                                    </div>

                                    {/* Texto completo visible */}
                                    <div className="text-slate-500 text-sm mb-4 flex-1 whitespace-pre-wrap">
                                        {prov.info}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex gap-3 mt-auto">
                                        <Link href={`/admin/provincia/editar/${prov.external}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors">
                                            Editar
                                        </Link>
                                        <button onClick={() => manejarEliminar(prov.external)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                                            Eliminar
                                        </button>
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