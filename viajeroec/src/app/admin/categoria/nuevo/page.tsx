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
  const [padreSeleccionado, setPadreSeleccionado] = useState(""); 
  const [listaCategorias, setListaCategorias] = useState([]); 
  
  const [icono, setIcono] = useState("grid");
  const [color, setColor] = useState("#78909C");

  const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
  const router = useRouter();

  useEffect(() => {
    const cargarCategorias = async () => {
      if (token) {
        try {
          const respuesta = await listarCategoria(token);
          if (respuesta && respuesta.categorias) {
            setListaCategorias(respuesta.categorias);
          } else if (Array.isArray(respuesta)) {
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
      setLoading(true);
      Swal.fire({ title: "Guardando...", didOpen: () => Swal.showLoading() });
      
      let res;

      if (padreSeleccionado && padreSeleccionado !== "") {
        const data = { 
            nombre, 
            icono,
            color,
            externalPadre: padreSeleccionado 
        };
        res = await registroCategoriaHija(token, data);
      } else {
        const data = { 
            nombre,
            icono,
            color
        };
        res = await registroCategoria(token, data);
      }

      if (res && res.code === 200) {
        Swal.fire({
          icon: "success",
          title: "¡Categoría Creada!",
          text: res.msj,
          confirmButtonColor: "#0d9488",
        });
        setNombre("");
        setPadreSeleccionado(""); 
        setIcono("grid");
        setColor("#78909C");
        router.push('/admin/categoria/lista');

      } else {
        Swal.fire("Error", res.msj || "Error desconocido", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Fallo de conexión", "error");
    } finally {
      setLoading(false);
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Ícono
                  </label>
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
                  list="iconos-sugeridos"
                  required
                  placeholder="Ej: grid, map, compass..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors"
                  value={icono}
                  onChange={(e) => setIcono(e.target.value.toLowerCase())}
                />
                <datalist id="iconos-sugeridos">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-12 w-12 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="#000000"
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors font-mono text-sm uppercase"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría Padre (Opcional)
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none transition-colors appearance-none cursor-pointer"
                value={padreSeleccionado}
                onChange={(e) => setPadreSeleccionado(e.target.value)}
              >
                <option value="">Ninguna (Es categoría principal)</option>
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