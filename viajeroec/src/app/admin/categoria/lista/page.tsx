"use client";

import { useEffect, useState, Fragment } from "react"; 
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarCategoria, listarCategoriasHijas, cambiarEstadoCategoria } from '@/hooks/ServiceCategoria'; 
import Swal from "sweetalert2";

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedId, setExpandedId] = useState(null); 
  const [hijasData, setHijasData] = useState<any>({}); 
  const [loadingHijas, setLoadingHijas] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
          const res = await listarCategoria(token);
          if (res && res.categorias) setCategorias(res.categorias);
      } catch (error) { 
          console.error(error); 
      } finally { 
          setLoading(false); 
      }
  };

  const toggleHijas = async (categoria: any) => {
    if (expandedId === categoria.id) {
        setExpandedId(null);
        return;
    }
    setExpandedId(categoria.id);

    if (hijasData[categoria.id]) return;

    setLoadingHijas(true);
    const token = sessionStorage.getItem("token");
    try {
        const res = await listarCategoriasHijas(token, categoria.external);
        if (res && res.categorias) {
            setHijasData((prev: any) => ({ ...prev, [categoria.id]: res.categorias }));
        } else {
            setHijasData((prev: any) => ({ ...prev, [categoria.id]: [] }));
        }
    } catch (error) {
        console.error("Error cargando hijas", error);
    } finally {
        setLoadingHijas(false);
    }
  };

  const manejarEliminar = async (external: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se cambiará el estado de esta categoría.",
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
        const respuesta = await cambiarEstadoCategoria(token, external);
        Swal.close();

        if (respuesta && respuesta.code === 200) {
            Swal.fire('¡Actualizado!', 'El estado ha cambiado.', 'success');
            
            setCategorias((prev: any) => 
                prev.map((c: any) => c.external === external ? { ...c, estado: !c.estado } : c)
            );

            setHijasData((prev: any) => {
                const newData = { ...prev };
                for (const key in newData) {
                    newData[key] = newData[key].map((h: any) => h.external === external ? { ...h, estado: !h.estado } : h);
                }
                return newData;
            });
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo completar la acción.', 'error');
        }
      } catch (error) {
        Swal.close();
        Swal.fire('Error', 'Ocurrió un problema de conexión.', 'error');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Categorías</h1>
                <p className="text-slate-500 mt-1">Administra los tipos de lugares turísticos.</p>
            </div>
            <Link href="/admin/categoria/nuevo" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nueva
            </Link>
        </div>

        {loading ? (
            <div className="text-center py-10 text-slate-400">Cargando categorías...</div>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Diseño (Ícono/Color)</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-slate-100">
                            {categorias.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                        No hay categorías registradas.
                                    </td>
                                </tr>
                            ) : (
                                categorias.map((cat: any) => (
                                    <Fragment key={cat.id}>
                                        <tr className={`transition-colors duration-200 ${expandedId === cat.id ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'}`}>
                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {cat.nombre}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        className="w-4 h-4 rounded-full shadow-sm" 
                                                        style={{ backgroundColor: cat.color || '#78909C' }}
                                                    ></span>
                                                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                                                        {cat.icono || 'grid'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${cat.estado 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                        : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}
                                                >
                                                    {cat.estado ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button 
                                                    onClick={() => toggleHijas(cat)}
                                                    className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold
                                                        ${expandedId === cat.id 
                                                            ? 'bg-teal-100 text-teal-700' 
                                                            : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                                                >
                                                     {expandedId === cat.id ? 'Ocultar' : 'Ver Subcategorías'}
                                                    <svg className={`w-4 h-4 transform transition-transform ${expandedId === cat.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>
                                                
                                                <Link href={`/admin/categoria/editar/${cat.external}`} className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50" title="Editar">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Link>

                                                <button onClick={() => manejarEliminar(cat.external)} className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50" title="Eliminar/Restaurar">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedId === cat.id && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={4} className="px-6 py-4 border-b border-slate-100">
                                                    <div className="ml-8 pl-4 border-l-2 border-teal-200">
                                                        <h4 className="text-xs font-bold text-teal-600 uppercase mb-3 tracking-wider">
                                                            Subcategorías de "{cat.nombre}"
                                                        </h4>
                                                        
                                                        {loadingHijas && !hijasData[cat.id] ? (
                                                            <div className="text-sm text-slate-400 italic">Cargando subcategorías...</div>
                                                        ) : hijasData[cat.id] && hijasData[cat.id].length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {hijasData[cat.id].map((hija: any) => (
                                                                    <div key={hija.id} className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow gap-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${hija.estado ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                                                <span className={`text-sm font-medium ${hija.estado ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{hija.nombre}</span>
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                <Link href={`/admin/categoria/editar/${hija.external}`} className="text-slate-300 hover:text-teal-600 p-1" title="Editar Subcategoría">
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                                                </Link>
                                                                                <button onClick={() => manejarEliminar(hija.external)} className="text-slate-300 hover:text-red-600 p-1" title="Cambiar Estado">
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        {/* Mostrar diseño de la hija */}
                                                                        <div className="flex items-center gap-2 pl-4">
                                                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hija.color || '#78909C' }}></span>
                                                                            <span className="text-[10px] text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                                                {hija.icono || 'grid'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-slate-400 italic">No hay subcategorías registradas.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}