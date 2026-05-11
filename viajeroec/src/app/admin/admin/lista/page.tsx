"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import Swal from 'sweetalert2';

import { getAdmins } from '@/hooks/ServiceAuth'; 

export default function ListaAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      const token = sessionStorage.getItem("token");
      
      if (!token) {
          Swal.fire("Error", "No estás autenticado", "error");
          setLoading(false);
          return;
      }

      try {
        const response = await getAdmins(token);
        
        if (response && response.admins) {
            setAdmins(response.admins);
        } else {
            Swal.fire("Aviso", "No se pudieron cargar los administradores", "warning");
        }
      } catch (error) {
        console.error("Error al cargar administradores:", error);
        Swal.fire("Error", "Ocurrió un problema al conectar con el servidor", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 md:ml-64 transition-all duration-300">
            <div className="max-w-6xl mx-auto">
                
                {/* Cabecera de la página */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Administradores</h1>
                        <p className="text-slate-500 mt-1">Gestión de usuarios con privilegios en el sistema.</p>
                    </div>
                    
                    <Link href="nuevo" 
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nuevo Administrador
                    </Link>
                </div>

                {/* Contenedor de la Tabla */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Nombre</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Apellido</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Correo</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-3">
                                                <div className="w-6 h-6 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                                Cargando datos...
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-500">
                                            No hay administradores registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin) => (
                                        <tr key={admin.external} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-slate-800 font-medium">{admin.nombre}</td>
                                            <td className="py-4 px-6 text-slate-600">{admin.apellido}</td>
                                            <td className="py-4 px-6 text-slate-600">{admin.correo}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    admin.estado === true || admin.estado === 'ACTIVO' 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        admin.estado === true || admin.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'
                                                    }`}></span>
                                                    {admin.estado === true || admin.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    </div>
  );
}