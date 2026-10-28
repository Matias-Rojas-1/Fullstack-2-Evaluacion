"use client";

import { useEffect, useState } from "react";

// Estructura de cada producto
interface Producto {
  id: number | string;

  titulo: string;

  precio: number;

  unidad: string;

  imagen: string;

  categoria: string;
}

// Estructura de los productos guardados en el carrito
interface ItemCarrito {
  producto: Producto;

  cantidad: number;
}

export default function ProductosPage() {
  // Productos recibidos desde json-server
  const [productos, setProductos] = useState<Producto[]>([]);

  // Categoría seleccionada
const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");

// Guarda lo que el usuario escriba
const [busqueda, setBusqueda] = useState("");

// Indica si los productos todavía se están cargando
const [cargando, setCargando] = useState(true);

  // =========================================
  // CARGAR PRODUCTOS
  // =========================================

  useEffect(() => {
    // Primero revisamos si la URL contiene una categoría
    const parametros = new URLSearchParams(window.location.search);

    const categoriaUrl = parametros.get("categoria");

    if (categoriaUrl) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoriaSeleccionada(categoriaUrl);
    }

    // Obtener productos desde json-server
    fetch("http://localhost:4000/productos")
      .then((respuesta) => respuesta.json())

      .then((datos) => {
        setProductos(datos);

        setCargando(false);
      })

      .catch((error) => {
        console.log("Error al cargar productos:", error);

        setCargando(false);
      });
  }, []);

  // =========================================
  // AGREGAR AL CARRITO
  // =========================================

  const agregarAlCarrito = (producto: Producto) => {
    // Recuperar carrito anterior
    const carritoGuardado = localStorage.getItem("carrito");

    let carrito: ItemCarrito[] = [];

    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
    }

    // Buscar si el producto ya está agregado
    const productoExistente = carrito.find(
      (item) => item.producto.id === producto.id,
    );

    if (productoExistente) {
      // Si ya existe aumentamos su cantidad
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
      // Si no existe lo agregamos por primera vez
      carrito.push({
        producto: producto,

        cantidad: 1,
      });
    }

    // Guardamos carrito actualizado
    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(`${producto.titulo} fue agregado al carrito`);
  };

  // =========================================
  // FILTRAR PRODUCTOS
  // =========================================

  // Filtra por categoría y por nombre
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "Todos" ||
      producto.categoria === categoriaSeleccionada;
    // compara el nombre escrito del producto
    const coincideBusqueda = producto.titulo
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    // debe cumplir la categoria y la busqueda
    return coincideCategoria && coincideBusqueda;
  });

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <main className="productos-page">
      <div className="container py-5">
        {/* CABECERA */}

        <div className="cabecera-productos">
          <h1 className="titulo-productos">Productos BECS</h1>

          <p className="subtitulo-productos">
            Conoce nuestros productos y agrega tus favoritos al carrito
          </p>
        </div>

        {/* ================================= */}
        {/* FILTRO */}
        {/* ================================= */}

        <div className="filtro-productos">
          <div>
            <label htmlFor="categoria" className="form-label">
              Filtrar por categoría
            </label>

            <select
              id="categoria"
              className="form-select"
              value={categoriaSeleccionada}
              onChange={(evento) =>
                setCategoriaSeleccionada(evento.target.value)
              }
            >
              <option value="Todos">Todos</option>

              <option value="Frutos secos">Frutos secos</option>

              <option value="Deshidratados">Deshidratados</option>

              <option value="Condimentos">Condimentos</option>

              <option value="Mieles">Mieles</option>
            </select>
          </div>

           {/* BÚSQUEDA POR NOMBRE */}
          <div className="buscador-productos">
            <label htmlFor="busqueda" className="form-label">
              Buscar producto
            </label>

            <input
              id="busqueda"
              type="text"
              className="form-control"
              placeholder="Ej: Maní, pistachos..."
              value={busqueda} // conecta input con la variable creada
              onChange={(evento) => setBusqueda(evento.target.value)} // cada vez que se escribe, React guarda ese texto en busqueda
            />
          </div>

          {!cargando && (
            <span className="contador-productos">
              {productosFiltrados.length} producto
              {productosFiltrados.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ================================= */}
        {/* PRODUCTOS */}
        {/* ================================= */}

        {cargando ? (
          <div className="mensaje-productos">
            <p className="mb-0">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
        <div className="mensaje-productos">
          <h5>No encontramos productos</h5>

          <p className="text-muted mb-0">
            {busqueda.trim()
              ? `No hay resultados para "${busqueda}". Prueba con otro nombre.`
              : "No hay productos disponibles en esta categoría."}
          </p>
        </div>
      ) : (
          <div className="row g-4">
            {productosFiltrados.map((producto) => (
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
                    {/* CATEGORÍA */}

                    <small className="producto-categoria">
                      {producto.categoria}
                    </small>

                    {/* NOMBRE */}

                    <h5 className="producto-nombre">{producto.titulo}</h5>

                    {/* PRECIO */}

                    <p className="producto-precio">
                      ${producto.precio.toLocaleString("es-CL")}
                      <span className="producto-unidad">
                        {" "}
                        x {producto.unidad}
                      </span>
                    </p>

                    {/* BOTÓN */}

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
