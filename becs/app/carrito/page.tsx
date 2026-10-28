"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Producto {
  id: number | string;
  titulo: string;
  precio: number;
  unidad: string;
  imagen: string;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  // Cargar carrito guardado
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");

    if (carritoGuardado) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  // Actualizar carrito y localStorage
  const guardarCarrito = (nuevoCarrito: ItemCarrito[]) => {
    setCarrito(nuevoCarrito);

    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  // Aumentar cantidad
  const aumentarCantidad = (id: number | string) => {
    const nuevoCarrito = carrito.map((item) => {
      if (item.producto.id === id) {
        return {
          ...item,
          cantidad: item.cantidad + 1,
        };
      }

      return item;
    });

    guardarCarrito(nuevoCarrito);
  };

  // Disminuir cantidad
  const disminuirCantidad = (id: number | string) => {
    const nuevoCarrito = carrito
      .map((item) => {
        if (item.producto.id === id) {
          return {
            ...item,
            cantidad: item.cantidad - 1,
          };
        }

        return item;
      })
      .filter((item) => item.cantidad > 0);

    guardarCarrito(nuevoCarrito);
  };

  // Eliminar producto
  const eliminarProducto = (id: number | string) => {
    const nuevoCarrito = carrito.filter((item) => item.producto.id !== id);

    guardarCarrito(nuevoCarrito);
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([]);

    localStorage.removeItem("carrito");
  };

  // Calcular total
  const total = carrito.reduce(
    (acumulador, item) => acumulador + item.producto.precio * item.cantidad,
    0,
  );

  // Finalizar compra
  const finalizarCompra = () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");

      return;
    }

    alert("¡Compra realizada con éxito!");

    vaciarCarrito();
  };

  return (
    <main className="carrito-page">
      <div className="container py-5">
        {/* CABECERA */}

        <div className="carrito-cabecera">
          <h1>🛒 Carrito de compras</h1>

          <p>
            Revisa los productos que agregaste antes de finalizar tu compra.
          </p>
        </div>

        {/* CARRITO VACÍO */}

        {carrito.length === 0 ? (
          <div className="carrito-vacio-pagina">
            <div className="carrito-vacio-icono">🛒</div>

            <h3>Tu carrito está vacío</h3>

            <p>Aún no has agregado productos.</p>

            <Link href="/productos" className="btn btn-becs">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* TABLA DEL CARRITO */}

            <div className="carrito-tabla-contenedor">
              <div className="table-responsive">
                <table className="table carrito-tabla align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>

                      <th>Nombre</th>

                      <th>Precio</th>

                      <th className="text-center">Cantidad</th>

                      <th>Subtotal</th>

                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {carrito.map((item) => (
                      <tr key={item.producto.id}>
                        {/* IMAGEN */}

                        <td>
                          <img
                            src={item.producto.imagen}
                            alt={item.producto.titulo}
                            className="carrito-tabla-imagen"
                          />
                        </td>

                        {/* NOMBRE */}

                        <td>
                          <strong className="carrito-producto-nombre">
                            {item.producto.titulo}
                          </strong>

                          <small className="carrito-producto-unidad">
                            {item.producto.unidad}
                          </small>
                        </td>

                        {/* PRECIO */}

                        <td>${item.producto.precio.toLocaleString("es-CL")}</td>

                        {/* CANTIDAD */}

                        <td>
                          <div className="carrito-controles">
                            <button
                              onClick={() =>
                                disminuirCantidad(item.producto.id)
                              }
                            >
                              −
                            </button>

                            <span>{item.cantidad}</span>

                            <button
                              onClick={() => aumentarCantidad(item.producto.id)}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* SUBTOTAL */}

                        <td>
                          <strong>
                            $
                            {(
                              item.producto.precio * item.cantidad
                            ).toLocaleString("es-CL")}
                          </strong>
                        </td>

                        {/* ELIMINAR */}

                        <td className="text-center">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarProducto(item.producto.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* TOTAL */}

                  <tfoot>
                    <tr>
                      <td colSpan={4} className="text-end">
                        <strong>Total:</strong>
                      </td>

                      <td colSpan={2}>
                        <strong className="carrito-precio-total">
                          ${total.toLocaleString("es-CL")}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* BOTONES INFERIORES */}
            <div className="carrito-acciones">
              <Link href="/productos" className="btn btn-outline-secondary">
                ← Seguir comprando
              </Link>

              <div className="carrito-acciones-derecha">
                <button
                  className="btn btn-outline-danger"
                  onClick={vaciarCarrito}
                >
                  Vaciar carrito
                </button>

                <button className="btn btn-becs" onClick={finalizarCompra}>
                  Finalizar compra
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
