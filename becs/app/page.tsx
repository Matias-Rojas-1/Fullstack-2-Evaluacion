import Link from "next/link";

export default function InicioPage() {
  return (
    <>
      {/* ===================================== */}
      {/* CARRUSEL */}
      {/* ===================================== */}

      <section className="inicio-carrusel">
        <div
          id="carruselInicio"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3500"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="/img/japones.jpeg"
                className="d-block w-100"
                alt="Maní japonés merkén"
              />
            </div>

            <div className="carousel-item">
              <img
                src="/img/pistachos.jpeg"
                className="d-block w-100"
                alt="Pistachos"
              />
            </div>

            <div className="carousel-item">
              <img
                src="/img/mani.jpeg"
                className="d-block w-100"
                alt="Maní sin sal"
              />
            </div>
          </div>

          {/* FLECHA ANTERIOR */}

          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carruselInicio"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">Anterior</span>
          </button>

          {/* FLECHA SIGUIENTE */}

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carruselInicio"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </section>

      {/* ===================================== */}
      {/* INFORMACIÓN DE LA TIENDA */}
      {/* ===================================== */}

      <section className="inicio-informacion">
        <h1 id="infoLocal">BECS Frutos Secos</h1>

        <p id="resumenTienda">
          Somos una tienda familiar ubicada en Maipú dedicada a la venta de
          frutos secos, productos deshidratados, condimentos, mieles y otros
          productos a granel.
        </p>
      </section>

      {/* ===================================== */}
      {/* CATEGORÍAS */}
      {/* ===================================== */}

      <section className="categorias-inicio">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="titulo-categorias">Explora nuestras categorías</h2>

            <p className="subtitulo-categorias">
              Encuentra rápidamente los productos que buscas
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* FRUTOS SECOS */}

            <div className="col-6 col-md-3">
              <Link
                href="/productos?categoria=Frutos secos"
                className="categoria-card"
              >
                <div className="categoria-icono">🥜</div>

                <h5>Frutos secos</h5>
              </Link>
            </div>

            {/* DESHIDRATADOS */}

            <div className="col-6 col-md-3">
              <Link
                href="/productos?categoria=Deshidratados"
                className="categoria-card"
              >
                <div className="categoria-icono">🍇</div>

                <h5>Deshidratados</h5>
              </Link>
            </div>

            {/* CONDIMENTOS */}

            <div className="col-6 col-md-3">
              <Link
                href="/productos?categoria=Condimentos"
                className="categoria-card"
              >
                <div className="categoria-icono">🌿</div>

                <h5>Condimentos</h5>
              </Link>
            </div>

            {/* MIELES */}

            <div className="col-6 col-md-3">
              <Link
                href="/productos?categoria=Mieles"
                className="categoria-card"
              >
                <div className="categoria-icono">🍯</div>

                <h5>Mieles</h5>
              </Link>
            </div>
          </div>

          {/* BOTÓN PARA VER TODOS */}

          <div className="text-center mt-4">
            <Link href="/productos" className="btn btn-becs">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* UBICACIÓN */}
      {/* ===================================== */}

      <section id="ubicacion">
        <h2 id="tituloUbicacion">Nuestra ubicación</h2>

        <div className="ubicacion">
          <div id="mapaBECS">
            <iframe
              src="https://www.google.com/maps?q=Maipu,Santiago,Chile&output=embed"
              width="700"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
              title="Ubicación BECS"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
