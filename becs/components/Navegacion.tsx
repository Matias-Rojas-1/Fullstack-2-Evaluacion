"use client";

/* Barra de navegación: muestra solo las opciones que corresponden
 * al rol del usuario conectado (según la pauta de evaluación).
 *  - Sin sesión / Cliente: tienda (productos y carrito)
 *  - Vendedor: solo su panel (productos y pedidos)
 *  - Administrador: su panel completo */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cerrarSesion, useSesion } from "@/lib/api";

export default function Navegacion() {
  const { sesion, lista } = useSesion();
  const router = useRouter();

  function salir() {
    cerrarSesion();
    router.push("/login");
  }

  const esPersonal = sesion?.esAdmin || sesion?.esVendedor;

  return (
    <div className="navbar-nav ms-auto align-items-lg-center">
      <Link className="nav-link" href="/">
        🏠 Inicio
      </Link>

      {/* Opciones de la tienda: visitantes y clientes */}
      {!esPersonal && (
        <>
          <Link className="nav-link" href="/productos">
            🛍️ Productos
          </Link>
          <Link className="nav-link" href="/carrito">
            🛒 Carrito
          </Link>
        </>
      )}

      {sesion?.esAdmin && (
        <Link className="nav-link" href="/admin">
          🛠️ Panel administrador
        </Link>
      )}

      {sesion?.esVendedor && (
        <Link className="nav-link" href="/vendedor">
          🧾 Panel vendedor
        </Link>
      )}

      {/* Mientras se lee la sesión (hidratación) no se muestran botones de cuenta */}
      {lista && !sesion && (
        <>
          <Link className="nav-link" href="/registro">
            👤 Registro
          </Link>
          <Link className="nav-link" href="/login">
            🔑 Login
          </Link>
        </>
      )}

      {!esPersonal && (
        <Link className="nav-link" href="/tests">
          🧪 Pruebas QUnit
        </Link>
      )}

      <a
        className="nav-link"
        href="https://maps.app.goo.gl/oVSXJAqgXjCdLjFg6"
        target="_blank"
        rel="noreferrer"
      >
        📍 Ubicación
      </a>

      {sesion && (
        <span className="d-flex align-items-center gap-2 ms-lg-2">
          <span className="nav-link usuario-conectado" title={sesion.correo}>
            👋 {sesion.usuario}
            <span className="badge-rol">
              {sesion.esAdmin ? "Admin" : sesion.esVendedor ? "Vendedor" : "Cliente"}
            </span>
          </span>
          <button type="button" className="btn btn-sm btn-outline-light" onClick={salir}>
            Cerrar sesión
          </button>
        </span>
      )}
    </div>
  );
}
