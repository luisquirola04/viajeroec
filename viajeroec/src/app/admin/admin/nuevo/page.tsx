"use client";

import { useState } from 'react';
import Swal from 'sweetalert2'; 
import Sidebar from "@/components/Sidebar";
import { useRouter } from 'next/navigation';

import { crearAdmin } from '@/hooks/ServiceAuth'; 

export default function CrearAdminForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: ''
  });

  // Validaciones Regex
  const validarCorreo = (correo) => {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  };

  const validarContrasena = (contrasena) => {
    // Mínimo 8 caracteres, al menos una letra y un número
    const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&.-]{8,}$/;
    return regexContrasena.test(contrasena);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validar formato de correo
    if (!validarCorreo(form.correo)) {
        return Swal.fire('Formato Inválido', 'Por favor, ingresa un correo electrónico válido.', 'warning');
    }

    // 2. Validar seguridad de contraseña
    if (!validarContrasena(form.contrasena)) {
        return Swal.fire(
            'Contraseña Débil', 
            'La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número.', 
            'warning'
        );
    }

    try {
        setLoading(true);
        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando nuevo administrador en el sistema.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await crearAdmin(form);

        if(res && (res.code === 200 || res.status === 200)) { 
            Swal.fire({
                icon: 'success',
                title: '¡Administrador Creado!',
                text: res.msj || 'Registrado correctamente.',
                confirmButtonColor: '#0d9488', 
            });
            // Resetear form
            setForm({ nombre: '', apellido: '', correo: '', contrasena: '' });
            
            router.push('/admin/admin/lista');

        } else {
            Swal.fire('Error', res.response?.data?.msg || res.msj || 'No se pudo guardar.', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo de conexión', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
                
                <div className="mb-8 text-center">
                    <div className="inline-block p-3 rounded-full bg-teal-50 text-teal-600 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c4 0 7 3 7 7H5c0-4 3-7 7-7zm0-2a5 5 0 110-10 5 5 0 010 10z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Nuevo Administrador</h2>
                    <p className="text-slate-500 mt-2">Registra un nuevo usuario con privilegios de sistema.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                            <input type="text" required placeholder="Ej: Juan" className="input-field w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors" 
                                value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Apellido</label>
                            <input type="text" required placeholder="Ej: Pérez" className="input-field w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors" 
                                value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico</label>
                        <input type="email" required placeholder="correo@dominio.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors" 
                            value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                        <input type="password" required placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors" 
                            value={form.contrasena} onChange={(e) => setForm({...form, contrasena: e.target.value})} 
                        />
                        <p className="text-xs text-slate-500 mt-2">Mínimo 8 caracteres, al menos una letra y un número.</p>
                    </div>
                    
                    <div className="pt-4">
                        <button type="submit" disabled={loading} 
                            className={`w-full px-12 py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:-translate-y-1 
                            ${loading ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'}`}
                        >
                            {loading ? 'Procesando...' : 'Crear Administrador'}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    </div>
  );
}