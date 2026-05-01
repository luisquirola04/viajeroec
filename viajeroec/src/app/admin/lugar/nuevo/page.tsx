"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Sidebar from "@/components/Sidebar";
import dynamic from 'next/dynamic';
import { registroLugar } from '@/hooks/ServiceLugar';
import { listarCategoria, listarCategoriasHijas } from '@/hooks/ServiceCategoria';
import { listarParroquia } from '@/hooks/ServiceParroquia';
import { useRouter } from 'next/navigation';

// --- NUEVO IMPORT ---
import BuscadorOSM from "@/components/BuscadorOSM";

// Carga dinámica del mapa
const MapaSelector = dynamic(() => import('@/components/MapaSelector'), {
    ssr: false,
    loading: () => <p className="text-center p-10 bg-slate-100 text-slate-400">Cargando mapa...</p>
});

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HORAS_DIA = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function CrearLugarForm() {
    const [loading, setLoading] = useState(false);
    
    // --- ESTADO MULTIMEDIA UNIFICADO ---
    // Guardará objetos: { type: 'link' | 'file', content: string | File, preview: string }
    const [mediaItems, setMediaItems] = useState([]); 
    const [linkInput, setLinkInput] = useState('');
    
    const [listaCategorias, setListaCategorias] = useState([]); 
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setToken(sessionStorage.getItem("token"));
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        const cargarDatos = async () => {
            try {
                const [resCat, resParr] = await Promise.all([listarCategoria(token), listarParroquia(token)]);
                let todasLasCategorias = [];
                if (resCat && resCat.categorias) {
                    const padres = resCat.categorias;
                    todasLasCategorias = [...padres];
                    const promesasHijas = padres.map(padre => listarCategoriasHijas(token, padre.external));
                    const resultadosHijas = await Promise.all(promesasHijas);
                    resultadosHijas.forEach(res => {
                        if (res && res.categorias && res.categorias.length > 0) todasLasCategorias = [...todasLasCategorias, ...res.categorias];
                    });
                }
                setListaCategorias(todasLasCategorias);
                if (resParr?.parroquias) setListaParroquias(resParr.parroquias);
            } catch (error) { console.error("Error cargando datos:", error); }
        };
        cargarDatos();
    }, [token]);

    useEffect(() => {
        let textoHorario = schedule.diaFin === "" 
            ? `${schedule.diaInicio} de ${schedule.horaInicio} a ${schedule.horaFin}`
            : `${schedule.diaInicio} a ${schedule.diaFin} de ${schedule.horaInicio} a ${schedule.horaFin}`;
        setForm(prev => ({ ...prev, horario: textoHorario }));
    }, [schedule]);


    // --- 1. AÑADIR ARCHIVO LOCAL (SOLO PREVISUALIZACIÓN, AÚN NO SE SUBE) ---
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (mediaItems.length + files.length > 4) {
            Swal.fire('Límite excedido', 'Solo puedes añadir un máximo de 4 elementos multimedia por lugar.', 'warning');
            return;
        }

        const newItems = files.map(file => ({
            type: 'file',
            content: file, // Guardamos el archivo original para subirlo al final
            preview: URL.createObjectURL(file) // Creamos un enlace local temporal para mostrarlo
        }));

        setMediaItems(prev => [...prev, ...newItems]);
        e.target.value = ''; // Limpiar el input
    };

    // --- 2. AÑADIR URL EXTERNA ---
    const handleAddLink = () => {
        if (mediaItems.length >= 4) {
            return Swal.fire('Límite alcanzado', 'Ya has alcanzado el máximo de 4 elementos.', 'warning');
        }
        if (!linkInput.trim()) return;
        
        try {
            new URL(linkInput);
            setMediaItems(prev => [...prev, { 
                type: 'link', 
                content: linkInput.trim(), 
                preview: linkInput.trim() 
            }]);
            setLinkInput(''); 
        } catch (_) {
            Swal.fire('URL Inválida', 'Por favor ingresa un enlace válido (http:// o https://)', 'warning');
        }
    };

    // --- 3. QUITAR ELEMENTO ---
    const handleRemoveItem = (indexToRemove) => {
        setMediaItems(prev => {
            const newArray = [...prev];
            const item = newArray[indexToRemove];
            // Si es un archivo local, liberamos la memoria de la previsualización
            if (item.type === 'file') URL.revokeObjectURL(item.preview);
            newArray.splice(indexToRemove, 1);
            return newArray;
        });
    };

    const obtenerMiniatura = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            const id = (match && match[2].length === 11) ? match[2] : null;
            return id ? `https://img.youtube.com/vi/${id}/0.jpg` : url;
        }
        return url;
    };

    // --- FUNCIÓN PARA RECIBIR COORDENADAS DEL BUSCADOR OSM ---
    const handleUbicacionSeleccionada = (lat, lon) => {
        setForm(prev => ({
            ...prev,
            latitud: lat,
            longitud: lon
        }));
    };

    // --- ENVIAR FORMULARIO (AQUÍ OCURRE LA MAGIA DE CLOUDINARY) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mediaItems.length === 0) return Swal.fire('Falta multimedia', 'Añade al menos una foto o enlace (Máximo 4).', 'warning');
        if (!form.categoria_external || !form.parroquia_external) return Swal.fire('Datos incompletos', 'Selecciona categoría y parroquia', 'warning');

        setLoading(true);

        try {
            const urlsFinales = [];

            // PASO 1: Subir solo los que son archivos a Cloudinary
            for (const item of mediaItems) {
                if (item.type === 'link') {
                    urlsFinales.push(item.content);
                } else if (item.type === 'file') {
                    const formData = new FormData();
                    formData.append('file', item.content);
                    formData.append('upload_preset', UPLOAD_PRESET);
                    
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: formData });
                    if (!res.ok) throw new Error("Fallo upload");
                    const data = await res.json();
                    
                    // ✅ AHORA GUARDAMOS LA URL PURA Y ORIGINAL
                    urlsFinales.push(data.secure_url);
                }
            }

            // PASO 2: Enviar los datos listos al backend
            const dataToSend = {
                ...form,
                imagenes: urlsFinales,
                externalCategoria: form.categoria_external,
                externalParroquia: form.parroquia_external
            };

            const res = await registroLugar(token, dataToSend);
            
            if (res && res.code === 200) {
                Swal.fire({ icon: 'success', title: '¡Lugar Creado!', text: res.msj });
                setForm({ nombre: '', descripcion: '', horario: '', latitud: -3.99313, longitud: -79.20422, categoria_external: '', parroquia_external: '' });
                setMediaItems([]);
                setLinkInput('');
                setSchedule({ diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00' });
                router.push('/admin/lugar/lista')
            } else {
                Swal.fire('Error', res.msj, 'error');
            }
        } catch (error) { 
            Swal.fire('Error', 'Hubo un problema procesando los archivos o conectando con el servidor.', 'error'); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                    {/* IZQUIERDA: GALERÍA Y ENLACES */}
                    <div className="md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-700">1. Galería Multimedia</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${mediaItems.length >= 4 ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-700'}`}>
                                {mediaItems.length}/4
                            </span>
                        </div>
                        
                        {/* INPUT PARA ENLACES */}
                        <div className="mb-4">
                            <label className="text-sm text-slate-600 font-medium mb-1 block">Añadir enlace (YouTube / URL)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-teal-500" 
                                    placeholder="https://www.youtube.com/..." 
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    disabled={mediaItems.length >= 4}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddLink}
                                    disabled={mediaItems.length >= 4}
                                    className="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50"
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <hr className="flex-1 border-slate-300" />
                            <span className="text-xs text-slate-400 font-bold uppercase">O subir archivo</span>
                            <hr className="flex-1 border-slate-300" />
                        </div>

                        {/* SUBIDA DE ARCHIVOS LOCALES */}
                        <label className={`border-2 border-dashed rounded-xl w-full h-24 flex flex-col items-center justify-center transition-all ${mediaItems.length >= 4 ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:bg-teal-50 cursor-pointer mb-4'}`}>
                            <span className="text-slate-500 font-medium">Seleccionar Fotos/Videos</span>
                            <input 
                                type="file" 
                                multiple 
                                className="hidden" 
                                accept="image/*,video/*" 
                                onChange={handleFileSelect} 
                                disabled={mediaItems.length >= 4} 
                            />
                        </label>
                        
                        {/* PREVISUALIZACIÓN */}
                        <div className="flex-1 overflow-y-auto max-h-[400px] mt-4">
                            <div className="grid grid-cols-2 gap-2">
                                {mediaItems.map((item, i) => {
                                    const isYoutube = item.preview.includes('youtube.com') || item.preview.includes('youtu.be');
                                    return (
                                        <div key={i} className="relative aspect-square bg-gray-200 rounded overflow-hidden group border border-slate-200">
                                            <img src={obtenerMiniatura(item.preview)} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                                            {isYoutube && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">YOUTUBE</span>
                                                </div>
                                            )}
                                            {item.type === 'file' && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                                                    Archivo Local
                                                </div>
                                            )}
                                            <button type="button" onClick={() => handleRemoveItem(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 shadow-md">×</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: FORMULARIO Y MAPA */}
                    <div className="md:w-2/3 p-8 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Información y Ubicación</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="md:col-span-2">
                                <label className="label-text text-sm font-semibold text-slate-700">Nombre</label>
                                <input type="text" required className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-teal-500" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                            </div>

                            {/* --- SELECT DE CATEGORÍA --- */}
                            <div>
                                <label className="label-text text-sm font-semibold text-slate-700">Categoría</label>
                                <select required className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-teal-500" value={form.categoria_external} onChange={(e) => setForm({ ...form, categoria_external: e.target.value })}>
                                    <option value="">-- Seleccionar --</option>
                                    {listaCategorias.filter(cat => !cat.padreId).map(padre => {
                                        const susHijas = listaCategorias.filter(h => h.padreId === padre.id);
                                        if (susHijas.length > 0) {
                                            return (
                                                <optgroup key={padre.id} label={padre.nombre}>
                                                    {susHijas.map(hija => <option key={hija.external} value={hija.external}>{hija.nombre}</option>)}
                                                </optgroup>
                                            );
                                        } else {
                                            return <option key={padre.external} value={padre.external}>{padre.nombre}</option>;
                                        }
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="label-text text-sm font-semibold text-slate-700">Parroquia</label>
                                <select required className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-teal-500" value={form.parroquia_external} onChange={(e) => setForm({ ...form, parroquia_external: e.target.value })}>
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

                            {/* COORDENADAS MANUALES Y MAPA */}
                            <div className="md:col-span-2">
                                <label className="label-text mb-2 block font-semibold text-slate-600">Ubicación en el Mapa</label>
                                
                                {/* BUSCADOR OSM INTEGRADO */}
                                <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200 relative z-[400]">
                                    <span className="text-xs text-slate-500 font-bold uppercase mb-2 block">
                                        1. Busca una dirección o punto de interés
                                    </span>
                                    <BuscadorOSM onUbicacionSeleccionada={handleUbicacionSeleccionada} />
                                </div>

                                <span className="text-xs text-slate-500 font-bold uppercase mb-2 block">
                                    2. Ajusta las coordenadas si es necesario
                                </span>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Latitud</span>
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-teal-500 bg-white" 
                                            value={form.latitud} 
                                            onChange={(e) => setForm({ ...form, latitud: e.target.value })} 
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Longitud</span>
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-teal-500 bg-white" 
                                            value={form.longitud} 
                                            onChange={(e) => setForm({ ...form, longitud: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
                                    <MapaSelector position={[parseFloat(form.latitud) || 0, parseFloat(form.longitud) || 0]} setForm={setForm} />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">* Puedes mover el pin en el mapa, o editar los números de las cajas manualmente para mayor precisión.</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="label-text text-sm font-semibold text-slate-700">Descripción</label>
                                <textarea required rows={3} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-teal-500 resize-none" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-bold bg-teal-600 hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {loading ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            Subiendo archivos y guardando...
                                        </>
                                    ) : 'Guardar Lugar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}