"use client";

import { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { name?: string };
    }
  }
}

interface IconPreviewProps {
  nombre: string;
  icono: string;
  color: string;
}

export default function IconPreview({ nombre, icono, color }: IconPreviewProps) {

  useEffect(() => {
    if (!document.getElementById("ionicons-script")) {
      const script = document.createElement("script");
      script.id = "ionicons-script";
      script.type = "module";
      script.src = "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js";
      script.onerror = () => console.warn("Ionicons no pudo cargar desde CDN");
      document.body.appendChild(script);
    }
  }, []);

  const iconName = icono ? icono.trim() : '';

  return (
    <div className="mt-8 p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
      <span className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
        Vista Previa (App Móvil)
      </span>

      <div
        className="bg-white rounded-[16px] flex flex-col justify-center items-center p-[10px] shadow-sm transition-all hover:shadow-md border border-slate-100"
        style={{ width: '160px', height: '144px' }}
      >
        <div
          className="w-[60px] h-[60px] rounded-full flex justify-center items-center mb-[10px]"
          style={{ backgroundColor: `${color}26` }}
        >
          {iconName ? (
            <ion-icon
              name={iconName}
              style={{ color: color, fontSize: '32px' }}
            ></ion-icon>
          ) : (
            <span style={{ color, fontSize: '28px', lineHeight: 1 }}>?</span>
          )}
        </div>

        <span className="text-[14px] font-semibold text-[#455A64] text-center leading-tight truncate w-full px-1">
          {nombre || 'Nombre'}
        </span>

        <span className="text-[10px] px-2 py-0.5 mt-2 rounded-full font-mono text-slate-500 bg-slate-100 border border-slate-200">
          icon: {iconName || '—'}
        </span>
      </div>
    </div>
  );
}