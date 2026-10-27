export default function InicioPage() {
  return (
    <>
      {/* CARRUSEL */}
      <section className="inicio-carrusel">
        <div id="carruselInicio" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/img/japones.jpeg" className="d-block w-100" alt="Maní japonés merkén" />
            </div>
            <div className="carousel-item">
              <img src="/img/pistachos.jpeg" className="d-block w-100" alt="Pistachos" />
            </div>
            <div className="carousel-item">
              <img src="/img/mani.jpeg" className="d-block w-100" alt="Maní sin sal" />
            </div>
          </div>
        </div>
      </section>

      {/* INFO LOCAL */}
      <section className="inicio-informacion">
        <h2 id="infoLocal">INFORMACIÓN DEL LOCAL</h2>
        <p id="resumenTienda">
          BECS es una tienda familiar ubicada en Maipú, dedicada a la venta de frutos secos, productos a granel, deshidratados, harinas, aliños, mieles y otras variedades pensadas para el consumo diario.
        </p>
      </section>

      {/* UBICACIÓN */}
      <h1 id="tituloUbicacion">UBICACIÓN</h1>
      <section className="ubicacion">
        <div id="mapaBECS">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3328.0714809783494!2d-70.7484559!3d-33.4734897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c311c135ca27%3A0x16e72997ca0d7ac3!2sBandurria%20Azul%20585%2C%209250000%20Maip%C3%BA%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1788999679895!5m2!1ses!2scl"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </>
  );
}