"use client";

import { useEffect, useState } from "react";

// Estructura de los productos de db.json
interface Producto {
  id: number | string;
  titulo: string;
  precio: number;
  unidad: string;
  imagen: string;
}

// Estructura de cada elemento guardado en el carrito
interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar productos desde json-server
  useEffect(() => {
    fetch("http://localhost:4000/productos")
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProductos(datos);

        setCargando(false);
      })
      .catch((error) => {
        console.log("Error al cargar productos:", error);

        setCargando(false);
      });
  }, []);

  // Agregar un producto al carrito
  const agregarAlCarrito = (producto: Producto) => {
    // Obtener carrito guardado anteriormente
    const carritoGuardado = localStorage.getItem("carrito");

    let carrito: ItemCarrito[] = [];

    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
    }

    // Revisar si el producto ya existe
    const productoExistente = carrito.find(
      (item) => item.producto.id === producto.id,
    );

    if (productoExistente) {
      // Si ya estaba en el carrito aumentamos la cantidad
      carrito = carrito.map((item) => {
        if (item.producto.id === producto.id) {
          return {
            ...item,
            cantidad: item.cantidad + 1,
          };
        }

        return item;
      });
    } else {
      // Si no existía lo agregamos con cantidad 1
      carrito.push({
        producto: producto,
        cantidad: 1,
      });
    }

    // Guardar nuevamente en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(`${producto.titulo} fue agregado al carrito`);
  };

  return (
    <main className="productos-page">
      <div className="container py-5">
        {/* ENCABEZADO */}

        <div className="cabecera-productos">
          <h1 className="titulo-productos">Productos BECS</h1>

          <p className="subtitulo-productos">
            Conoce nuestros productos y agrega tus favoritos al carrito
          </p>
        </div>

        {/* TÍTULO DE SECCIÓN */}

        <div className="encabezado-seccion">
          <div>
            <h2 className="seccion-titulo">Nuestros productos</h2>

            <p className="seccion-descripcion">
              Productos disponibles en nuestra tienda
            </p>
          </div>

          {!cargando && (
            <span className="contador-productos">
              {productos.length} productos
            </span>
          )}
        </div>

        {/* PRODUCTOS */}

        {cargando ? (
          <div className="mensaje-productos">
            <p className="mb-0">Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="mensaje-productos">
            <p className="text-danger mb-1">
              No se pudieron cargar los productos.
            </p>

            <small className="text-muted">
              Revisa que json-server esté funcionando en el puerto 4000.
            </small>
          </div>
        ) : (
          <div className="row g-4">
            {productos.map((producto) => (
              <div
                className="col-12 col-sm-6 col-md-4 col-lg-3"
                key={producto.id}
              >
                <div className="card producto-card h-100">
                  {/* IMAGEN */}

                  <img
                    src={producto.imagen}
                    className="producto-imagen"
                    alt={producto.titulo}
                  />

                  {/* INFORMACIÓN */}

                  <div className="card-body d-flex flex-column">
                    <h5 className="producto-nombre">{producto.titulo}</h5>

                    <p className="producto-precio">
                      ${producto.precio.toLocaleString("es-CL")}
                      <span className="producto-unidad">
                        {" "}
                        x {producto.unidad}
                      </span>
                    </p>

                    <button
                      className="btn btn-becs mt-auto w-100"
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
