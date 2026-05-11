"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { getCategoria, editarCategoria } from "@/hooks/ServiceCategoria"; 
import Swal from "sweetalert2";
import Link from "next/link";

export default function EditarCategoria() {
  const router = useRouter();
  const { external } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    icono: "grid",
    color: "#78909C",
    externalCategoria: external 
  });

  useEffect(() => {
    if (external) cargarCategoria();
  }, [external]);

  const cargarCategoria = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        router.push("/admin/categoria");
        return;
    }

    try {
      const respuesta = await getCategoria(token, external);
      
      let c = null;
      if (respuesta && respuesta.categoria && Array.isArray(respuesta.categoria)) {
          c = respuesta.categoria[0]; 
      } else if (respuesta && respuesta.categoria) {
          c = respuesta.categoria; 
      } else if (respuesta && respuesta.msj) {
          c = respuesta.msj; 
      }

      if (c) {
        setFormData({
            nombre: c.nombre || "",
            icono: c.icono || "grid",
            color: c.color || "#78909C",
            externalCategoria: external as string
        });
      } else {
        Swal.fire("Error", "No se encontró la categoría", "error");
        router.push("/admin/categoria");
      }
    } catch (error) {
      console.error("Error al cargar:", error);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, icono: e.target.value.toLowerCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!formData.nombre.trim()) {
        Swal.fire("Atención", "El nombre de la categoría es obligatorio", "warning");
        return;
    }

    const payload = {
        nombre: formData.nombre,
        icono: formData.icono,
        color: formData.color,
        externalCategoria: external as string 
    };

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const respuesta = await editarCategoria(token, payload);
        Swal.close();

        if (respuesta && respuesta.code === 200) {
            await Swal.fire('¡Éxito!', 'Categoría actualizada correctamente.', 'success');
            router.push("/admin/categoria/lista");
        } else {
            Swal.fire('Error', respuesta?.msj || 'No se pudo actualizar', 'error');
        }
    } catch (error) {
        Swal.close();
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen flex justify-center">
        <div className="w-full max-w-xl">
            <Link href="/admin/categoria/lista" className="text-teal-600 hover:text-teal-800 flex items-center gap-2 mb-6 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver a la lista
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Categoría</h1>

                {loading ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-slate-500">Cargando información...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Categoría</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                                placeholder="Ej: Playas, Museos, Montañas..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700">Ícono</label>
                                <a 
                                    href="https://icons.expo.fyi/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-teal-600 hover:text-teal-800 underline font-medium transition-colors"
                                >
                                    Explorar galería
                                </a>
                                </div>
                                <input
                                type="text"
                                list="iconos-sugeridos-editar"
                                required
                                name="icono"
                                placeholder="Ej: grid, map, compass..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors"
                                value={formData.icono}
                                onChange={handleIconChange}
                                />
                                <datalist id="iconos-sugeridos-editar">
                                <option value="grid">General</option>
                                <option value="restaurant">Gastronomía</option>
                                <option value="bed">Alojamiento</option>
                                <option value="calendar">Eventos</option>
                                <option value="camera">Turismo</option>
                                <option value="bicycle">Actividades</option>
                                <option value="map">Mapas</option>
                                <option value="compass">Aventura</option>
                                </datalist>
                            </div>

                            {/* CAMBIO AQUÍ: Input de texto para pegar el Hexadecimal */}
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Color (Hex)</label>
                                <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    name="color"
                                    className="h-12 w-12 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                                    value={formData.color}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="color"
                                    maxLength={7}
                                    placeholder="#000000"
                                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors font-mono text-sm uppercase"
                                    value={formData.color}
                                    onChange={handleChange}
                                />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 mt-4"
                        >
                            Guardar Cambios
                        </button>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}