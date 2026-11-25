"use client";

/* Carrito conectado al backend. Al finalizar la compra:
 *  - GET  /api/v1/clientes/buscar?mail=  → ficha del cliente conectado
 *  - POST /api/v1/clientes               → la crea si aún no existe
 *  - POST /api/v1/pedidos                → un pedido por cada producto
 *    (el modelo Pedido del backend tiene un solo detalle). */

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  api,
  Cliente,
  crearCliente,
  formatearFecha,
  hoyIso,
  obtenerClienteConectado,
  Pedido,
  useSesion,
} from "@/lib/api";

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
  const { sesion } = useSesion();

  // Datos del checkout
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [datosCliente, setDatosCliente] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    comuna: "",
  });
  // La fecha por defecto (mañana) se calcula en el navegador, no al prerenderizar
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [observacion, setObservacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [pedidosCreados, setPedidosCreados] = useState<number[]>([]);

  const esCliente = !!sesion?.esCliente;
  const correo = sesion?.correo;

  // Si hay un cliente conectado buscamos su ficha (para saber su id)
  useEffect(() => {
    if (!esCliente) return;
    let activo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBuscandoCliente(true);
    setFechaRetiro((actual) => actual || hoyIso(1));
    obtenerClienteConectado()
      .then((c) => activo && setCliente(c))
      .catch((e) => activo && setMensaje({ texto: e.message, tipo: "texto-invalido" }))
      .finally(() => activo && setBuscandoCliente(false));
    return () => {
      activo = false;
    };
  }, [esCliente, correo]);

  // Cargar carrito guardado
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");

    if (carritoGuardado) {
      // Solo productos del backend (id numérico); se descartan los de json-server
      const items: ItemCarrito[] = JSON.parse(carritoGuardado);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCarrito(items.filter((item) => typeof item.producto?.id === "number"));
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

  // Finalizar compra: registra los pedidos en el backend
  const finalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (carrito.length === 0) {
      setMensaje({ texto: "El carrito está vacío.", tipo: "texto-invalido" });
      return;
    }
    if (!fechaRetiro || fechaRetiro < hoyIso()) {
      setMensaje({ texto: "Elige una fecha de retiro desde hoy en adelante.", tipo: "texto-invalido" });
      return;
    }

    setEnviando(true);
    try {
      // 1. Ficha de cliente (se crea si no existe)
      let ficha = cliente;
      if (!ficha) {
        const { nombre, apellido, telefono, direccion, comuna } = datosCliente;
        if (!nombre.trim() || !apellido.trim() || !telefono.trim() || !direccion.trim() || !comuna.trim()) {
          throw new Error("Completa tus datos para registrar el pedido.");
        }
        ficha = await crearCliente(datosCliente);
        setCliente(ficha);
      }

      // 2. Un pedido por producto
      const creados: number[] = [];
      const pendientes: ItemCarrito[] = [];
      for (const item of carrito) {
        const precioUnitario = Math.round(Number(item.producto.precio));
        try {
          const pedido = await api<Pedido>("/pedidos", {
            method: "POST",
            body: {
              clienteId: ficha.id,
              fechaPedido: hoyIso(),
              fechaRetiro,
              estado: false,
              canalPedido: "Página web",
              observacion: observacion.trim() || null,
              detallePedido: {
                productoId: item.producto.id,
                cantidad: item.cantidad,
                precioUnitario,
                subtotal: precioUnitario * item.cantidad,
              },
            },
          });
          if (pedido?.id) creados.push(pedido.id);
        } catch (errorPedido) {
          console.warn("No se pudo registrar", item.producto.titulo, errorPedido);
          pendientes.push(item);
        }
      }

      // Quedan en el carrito solo los productos que fallaron
      guardarCarrito(pendientes);
      setPedidosCreados(creados);
      if (pendientes.length > 0) {
        setMensaje({
          texto: `No se pudieron registrar ${pendientes.length} producto(s). Siguen en el carrito para reintentar.`,
          tipo: "texto-invalido",
        });
      }
    } catch (err) {
      setMensaje({
        texto: err instanceof Error ? err.message : "No se pudo registrar el pedido.",
        tipo: "texto-invalido",
      });
    } finally {
      setEnviando(false);
    }
  };

  const cambiarDato = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });

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

        {/* PEDIDOS REGISTRADOS */}

        {pedidosCreados.length > 0 && (
          <div className="alert alert-success" role="status" id="pedido_confirmado">
            <strong>
              ¡Pedido{pedidosCreados.length > 1 ? "s" : ""}{" "}
              {pedidosCreados.map((id) => `#${id}`).join(", ")} registrado
              {pedidosCreados.length > 1 ? "s" : ""}!
            </strong>
            <br />
            Puedes retirarlo{pedidosCreados.length > 1 ? "s" : ""} el {formatearFecha(fechaRetiro)} en nuestro local de Maipú.
          </div>
        )}

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

              </div>
            </div>

            {/* FINALIZAR COMPRA */}

            <div className="carrito-checkout">
              <h4 className="mb-3">Finalizar compra</h4>

              {!sesion ? (
                <p className="mb-0">
                  Para registrar tu pedido debes{" "}
                  <Link href="/login">iniciar sesión</Link> o{" "}
                  <Link href="/registro">crear una cuenta</Link>.
                </p>
              ) : !esCliente ? (
                <p className="mb-0 texto-invalido">
                  Los pedidos de la tienda se registran con una cuenta de cliente.
                </p>
              ) : buscandoCliente ? (
                <p className="mb-0 text-muted">Buscando tus datos…</p>
              ) : (
                <form onSubmit={finalizarCompra} noValidate>
                  {cliente ? (
                    <p>
                      Pedido a nombre de{" "}
                      <strong>
                        {cliente.nombre} {cliente.apellido}
                      </strong>{" "}
                      ({cliente.mail})
                    </p>
                  ) : (
                    <>
                      <p className="text-muted">
                        Es tu primera compra: completa tus datos para el retiro.
                      </p>
                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <input name="nombre" className="form-control" placeholder="Nombre" value={datosCliente.nombre} onChange={cambiarDato} />
                        </div>
                        <div className="col-md-6">
                          <input name="apellido" className="form-control" placeholder="Apellido" value={datosCliente.apellido} onChange={cambiarDato} />
                        </div>
                        <div className="col-md-4">
                          <input name="telefono" className="form-control" placeholder="Teléfono" value={datosCliente.telefono} onChange={cambiarDato} />
                        </div>
                        <div className="col-md-5">
                          <input name="direccion" className="form-control" placeholder="Dirección" value={datosCliente.direccion} onChange={cambiarDato} />
                        </div>
                        <div className="col-md-3">
                          <input name="comuna" className="form-control" placeholder="Comuna" value={datosCliente.comuna} onChange={cambiarDato} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="row g-2 align-items-end">
                    <div className="col-md-4">
                      <label htmlFor="fecha_retiro" className="form-label">
                        Fecha de retiro
                      </label>
                      <input
                        id="fecha_retiro"
                        type="date"
                        className="form-control"
                        min={hoyIso()}
                        value={fechaRetiro}
                        onChange={(e) => setFechaRetiro(e.target.value)}
                      />
                    </div>
                    <div className="col-md-8">
                      <label htmlFor="observacion" className="form-label">
                        Observación (opcional)
                      </label>
                      <input
                        id="observacion"
                        className="form-control"
                        placeholder="Ej: retiro después de las 18:00"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-becs mt-3" disabled={enviando}>
                    {enviando ? "Registrando pedido..." : "Confirmar pedido"}
                  </button>
                </form>
              )}

              {mensaje.texto && (
                <div className={`mt-3 fw-bold ${mensaje.tipo}`} role="alert">
                  {mensaje.texto}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
