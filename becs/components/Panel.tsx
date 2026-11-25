"use client";

/* Componentes comunes de los paneles de Administrador y Vendedor.
 *   GET /api/v1/productos → listado y detalle de productos
 *   GET /api/v1/pedidos   → listado y detalle de pedidos (STAFF, ADMIN, OWNER) */

import { useCallback, useEffect, useState } from "react";
import {
  api,
  formatearFecha,
  formatearPesos,
  imagenProducto,
  Pedido,
  ProductoApi,
  unidadProducto,
} from "@/lib/api";

/* ------------------------------------------------------------
 * Carga de datos
 * ------------------------------------------------------------ */
export function useDatosPanel() {
  const [productos, setProductos] = useState<ProductoApi[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarProductos = useCallback(async () => {
    try {
      setProductos((await api<ProductoApi[]>("/productos")) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const cargarPedidos = useCallback(async () => {
    try {
      const lista = (await api<Pedido[]>("/pedidos")) ?? [];
      // los más recientes primero
      setPedidos([...lista].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    // Las funciones son asíncronas: el estado se actualiza al llegar la respuesta
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([cargarProductos(), cargarPedidos()]).finally(() => setCargando(false));
  }, [cargarProductos, cargarPedidos]);

  const nombreProducto = useCallback(
    (id?: number) => productos.find((p) => p.id === id)?.nombre ?? `Producto #${id}`,
    [productos]
  );

  return {
    productos,
    pedidos,
    cargando,
    error,
    setError,
    cargarProductos,
    cargarPedidos,
    nombreProducto,
  };
}

/* ------------------------------------------------------------
 * Ventana modal (manejada con estado de React, sin bootstrap.js)
 * ------------------------------------------------------------ */
export function Modal({
  titulo,
  onCerrar,
  children,
}: {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const conEscape = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", conEscape);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", conEscape);
      document.body.classList.remove("modal-open");
    };
  }, [onCerrar]);

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo_modal_panel"
        id="modal_panel"
        onClick={(e) => e.target === e.currentTarget && onCerrar()}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="titulo_modal_panel">
                {titulo}
              </h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}

/* ------------------------------------------------------------
 * Avisos del panel
 * ------------------------------------------------------------ */
export interface Aviso {
  texto: string;
  tipo: "success" | "danger" | "warning";
}

export function CajaAviso({ aviso, onCerrar }: { aviso: Aviso | null; onCerrar: () => void }) {
  if (!aviso) return null;
  return (
    <div className={`alert alert-${aviso.tipo} alert-dismissible`} role="alert" id="panel_aviso">
      {aviso.texto}
      <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
    </div>
  );
}

/* ------------------------------------------------------------
 * Productos
 * ------------------------------------------------------------ */
export function TablaProductos({
  productos,
  cargando,
  acciones,
}: {
  productos: ProductoApi[];
  cargando: boolean;
  acciones: (p: ProductoApi) => React.ReactNode;
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle tabla-panel" id="tabla_productos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cargando ? (
            <FilaVacia columnas={5} texto="Cargando..." />
          ) : productos.length === 0 ? (
            <FilaVacia columnas={5} texto="No hay productos registrados." />
          ) : (
            productos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria?.nombre ?? "—"}</td>
                <td>
                  {formatearPesos(p.precio)} / {unidadProducto(p)}
                </td>
                <td className="text-end text-nowrap">
                  <div className="d-inline-flex gap-1">{acciones(p)}</div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DetalleProducto({ producto: p }: { producto: ProductoApi }) {
  return (
    <div className="row g-4">
      <div className="col-md-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagenProducto(p.nombre)} className="img-fluid rounded" alt={p.nombre} />
      </div>
      <div className="col-md-7">
        <dl className="row mb-0">
          <dt className="col-5">ID</dt>
          <dd className="col-7">{p.id}</dd>
          <dt className="col-5">Categoría</dt>
          <dd className="col-7">{p.categoria?.nombre ?? "—"}</dd>
          <dt className="col-5">Precio</dt>
          <dd className="col-7">{formatearPesos(p.precio)}</dd>
          <dt className="col-5">Unidad</dt>
          <dd className="col-7">
            {p.unidadMedida?.nombre ?? "—"} ({unidadProducto(p)})
          </dd>
          <dt className="col-5">Descripción</dt>
          <dd className="col-7">{p.descripcion || "—"}</dd>
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * Pedidos
 * ------------------------------------------------------------ */
function clienteDelPedido(p: Pedido) {
  return p.datosCliente && typeof p.datosCliente === "object" ? p.datosCliente : null;
}

export function nombreCliente(p: Pedido): string {
  const c = clienteDelPedido(p);
  return c ? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim() : `Cliente #${p.clienteId}`;
}

export function EstadoPedido({ pedido }: { pedido: Pedido }) {
  return pedido.estado ? (
    <span className="badge text-bg-success">Entregado</span>
  ) : (
    <span className="badge text-bg-warning">Pendiente</span>
  );
}

export function TablaPedidos({
  pedidos,
  cargando,
  nombreProducto,
  acciones,
}: {
  pedidos: Pedido[];
  cargando: boolean;
  nombreProducto: (id?: number) => string;
  acciones: (p: Pedido) => React.ReactNode;
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle tabla-panel" id="tabla_pedidos">
        <thead>
          <tr>
            <th>N°</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Fecha</th>
            <th>Retiro</th>
            <th>Total</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cargando ? (
            <FilaVacia columnas={8} texto="Cargando..." />
          ) : pedidos.length === 0 ? (
            <FilaVacia columnas={8} texto="No hay pedidos registrados." />
          ) : (
            pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{nombreCliente(p)}</td>
                <td>{p.detallePedido ? nombreProducto(p.detallePedido.productoId) : "—"}</td>
                <td>{formatearFecha(p.fechaPedido)}</td>
                <td>{formatearFecha(p.fechaRetiro)}</td>
                <td>{p.detallePedido ? formatearPesos(p.detallePedido.subtotal) : "—"}</td>
                <td>
                  <EstadoPedido pedido={p} />
                </td>
                <td className="text-end text-nowrap">
                  <div className="d-inline-flex gap-1">{acciones(p)}</div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DetallePedidoVista({
  pedido: p,
  nombreProducto,
}: {
  pedido: Pedido;
  nombreProducto: (id?: number) => string;
}) {
  const c = clienteDelPedido(p);
  const d = p.detallePedido;
  return (
    <div className="row g-4">
      <div className="col-md-6">
        <h6>Pedido</h6>
        <dl className="row mb-0">
          <dt className="col-5">Estado</dt>
          <dd className="col-7">
            <EstadoPedido pedido={p} />
          </dd>
          <dt className="col-5">Fecha</dt>
          <dd className="col-7">{formatearFecha(p.fechaPedido)}</dd>
          <dt className="col-5">Retiro</dt>
          <dd className="col-7">{formatearFecha(p.fechaRetiro)}</dd>
          <dt className="col-5">Canal</dt>
          <dd className="col-7">{p.canalPedido || "—"}</dd>
          <dt className="col-5">Observación</dt>
          <dd className="col-7">{p.observacion || "—"}</dd>
        </dl>
      </div>
      <div className="col-md-6">
        <h6>Cliente</h6>
        {c ? (
          <dl className="row mb-0">
            <dt className="col-5">Nombre</dt>
            <dd className="col-7">
              {c.nombre} {c.apellido}
            </dd>
            <dt className="col-5">Teléfono</dt>
            <dd className="col-7">{c.telefono || "—"}</dd>
            <dt className="col-5">Correo</dt>
            <dd className="col-7">{c.mail || "—"}</dd>
            <dt className="col-5">Dirección</dt>
            <dd className="col-7">
              {c.direccion ? `${c.direccion.direccion}, ${c.direccion.comuna}` : "—"}
            </dd>
          </dl>
        ) : (
          <p>Cliente #{p.clienteId} (datos no disponibles)</p>
        )}
      </div>
      <div className="col-12">
        <h6>Detalle</h6>
        {d ? (
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{nombreProducto(d.productoId)}</td>
                <td>{d.cantidad}</td>
                <td>{formatearPesos(d.precioUnitario)}</td>
                <td>{formatearPesos(d.subtotal)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Sin detalle.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
 * Pestañas
 * ------------------------------------------------------------ */
export function Pestanas<T extends string>({
  opciones,
  activa,
  onCambiar,
}: {
  opciones: { id: T; texto: string }[];
  activa: T;
  onCambiar: (id: T) => void;
}) {
  return (
    <ul className="nav nav-tabs mb-3" role="tablist">
      {opciones.map((o) => (
        <li className="nav-item" role="presentation" key={o.id}>
          <button
            type="button"
            role="tab"
            aria-selected={activa === o.id}
            className={`nav-link ${activa === o.id ? "active" : ""}`}
            onClick={() => onCambiar(o.id)}
          >
            {o.texto}
          </button>
        </li>
      ))}
    </ul>
  );
}

function FilaVacia({ columnas, texto }: { columnas: number; texto: string }) {
  return (
    <tr>
      <td colSpan={columnas} className="text-center text-muted py-4">
        {texto}
      </td>
    </tr>
  );
}
