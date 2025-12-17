"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- COMPONENTES INTERNOS DEL MAPA ---

// 1. Manejador de Clics: Al hacer clic, avisa al padre (formulario)
function LocationMarker({ setForm }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setForm(prev => ({ ...prev, latitud: lat, longitud: lng }));
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null;
}

// 2. Actualizador de Vista: Si cambias los inputs numéricos, el mapa se mueve
function ChangeView({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords[0] !== 0 && coords[1] !== 0) {
            map.flyTo(coords, map.getZoom());
        }
    }, [coords, map]);
    return null;
}

// --- COMPONENTE PRINCIPAL DEL MAPA ---
export default function MapaSelector({ position, setForm }) {
    
    // Arreglo de iconos de Leaflet (Se ejecuta solo en el navegador)
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    return (
        <MapContainer 
            center={position} 
            zoom={13} 
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={position} />
            
            <LocationMarker setForm={setForm} />
            <ChangeView coords={position} />
        </MapContainer>
    );
}