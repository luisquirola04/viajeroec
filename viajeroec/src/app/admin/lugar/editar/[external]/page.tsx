"use client";

import { useState, useEffect, use } from 'react'; // Agregamos 'use'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Sidebar from "@/components/Sidebar";
import dynamic from 'next/dynamic';
import { listarLugarPorEditar, editarLugar } from '@/hooks/ServiceLugar';
import { listarCategoria } from '@/hooks/ServiceCategoria';
import { listarParroquia } from '@/hooks/ServiceParroquia';

const MapaSelector = dynamic(() => import('@/components/MapaSelector'), {
    ssr: false,
    loading: () => <p className="text-center p-10 bg-slate-100 text-slate-400">Cargando mapa...</p>
});

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HORAS_DIA = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

// Definimos los tipos si usas TypeScript, si no, igual funciona en JS
export default function EditarLugarPage({ params }) {
    // 1. NEXT.JS 15: Desempaquetamos los params usando 'use'
    const { external } = use(params);

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [multimedia, setMultimedia] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [listaParroquias, setListaParroquias] = useState([]);
    const [token, setToken] = useState(null);

    const [schedule, setSchedule] = useState({
        diaInicio: 'Lunes',
        diaFin: 'Viernes',
        horaInicio: '08:00',
        horaFin: '17:00'
    });

    const [form, setForm] = useState({
        nombre: '', descripcion: '', horario: '',
        latitud: -3.99313, longitud: -79.20422,
        categoria_external: '', parroquia_external: ''
    });

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    // Obtener Token
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setToken(sessionStorage.getItem("token"));
        }
    }, []);

    // Cargar datos usando 'external' que ya obtuvimos con 'use(params)'
    // Cargar datos usando 'external' que ya obtuvimos con 'use(params)'
    // Cargar datos usando 'external' que ya obtuvimos con 'use(params)'
    useEffect(() => {
        if (!token || !external) return;

        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [resCat, resParr, resLugar] = await Promise.all([
                    listarCategoria(token),
                    listarParroquia(token),
                    listarLugarPorEditar(token, external)
                ]);

                if (resCat?.categorias) setListaCategorias(resCat.categorias);
                if (resParr?.parroquias) setListaParroquias(resParr.parroquias);

               
                if (resLugar && resLugar.data) {
                    
                    const d = resLugar.data; 

                    console.log("Datos para cargar en form:", d);

                    const imagenesUrls = d.Multimedia ? d.Multimedia.map(m => m.url) : [];
                    setMultimedia(imagenesUrls);

                    
                    parsearHorario(d.horario);
              
                    const latDb = parseFloat(d.latitud);
                    const lngDb = parseFloat(d.longitud);
                    
                    const latFinal = isNaN(latDb) ? -3.99313 : latDb;
                    const lngFinal = isNaN(lngDb) ? -79.20422 : lngDb;

                    setForm({
                        nombre: d.nombre,             
                        descripcion: d.descripcion,   
                        horario: d.horario,           
                        latitud: latFinal,
                        longitud: lngFinal,
                        
                        
                        categoria_external: d.Categoria?.external || "", 
                        parroquia_external: d.Parroquia?.external || ""
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [token, external]);

    const parsearHorario = (horarioString) => {
        if (!horarioString) return;
        try {
            const partes = horarioString.split(' de ');
            if (partes.length === 2) {
                const diasPart = partes[0];
                const horasPart = partes[1];

                const [hInicio, hFin] = horasPart.split(' a ');

                if (diasPart.includes(' a ')) {
                    const [dInicio, dFin] = diasPart.split(' a ');
                    setSchedule({ diaInicio: dInicio, diaFin: dFin, horaInicio: hInicio, horaFin: hFin });
                } else {
                    setSchedule({ diaInicio: diasPart, diaFin: '', horaInicio: hInicio, horaFin: hFin });
                }
            }
        } catch (e) { console.log("Error parseando horario"); }
    };

    useEffect(() => {
        if (loading) return;
        let textoHorario = "";
        if (schedule.diaFin === "") {
            textoHorario = `${schedule.diaInicio} de ${schedule.horaInicio} a ${schedule.horaFin}`;
        } else {
            textoHorario = `${schedule.diaInicio} a ${schedule.diaFin} de ${schedule.horaInicio} a ${schedule.horaFin}`;
        }
        setForm(prev => ({ ...prev, horario: textoHorario }));
    }, [schedule, loading]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (multimedia.length === 0) return Swal.fire('Falta multimedia', 'Sube al menos una foto', 'warning');
        if (!form.categoria_external || !form.parroquia_external) return Swal.fire('Datos incompletos', 'Selecciona categoría y parroquia', 'warning');

        const dataToSend = {
            ...form,
            imagenes: multimedia,
            externalLugar: external, // Usamos la variable external obtenida de use(params)
            externalCategoria: form.categoria_external,
            externalParroquia: form.parroquia_external
        };

        try {
            setSending(true);
            const res = await editarLugar(token, dataToSend);
            console.log(res);
            if (res && res.code === 200) {
                Swal.fire({ icon: 'success', title: 'Actualizado', text: res.msj }).then(() => {
                    router.push('/admin/lugar/lista'); // Ajusta la ruta a donde quieras volver
                });
            } else {
                Swal.fire('Error', res.msj, 'error');
            }
        } catch (error) { Swal.fire('Error', 'Fallo de conexión', 'error'); }
        finally { setSending(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando datos...</div>;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                    {/* IZQUIERDA: GALERÍA */}
                    <div className="md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Galería Multimedia</h3>
                        <label className="border-2 border-dashed rounded-xl w-full h-32 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-teal-50 mb-4 transition-colors">
                            <span className="text-slate-500 font-medium">{uploading ? 'Subiendo...' : 'Agregar Fotos'}</span>
                            <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                        <div className="flex-1 overflow-y-auto max-h-[400px]">
                            <div className="grid grid-cols-2 gap-2">
                                {multimedia.map((url, i) => (
                                    <div key={i} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: FORMULARIO */}
                    <div className="md:w-2/3 p-8 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Lugar</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="label-text">Nombre</label>
                                <input type="text" required className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="label-text">Categoría</label>
                                <select required className="input-field" value={form.categoria_external} onChange={(e) => setForm({ ...form, categoria_external: e.target.value })}>
                                    <option value="">Seleccionar</option>
                                    {listaCategorias.map((c) => <option key={c.external} value={c.external}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Parroquia</label>
                                <select required className="input-field" value={form.parroquia_external} onChange={(e) => setForm({ ...form, parroquia_external: e.target.value })}>
                                    <option value="">Seleccionar</option>
                                    {listaParroquias.map((p) => <option key={p.external} value={p.external}>{p.nombre}</option>)}
                                </select>
                            </div>

                            {/* HORARIO */}
                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="label-text mb-2 block font-semibold text-slate-600">Horario</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <select className="input-field text-sm" value={schedule.diaInicio} onChange={(e) => setSchedule({ ...schedule, diaInicio: e.target.value })}>
                                        {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                                    </select>
                                    <select className="input-field text-sm" value={schedule.diaFin} onChange={(e) => setSchedule({ ...schedule, diaFin: e.target.value })}>
                                        <option value="">-- Solo un dia --</option>
                                        {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                                    </select>
                                    <select className="input-field text-sm" value={schedule.horaInicio} onChange={(e) => setSchedule({ ...schedule, horaInicio: e.target.value })}>
                                        {HORAS_DIA.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                                    </select>
                                    <select className="input-field text-sm" value={schedule.horaFin} onChange={(e) => setSchedule({ ...schedule, horaFin: e.target.value })}>
                                        {HORAS_DIA.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                                    </select>
                                </div>
                                <div className="text-center mt-2 text-sm text-teal-700">{form.horario}</div>
                            </div>

                            {/* MAPA */}
                            <div className="md:col-span-2">
                                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                                    {!loading && <MapaSelector position={[form.latitud, form.longitud]} setForm={setForm} />}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="label-text">Descripción</label>
                                <textarea required rows={3} className="input-field resize-none" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" disabled={sending || uploading} className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700">
                                    {sending ? 'Guardando...' : 'Actualizar Lugar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}