import type { Metadata } from "next";
import "./globals.css"; // Aquí ya están tus estilos de estilo.css

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
        {/* Bootstrap CSS por CDN (soluciona el error de módulo no encontrado) */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        {/* BARRA DE NAVEGACION */}
        <nav className="navbar navbar-expand-lg navbar-becs sticky-top" data-bs-theme="dark">
          <div className="container">
            <a className="navbar-brand" href="/">
              <img src="/img/logo.jpeg" alt="Logo" width="70" height="70" />
            </a>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav ms-auto">
                <a className="nav-link" href="/">🏠 Inicio</a>
                <a className="nav-link" href="/productos">🛍️ Productos & Carrito</a>
                <a className="nav-link" href="/registro">👤 Registro</a>
                <a className="nav-link" href="/login">🔑 Login</a>
                <a className="nav-link" href="/tests">🧪 Pruebas QUnit</a>
                <a className="nav-link" href="https://maps.app.goo.gl/oVSXJAqgXjCdLjFg6" target="_blank" rel="noreferrer">📍 Ubicación</a>
              </div>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        {/* PIE DE PAGINA */}
        <footer>
          <div id="barra_footer">
            <a href="https://wa.me/56944542829" target="_blank" id="item_footer1" rel="noreferrer">
              <i className="fa-brands fa-whatsapp" id="logo_whatsapp"></i>
              <span className="textoFooter">+56944542829</span>
            </a>
            <div id="separador_footer1"></div>
            <a href="https://www.instagram.com/becs.frutossecos/" target="_blank" id="item_footer2" rel="noreferrer">
              <i className="fa-brands fa-instagram" id="logo_instagram"></i>
              <span className="textoFooter">BECS Frutos Secos</span>
            </a>
          </div>
        </footer>

        {/* Bootstrap JS Bundle */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}