"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import { registroCategoria } from "@/hooks/ServiceCategoria"; // Ajusta la ruta

export default function CrearCategoriaForm() {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const token = sessionStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())
      return Swal.fire("Error", "Escribe un nombre", "warning");

    try {
      Swal.fire({ title: "Guardando...", didOpen: () => Swal.showLoading() });
      const res = await registroCategoria(token, {nombre});
      console.log(res);
      if (res && res.code === 200) {
        Swal.fire({
          icon: "success",
          title: "¡Categoría Creada!",
          text: res.msj,
          confirmButtonColor: "#0d9488",
        });
        setNombre("");
      } else {
        Swal.fire("Error", res.msj || "Error desconocido", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Fallo de conexión", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Nueva Categoría
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de Categoría
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Playas, Montañas, Gastronomía..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold shadow-lg bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-teal-500/30 transform hover:-translate-y-1 transition-all"
            >
              Guardar Categoría
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
