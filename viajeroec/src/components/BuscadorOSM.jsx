"use client";
import React, { useState, useEffect, useRef } from "react";

export default function BuscadorOSM({ onUbicacionSeleccionada }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  // Efecto para la búsqueda en tiempo real (Debounce)
  useEffect(() => {
    // Si la búsqueda es muy corta, limpiamos resultados y no buscamos
    if (!busqueda.trim() || busqueda.length < 3) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    // Temporizador: Espera 600ms después de que el usuario deja de escribir
    const delayDebounceFn = setTimeout(async () => {
      setBuscando(true);
      try {
        // Hacemos la petición a la API de Nominatim
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setResultados(data);
        setMostrarDropdown(true);
      } catch (error) {
        console.error("Error buscando en OSM:", error);
      } finally {
        setBuscando(false);
      }
    }, 600); 

    // Limpiamos el temporizador si el usuario sigue escribiendo
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda]);

  // Cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const seleccionarLugar = (lugar) => {
    const lat = parseFloat(lugar.lat);
    const lon = parseFloat(lugar.lon);
    
    // Pasamos los datos al formulario padre
    onUbicacionSeleccionada(lat, lon);
    
    // Formateamos el texto del input con el lugar seleccionado
    setBusqueda(lugar.display_name.split(',')[0]); // Solo el nombre principal para que no se vea tan largo
    setMostrarDropdown(false);
  };

  return (
    <div className="relative w-full z-[500]" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Ej: Parque Central Loja..."
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setMostrarDropdown(true);
          }}
          onFocus={() => {
              if (resultados.length > 0) setMostrarDropdown(true);
          }}
        />
        
        {/* Ícono de Lupa o Spinner */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {buscando ? (
                <svg className="w-5 h-5 animate-spin text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            )}
        </div>

        {/* Botón para limpiar búsqueda */}
        {busqueda && (
            <button 
                type="button"
                onClick={() => {
                    setBusqueda("");
                    setResultados([]);
                    setMostrarDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        )}
      </div>

      {/* Lista de resultados flotante */}
      {mostrarDropdown && busqueda.length >= 3 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto z-[501] animate-in fade-in slide-in-from-top-2">
          
          {!buscando && resultados.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500 text-center">
               No se encontraron resultados para "{busqueda}"
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {resultados.map((lugar) => (
                <li
                  key={lugar.place_id}
                  onClick={() => seleccionarLugar(lugar)}
                  className="px-4 py-3 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-800 cursor-pointer transition-colors flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <div className="flex flex-col">
                      <span className="font-semibold">{lugar.display_name.split(',')[0]}</span>
                      <span className="text-xs text-slate-500 line-clamp-1">{lugar.display_name.split(',').slice(1).join(',')}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}