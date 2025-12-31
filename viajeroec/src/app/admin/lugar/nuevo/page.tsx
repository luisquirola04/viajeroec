"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Sidebar from "@/components/Sidebar";
import dynamic from 'next/dynamic';
import { registroLugar } from '@/hooks/ServiceLugar';
// IMPORTANTE: Importamos también listarCategoriasHijas
import { listarCategoria, listarCategoriasHijas } from '@/hooks/ServiceCategoria';
import { listarParroquia } from '@/hooks/ServiceParroquia';
import { useRouter } from 'next/navigation';

// Carga dinámica del mapa
const MapaSelector = dynamic(() => import('@/components/MapaSelector'), {
    ssr: false,
    loading: () => <p className="text-center p-10 bg-slate-100 text-slate-400">Cargando mapa...</p>
});

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HORAS_DIA = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function CrearLugarForm() {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [multimedia, setMultimedia] = useState([]);
    
    const [listaCategorias, setListaCategorias] = useState([]); // Aquí guardaremos padres E hijas mezclados
    const [listaParroquias, setListaParroquias] = useState([]);
    const [token, setToken] = useState(null);
    const router = useRouter();

    const [schedule, setSchedule] = useState({
        diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00'
    });

    const [form, setForm] = useState({
        nombre: '', descripcion: '', horario: '',
        latitud: -3.99313, longitud: -79.20422,
        categoria_external: '', parroquia_external: ''
    });

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    // 1. Obtener Token
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setToken(sessionStorage.getItem("token"));
        }
    }, []);

    // 2. CARGA DE COMBOS (MODIFICADO PARA TRAER HIJAS)
    useEffect(() => {
        if (!token) return;

        const cargarDatos = async () => {
            try {
                // A. Cargar Parroquias y Categorias PADRES
                const [resCat, resParr] = await Promise.all([
                    listarCategoria(token), 
                    listarParroquia(token)
                ]);

                // B. Procesar Categorias
                let todasLasCategorias = [];
                
                if (resCat && resCat.categorias) {
                    const padres = resCat.categorias;
                    todasLasCategorias = [...padres]; // Agregamos los padres primero

                    // C. Buscar las hijas de cada padre encontrado
                    // Creamos un array de promesas para pedir las hijas de todos los padres a la vez
                    const promesasHijas = padres.map(padre => 
                        listarCategoriasHijas(token, padre.external)
                    );
                    
                    const resultadosHijas = await Promise.all(promesasHijas);

                    // D. Agregamos las hijas encontradas a la lista principal
                    resultadosHijas.forEach(res => {
                        if (res && res.categorias && res.categorias.length > 0) {
                            todasLasCategorias = [...todasLasCategorias, ...res.categorias];
                        }
                    });
                }

                // Guardamos la lista COMPLETA (Padres + Hijas)
                setListaCategorias(todasLasCategorias);

                // Cargar Parroquias
                if (resParr?.parroquias) setListaParroquias(resParr.parroquias);

            } catch (error) { 
                console.error("Error cargando datos:", error); 
            }
        };

        cargarDatos();
    }, [token]);


    // 3. Lógica Horario
    useEffect(() => {
        let textoHorario = schedule.diaFin === "" 
            ? `${schedule.diaInicio} de ${schedule.horaInicio} a ${schedule.horaFin}`
            : `${schedule.diaInicio} a ${schedule.diaFin} de ${schedule.horaInicio} a ${schedule.horaFin}`;
        setForm(prev => ({ ...prev, horario: textoHorario }));
    }, [schedule]);

    // --- MANEJO DE IMÁGENES ---
    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        const filesArray = Array.from(files);
        try {
            const uploadPromises = filesArray.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: formData });
                if (!res.ok) throw new Error("Fallo upload");
                const data = await res.json();
                return data.secure_url;
            });
            const newUrls = await Promise.all(uploadPromises);
            setMultimedia((prev) => [...prev, ...newUrls]);
        } catch (error) { Swal.fire('Error', 'Fallo subida', 'error'); }
        finally { setUploading(false); e.target.value = ''; }
    };

    const handleRemoveImage = (indexToRemove) => {
        setMultimedia((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    // --- ENVIAR FORMULARIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (multimedia.length === 0) return Swal.fire('Falta multimedia', 'Sube foto/video', 'warning');
        if (!form.categoria_external || !form.parroquia_external) return Swal.fire('Datos incompletos', 'Selecciona categoría y parroquia', 'warning');

        const dataToSend = {
            ...form,
            imagenes: multimedia,
            externalCategoria: form.categoria_external,
            externalParroquia: form.parroquia_external
        };

        try {
            setLoading(true);
            const res = await registroLugar(token, dataToSend);
            if (res && res.code === 200) {
                Swal.fire({ icon: 'success', title: '¡Lugar Creado!', text: res.msj });
                setForm({ nombre: '', descripcion: '', horario: '', latitud: -3.99313, longitud: -79.20422, categoria_external: '', parroquia_external: '' });
                setMultimedia([]);
                setSchedule({ diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00' });
                router.push('/admin/lugar/lista')
            } else {
                Swal.fire('Error', res.msj, 'error');
            }
        } catch (error) { Swal.fire('Error', 'Fallo de conexión', 'error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                    {/* IZQUIERDA: GALERÍA */}
                    <div className="md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">1. Galería Multimedia</h3>
                        <label className="border-2 border-dashed rounded-xl w-full h-32 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-teal-50 mb-4">
                            <span className="text-slate-500 font-medium">{uploading ? 'Subiendo...' : 'Subir Fotos/Videos'}</span>
                            <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                        <div className="flex-1 overflow-y-auto max-h-[400px]">
                            <div className="grid grid-cols-2 gap-2">
                                {multimedia.map((url, i) => (
                                    <div key={i} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DERECHA */}
                    <div className="md:w-2/3 p-8 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Información y Ubicación</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="md:col-span-2">
                                <label className="label-text">Nombre</label>
                                <input type="text" required className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                            </div>

                            {/* --- SELECT DE CATEGORÍA --- */}
                            <div>
                                <label className="label-text">Categoría</label>
                                <select 
                                    required 
                                    className="input-field" 
                                    value={form.categoria_external} 
                                    onChange={(e) => setForm({ ...form, categoria_external: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    
                                    {/* LOGICA DE AGRUPACIÓN */}
                                    {listaCategorias
                                        // 1. Filtramos solo los padres (padreId es null)
                                        .filter(cat => !cat.padreId)
                                        .map(padre => {
                                            // 2. Buscamos en la lista completa las hijas de este padre
                                            const susHijas = listaCategorias.filter(h => h.padreId === padre.id);

                                            if (susHijas.length > 0) {
                                                // SI TIENE HIJAS: Usamos OPTGROUP (Título en negrita, no seleccionable)
                                                return (
                                                    <optgroup key={padre.id} label={padre.nombre}>
                                                        {susHijas.map(hija => (
                                                            <option key={hija.external} value={hija.external}>
                                                                {hija.nombre}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                );
                                            } else {
                                                // SI NO TIENE HIJAS: Usamos OPTION (Seleccionable normal)
                                                return (
                                                    <option key={padre.external} value={padre.external}>
                                                        {padre.nombre}
                                                    </option>
                                                );
                                            }
                                        })
                                    }
                                </select>
                            </div>

                            <div>
                                <label className="label-text">Parroquia</label>
                                <select required className="input-field" value={form.parroquia_external} onChange={(e) => setForm({ ...form, parroquia_external: e.target.value })}>
                                    <option value="">-- Seleccionar --</option>
                                    {listaParroquias.map((p) => <option key={p.external} value={p.external}>{p.nombre}</option>)}
                                </select>
                            </div>

                            {/* HORARIOS */}
                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="label-text mb-2 block font-semibold text-slate-600">Configuración de Horario</label>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Desde</span>
                                        <select className="w-full p-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-teal-500" value={schedule.diaInicio} onChange={(e) => setSchedule({ ...schedule, diaInicio: e.target.value })}>
                                            {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Hasta</span>
                                        <select className="w-full p-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-teal-500" value={schedule.diaFin} onChange={(e) => setSchedule({ ...schedule, diaFin: e.target.value })}>
                                            <option value="">-- Solo un dia --</option>
                                            {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Abre</span>
                                        <select className="w-full p-2 rounded-lg border border-slate-300 text-sm outline-none" value={schedule.horaInicio} onChange={(e) => setSchedule({ ...schedule, horaInicio: e.target.value })}>
                                            {HORAS_DIA.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Cierra</span>
                                        <select className="w-full p-2 rounded-lg border border-slate-300 text-sm outline-none" value={schedule.horaFin} onChange={(e) => setSchedule({ ...schedule, horaFin: e.target.value })}>
                                            {HORAS_DIA.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-3 text-center">
                                    <span className="text-xs text-slate-500">Resultado: </span>
                                    <span className="text-sm font-medium text-teal-700 bg-teal-100 px-2 py-1 rounded">{form.horario || "Selecciona horario..."}</span>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                                    <MapaSelector position={[form.latitud, form.longitud]} setForm={setForm} />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="label-text">Descripción</label>
                                <textarea required rows={3} className="input-field resize-none" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" disabled={loading || uploading} className="w-full py-3 rounded-xl text-white font-bold bg-teal-600 hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/30">
                                    {loading ? 'Guardando...' : 'Guardar Lugar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}