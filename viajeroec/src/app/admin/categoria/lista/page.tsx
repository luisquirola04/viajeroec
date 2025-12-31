"use client";

import { useEffect, useState, Fragment } from "react"; // <--- AQUÍ FALTABA IMPORTAR FRAGMENT
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { listarCategoria, listarCategoriasHijas } from '@/hooks/ServiceCategoria'; 
import Swal from "sweetalert2";

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA EL ACORDEÓN
  const [expandedId, setExpandedId] = useState(null); 
  const [hijasData, setHijasData] = useState({}); 
  const [loadingHijas, setLoadingHijas] = useState(false);

  useEffect(() => {
    const cargar = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await listarCategoria(token);
            if (res && res.categorias) setCategorias(res.categorias);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    cargar();
  }, []);

  const toggleHijas = async (categoria) => {
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
        console.log(res)
        if (res && res.categorias) {
            setHijasData(prev => ({ ...prev, [categoria.id]: res.categorias }));
        } else {
            setHijasData(prev => ({ ...prev, [categoria.id]: res.categorias || [] }));
        }
    } catch (error) {
        console.error("Error cargando hijas", error);
    } finally {
        setLoadingHijas(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        
        {/* Encabezado */}
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
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Nombre de Categoría</th>
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
                                categorias.map((cat, index) => (
                                    <Fragment key={cat.id}>
                                        {/* FILA PADRE */}
                                        <tr className={`transition-colors duration-200 ${expandedId === cat.id ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'}`}>
                                            <td className="px-6 py-4 text-slate-400 font-mono">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {cat.nombre}
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
                                                     {expandedId === cat.id ? 'Ocultar' : 'Ver Hijas'}
                                                    <svg className={`w-4 h-4 transform transition-transform ${expandedId === cat.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>
                                                
                                                <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                            </td>
                                        </tr>

                                        {/* FILA HIJAS */}
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
                                                                {hijasData[cat.id].map((hija) => (
                                                                    <div key={hija.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                                        <span className="text-sm text-slate-700 font-medium">{hija.nombre}</span>
                                                                        <span className={`w-2 h-2 rounded-full ${hija.estado ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
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