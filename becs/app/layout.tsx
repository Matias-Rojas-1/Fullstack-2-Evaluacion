import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "BECS - Frutos Secos",
  description: "Tienda familiar de frutos secos en Maipú",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
      </head>

      <body>
        {/* ===================================== */}
        {/* BARRA DE NAVEGACIÓN */}
        {/* ===================================== */}

        <nav
          className="navbar navbar-expand-lg navbar-becs sticky-top"
          data-bs-theme="dark"
        >
          <div className="container">
            {/* LOGO */}

            <Link className="navbar-brand" href="/">
              <img
                src="/img/logo.jpeg"
                alt="Logo BECS"
                width="70"
                height="70"
              />
            </Link>

            {/* BOTÓN MENÚ PARA PANTALLAS PEQUEÑAS */}

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarBECS"
              aria-controls="navbarBECS"
              aria-expanded="false"
              aria-label="Abrir menú"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* OPCIONES DEL NAVBAR */}

            <div className="collapse navbar-collapse" id="navbarBECS">
              <div className="navbar-nav ms-auto">
                {/* INICIO */}

                <Link className="nav-link" href="/">
                  🏠 Inicio
                </Link>

                {/* PRODUCTOS */}

                <a className="nav-link" href="/productos">
                  🛍️ Productos
                </a>

                {/* CARRITO */}

                <a className="nav-link" href="/carrito">
                  🛒 Carrito
                </a>

                {/* REGISTRO */}

                <a className="nav-link" href="/registro">
                  👤 Registro
                </a>

                {/* LOGIN */}

                <a className="nav-link" href="/login">
                  🔑 Login
                </a>

                {/* PRUEBAS */}

                <a className="nav-link" href="/tests">
                  🧪 Pruebas QUnit
                </a>

                {/* UBICACIÓN */}

                <a
                  className="nav-link"
                  href="https://maps.app.goo.gl/oVSXJAqgXjCdLjFg6"
                  target="_blank"
                  rel="noreferrer"
                >
                  📍 Ubicación
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* ===================================== */}
        {/* CONTENIDO DE CADA PÁGINA */}
        {/* ===================================== */}

        <main>{children}</main>

        {/* ===================================== */}
        {/* PIE DE PÁGINA */}
        {/* ===================================== */}

        <footer>
          <div id="barra_footer">
            {/* WHATSAPP */}

            <a
              href="https://wa.me/56944542829"
              target="_blank"
              id="item_footer1"
              rel="noreferrer"
            >
              <i className="fa-brands fa-whatsapp" id="logo_whatsapp"></i>

              <span className="textoFooter">+56944542829</span>
            </a>

            {/* SEPARADOR */}

            <div id="separador_footer1"></div>

            {/* INSTAGRAM */}

            <a
              href="https://www.instagram.com/becs.frutossecos/"
              target="_blank"
              id="item_footer2"
              rel="noreferrer"
            >
              <i className="fa-brands fa-instagram" id="logo_instagram"></i>

              <span className="textoFooter">BECS Frutos Secos</span>
            </a>
          </div>
        </footer>

      </body>
    </html>
  );
}
