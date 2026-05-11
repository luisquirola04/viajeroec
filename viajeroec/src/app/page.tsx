"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { login } from "@/hooks/ServiceAuth"; 

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    correo: "",
    contrasena: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.correo || !form.contrasena) {
        return Swal.fire("Error", "Por favor ingresa correo y contraseña", "warning");
    }

    setLoading(true);

    try {
        const res = await login(form);
console.log(res)
        if (res && res.code === 200) {
            // 1. GUARDAR SESIÓN (Crucial para que funcione el resto de la app)
            sessionStorage.setItem("token", res.token);
            sessionStorage.setItem("user", res.user);
            sessionStorage.setItem("role", res.role);
            sessionStorage.setItem("external", res.external_cuenta);
            sessionStorage.setItem("email", res.correo);

            // 2. Feedback visual
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: 'success',
                title: `Bienvenido, ${res.user}`
            });

            // 3. Redireccionar según el rol (Por ahora al admin de paises)
            // Esperamos un momento para que el usuario lea el mensaje
            setTimeout(() => {
                if (res.isAdmin || res.role === 'ADMIN') {
                    router.push("/admin/pais/lista");
                } 
            }, 1000);

        } else {
            // Error de credenciales o servidor
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: res.msg || res.error || "Credenciales incorrectas",
                confirmButtonColor: '#0d9488'
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Ocurrió un error de conexión", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* --- LADO IZQUIERDO: IMAGEN INSPIRADORA --- */}
        <div className="hidden md:flex md:w-1/2 bg-teal-800 relative flex-col justify-between p-10 text-white">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop" 
                    alt="Paisaje Viajero" 
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 to-teal-800/40 mix-blend-multiply"></div>
            </div>
            
            <div className="relative z-10">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Viajero<span className="text-teal-200">Ec</span></h1>
                <p className="text-teal-100 text-sm opacity-90">Gestión Turística</p>
            </div>

            <div className="relative z-10">
                <blockquote className="text-lg font-medium italic mb-4">
                    "El mundo es un libro y aquellos que no viajan sólo leen una página."
                </blockquote>
                <p className="text-sm text-teal-200">— San Agustín</p>
            </div>
        </div>

        {/* --- LADO DERECHO: FORMULARIO --- */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Iniciar Sesión</h2>
                    <p className="text-slate-500">Ingresa tus credenciales para acceder al panel.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Input Correo */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            </div>
                            <input 
                                type="email" 
                                name="correo"
                                required 
                                className="pl-10 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                                placeholder="correo@dominio.com"
                                value={form.correo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Input Clave */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <input 
                                type="password" 
                                name="contrasena"
                                required 
                                className="pl-10 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                                placeholder="••••••••"
                                value={form.contrasena}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Botón Submit */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transform transition-all hover:-translate-y-1 flex justify-center items-center gap-2
                        ${loading 
                            ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Ingresando...
                            </>
                        ) : (
                            <>Acceder al Sistema</>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <a href="#" className="text-sm text-teal-600 hover:text-teal-800 font-medium hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}