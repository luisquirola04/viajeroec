"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import { 
  registroCategoria, 
  registroCategoriaHija, 
  listarCategoria 
} from "@/hooks/ServiceCategoria"; 
import { useRouter } from 'next/navigation';

export default function CrearCategoriaForm() {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [padreSeleccionado, setPadreSeleccionado] = useState(""); // Aquí guardaremos el 'external'
  const [listaCategorias, setListaCategorias] = useState([]); // Array de categorías
  
  const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
  const router = useRouter();

  // 1. Cargar las categorías existentes
  useEffect(() => {
    const cargarCategorias = async () => {
      if (token) {
        try {
          const respuesta = await listarCategoria(token);
          // console.log("Respuesta categorias:", respuesta); // Debug

          // AJUSTE AQUÍ: La respuesta tiene la forma { code: 200, categorias: [...] }
          // Dependiendo de cómo retorne tu servicio, accedemos a .categorias
          if (respuesta && respuesta.categorias) {
            setListaCategorias(respuesta.categorias);
          } else if (Array.isArray(respuesta)) {
             // Por si acaso el servicio devolviera el array directo
            setListaCategorias(respuesta);
          }
        } catch (error) {
          console.error("Error cargando categorías", error);
        }
      }
    };
    cargarCategorias();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())
      return Swal.fire("Error", "Escribe un nombre", "warning");

    try {
      Swal.fire({ title: "Guardando...", didOpen: () => Swal.showLoading() });
      
      let res;

      // 2. Lógica para decidir si es Padre o Hija
      if (padreSeleccionado && padreSeleccionado !== "") {
        // ES HIJA: enviamos el external del padre seleccionado
        const data = { 
            nombre, 
            externalPadre: padreSeleccionado 
        };
        res = await registroCategoriaHija(token, data);
      } else {
        // ES PADRE: solo enviamos nombre
        const data = { nombre };
        res = await registroCategoria(token, data);
      }

      // Validamos respuesta (Tu back devuelve code: 200 en el body)
      if (res && res.code === 200) {
        Swal.fire({
          icon: "success",
          title: "¡Categoría Creada!",
          text: res.msj,
          confirmButtonColor: "#0d9488",
        });
        setNombre("");
        setPadreSeleccionado(""); 
        router.push('/admin/categoria/lista');

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
            {/* Input Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de Categoría
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Playas, Montañas, Gastronomía..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            {/* Select Padre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría Padre (Opcional)
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors appearance-none cursor-pointer"
                value={padreSeleccionado}
                onChange={(e) => setPadreSeleccionado(e.target.value)}
              >
                {/* Opción por defecto para crear una raíz */}
                <option value="">Ninguna (Es categoría principal)</option>
                
                {/* Mapeo basado en tu JSON: usamos 'external' como value */}
                {listaCategorias.map((cat) => (
                  <option key={cat.id} value={cat.external}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1 ml-1">
                Selecciona una opción solo si esta categoría pertenece a otra.
              </p>
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