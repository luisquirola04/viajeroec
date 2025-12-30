"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


export default function MapaVisualizador({ lugares, onSelect }) {
    

    useEffect(() => {
       
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

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
            
            {lugares.map((lugar) => (
                <Marker 
                    key={lugar.external} 
                    position={[lugar.latitud, lugar.longitud]}
                    
                   
                    eventHandlers={{
                        click: () => {
                            
                            if (onSelect) {
                                onSelect(lugar.external);
                            }
                        },
                    }}
                >
                    <Popup>
                        <div className="text-center">
                            <strong className="text-sm block mb-1">{lugar.nombre}</strong>
                            <span className="text-xs text-slate-500">{lugar.Categoria?.nombre}</span>
                            
                            {/* Opcional: Un texto visual para indicar que se seleccionó */}
                            <div className="mt-2 text-[10px] text-teal-600 font-bold border-t pt-1">
                                Seleccionado
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}