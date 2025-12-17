"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapaVisualizador({ lugares }) {
    
    // Fix Iconos Leaflet
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Centro por defecto (Loja) si no hay lugares
    const center = [-3.99313, -79.20422];

    return (
        <MapContainer 
            center={center} 
            zoom={12} 
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; OSM'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {lugares.map((lugar: any) => (
                <Marker key={lugar.external} position={[lugar.latitud, lugar.longitud]}>
                    <Popup>
                        <div className="text-center">
                            <strong className="text-sm block mb-1">{lugar.nombre}</strong>
                            <span className="text-xs text-slate-500">{lugar.Categoria?.nombre}</span>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}