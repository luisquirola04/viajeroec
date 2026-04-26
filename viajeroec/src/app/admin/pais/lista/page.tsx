"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarPaises, cambiarEstadoPais } from "@/hooks/ServicePais"; 
import Swal from "sweetalert2";

export default function ListaPaises() {
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const respuesta = await listarPaises(token);
      if (respuesta && respuesta.paises && Array.isArray(respuesta.paises)) {
        setPaises(respuesta.paises);
      } else {
        setPaises([]); 
      }
    } catch (error) {
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
      text: "Se cambiará el estado de este país.",
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
        const respuesta = await cambiarEstadoPais(token, external);
        console.log(respuesta)
        if (respuesta && respuesta.code === 200) {
            Swal.fire('¡Actualizado!', respuesta.msg || 'La acción se realizó con éxito.', 'success');
            setPaises((prev) => prev.filter((p: any) => p.external !== external));
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo completar la acción.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Ocurrió un problema en el servidor.', 'error');
      }
    }
  };

  const obtenerImagenValida = (url: string) => {
    if (!url || !url.startsWith("http")) return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop";
    return url;
  };

  const paisesFiltrados = paises.filter((pais: any) => {
    const coincideBusqueda = pais.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (pais.info && pais.info.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideEstado = filtroEstado === "todos" ? true :
                           filtroEstado === "activos" ? pais.estado === true : 
                           pais.estado === false;
    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Destinos Turísticos</h1>
                <p className="text-slate-500 mt-1">Gestiona los países registrados en el sistema.</p>
            </div>
            <Link href="/admin/pais/nuevo" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo País
            </Link>
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10 items-start">
                {paisesFiltrados.map((pais: any) => (
                    <div key={pais.external} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-auto">
                        <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                            <img src={obtenerImagenValida(pais.imagen)} alt={pais.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${pais.estado ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {pais.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{pais.nombre}</h3>
                            
                            {/* AQUÍ ESTÁ EL CAMBIO: Se eliminó line-clamp-3 y se agregó whitespace-pre-wrap */}
                            <div className="text-slate-500 text-sm mb-4 flex-1 whitespace-pre-wrap">
                                {pais.info}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-3 mt-auto">
                                <Link href={`/admin/pais/editar/${pais.external}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors">
                                    Editar
                                </Link>
                                <button onClick={() => manejarEliminar(pais.external)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}