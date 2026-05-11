"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Globe,
  PlusCircle,
  List,
  LogOut,
  Users 
} from "lucide-react";
import { validarToken } from "@/hooks/ServiceAuth"; 

const menuItems = [
  {
    title: "Países",
    icon: Globe,
    children: [
      { name: "Crear País", href: "/admin/pais/nuevo", icon: PlusCircle },
      { name: "Ver Países", href: "/admin/pais/lista", icon: List },
    ],
  },
  {
    title: "Provincias",
    icon: Globe,
    children: [
      { name: "Crear Provincia", href: "/admin/provincia/nuevo", icon: PlusCircle },
      { name: "Ver Provincias", href: "/admin/provincia/lista", icon: List },
    ],
  },
  {
    title: "Cantones",
    icon: Globe,
    children: [
      { name: "Crear Cantón", href: "/admin/canton/nuevo", icon: PlusCircle },
      { name: "Ver Cantones", href: "/admin/canton/lista", icon: List },
    ],
  },
  {
    title: "Parroquias",
    icon: Globe,
    children: [
      { name: "Crear Parroquia", href: "/admin/parroquia/nuevo", icon: PlusCircle },
      { name: "Ver Parroquias", href: "/admin/parroquia/lista", icon: List },
    ],
  },
  {
    title: "Categorias",
    icon: Globe,
    children: [
      { name: "Crear Categoría", href: "/admin/categoria/nuevo", icon: PlusCircle },
      { name: "Ver Categorías", href: "/admin/categoria/lista", icon: List },
    ],
  },
  {
    title: "Lugares",
    icon: Globe,
    children: [
      { name: "Crear Lugar", href: "/admin/lugar/nuevo", icon: PlusCircle },
      { name: "Ver Lugares", href: "/admin/lugar/lista", icon: List },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [initials, setInitials] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true); 

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  useEffect(() => {
    const checkSession = async () => {
      const name = sessionStorage.getItem("user");
      const token = sessionStorage.getItem("token"); 
      const role = sessionStorage.getItem("role"); 

      console.log(role);
      
      if (!name || !token) {
        handleLogout();
        return;
      }

      // Asignar el rol amigable
      if (role === "ADMIN") {
        setUserRole("Administrador");
      } else if (role === "USER") {
        setUserRole("Usuario");
      } else {
        setUserRole(role || "Usuario");
      }

      // 3. Validar token contra el backend
      try {
        const respuesta = await validarToken(token);
        
        if (respuesta && respuesta.code === 200) {
            setUserName(name);
            setInitials(
                name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            );
        } else {
            console.warn("Sesión inválida detectada por el servidor");
            handleLogout();
        }
      } catch (error) {
        console.error("Error validando sesión:", error);
        handleLogout();
      } finally {
        setIsValidating(false);
      }
    };

    checkSession();
  }, [router]); // Se ejecuta al montar el Sidebar

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  if (isValidating || !userName) return null;

  return (
    <aside className="h-screen sticky top-0 border-r border-border bg-background flex flex-col hidden md:flex">

      <div className="flex items-center justify-center px-6 py-4 border-b border-border">
        <span className="text-2xl font-extrabold tracking-widest text-primary uppercase">
          viajero<span className="text-foreground">Ec</span>
        </span>
      </div>

      {/* =========================
          NAV
      ========================= */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        
        {/* Botón de Administradores con el mismo estilo del menú principal */}
        <Link
          href="/admin/admin/lista"
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
            pathname.startsWith("/admin/admin")
              ? "bg-primary/10 text-primary" // Estilo si está activo
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users size={20} />
          Administradores
        </Link>

        {/* Separador opcional para dividir del resto del menú */}
        <div className="h-px bg-border my-2 mx-2"></div>

        {menuItems.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = openMenu === section.title;

          return (
            <div key={section.title}>
              {/* CABECERA */}
              <button
                onClick={() => toggleMenu(section.title)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <div className="flex items-center gap-3">
                  <SectionIcon size={20} />
                  {section.title}
                </div>
                <span
                  className={`text-xs transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </button>

              {/* SUBMENÚ */}
              {isOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.children.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <ItemIcon size={16} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* =========================
          FOOTER
      ========================= */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex flex-col gap-4">
          
          {/* Usuario y Rol */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
            
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {userName}
              </span>
              <span className="text-xs text-muted-foreground truncate uppercase font-semibold tracking-wider">
                {userRole}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
        
      </div>
    </aside>
  );
}