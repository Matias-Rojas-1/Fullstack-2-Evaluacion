"use client";

/* Panel del Administrador (roles ADMIN y OWNER) — acceso completo.
 *   Productos: GET/POST/PUT/DELETE /api/v1/productos
 *              GET /api/v1/productos/categorias y /productos/medidas
 *   Pedidos:   GET/PUT/DELETE /api/v1/pedidos
 *   Clientes:  GET /api/v1/clientes
 *   Usuarios:  GET /api/v1/admin/usuarios */

import React, { useEffect, useState } from "react";
import RutaProtegida from "@/components/RutaProtegida";
import {
  Aviso,
  CajaAviso,
  DetallePedidoVista,
  DetalleProducto,
  Modal,
  Pestanas,
  TablaPedidos,
  TablaProductos,
  useDatosPanel,
} from "@/components/Panel";
import {
  api,
  Categoria,
  Cliente,
  formatearFecha,
  Pedido,
  ProductoApi,
  UnidadMedida,
  Usuario,
} from "@/lib/api";

type Pestana = "productos" | "pedidos" | "clientes" | "usuarios";

const NOMBRE_ROL: Record<string, string> = {
  ADMIN: "Administrador",
  OWNER: "Dueño",
  STAFF: "Vendedor",
  CLIENTE: "Cliente",
};

export default function AdminPage() {
  return (
    <RutaProtegida permitir={(s) => s.esAdmin}>
      {(sesion) => <PanelAdmin usuario={sesion.usuario} />}
    </RutaProtegida>
  );
}

function PanelAdmin({ usuario }: { usuario: string }) {
  const datos = useDatosPanel();
  const [pestana, setPestana] = useState<Pestana>("productos");
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);

  // Ventanas modales
  const [productoVisto, setProductoVisto] = useState<ProductoApi | null>(null);
  const [productoEditado, setProductoEditado] = useState<ProductoApi | "nuevo" | null>(null);
  const [pedidoVisto, setPedidoVisto] = useState<Pedido | null>(null);

  const mostrarError = (e: unknown) =>
    setAviso({ texto: e instanceof Error ? e.message : String(e), tipo: "danger" });

  useEffect(() => {
    Promise.all([
      api<Categoria[]>("/productos/categorias"),
      api<UnidadMedida[]>("/productos/medidas"),
    ])
      .then(([c, u]) => {
        setCategorias(c ?? []);
        setUnidades(u ?? []);
      })
      .catch((e) =>
        setAviso({ texto: "No se pudieron cargar categorías y unidades: " + e.message, tipo: "warning" })
      );
    api<Cliente[]>("/clientes")
      .then((c) => setClientes(c ?? []))
      .catch((e) => {
        setClientes([]);
        mostrarError(new Error("Clientes: " + e.message));
      });
    api<Usuario[]>("/admin/usuarios")
      .then((u) => setUsuarios(u ?? []))
      .catch((e) => {
        setUsuarios([]);
        mostrarError(new Error("Usuarios: " + e.message));
      });
  }, []);

  /* ---------------- productos ---------------- */
  async function eliminarProducto(p: ProductoApi) {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api(`/productos/${p.id}`, { method: "DELETE" });
      setAviso({ texto: `Producto "${p.nombre}" eliminado.`, tipo: "success" });
      await datos.cargarProductos();
    } catch (e) {
      mostrarError(e);
    }
  }

  /* ---------------- pedidos ---------------- */
  // El backend exige el pedido completo (con su detalle) para actualizarlo
  async function cambiarEstadoPedido(p: Pedido) {
    const d = p.detallePedido;
    try {
      await api(`/pedidos/${p.id}`, {
        method: "PUT",
        body: {
          id: p.id,
          clienteId: p.clienteId,
          fechaPedido: p.fechaPedido,
          fechaRetiro: p.fechaRetiro,
          estado: !p.estado,
          canalPedido: p.canalPedido,
          observacion: p.observacion,
          detallePedido: d && {
            id: d.id,
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.subtotal,
          },
        },
      });
      setAviso({
        texto: `Pedido #${p.id} marcado como ${p.estado ? "pendiente" : "entregado"}.`,
        tipo: "success",
      });
      await datos.cargarPedidos();
    } catch (e) {
      mostrarError(e);
    }
  }

  async function eliminarPedido(p: Pedido) {
    if (!confirm(`¿Eliminar el pedido #${p.id}?`)) return;
    try {
      await api(`/pedidos/${p.id}`, { method: "DELETE" });
      setAviso({ texto: `Pedido #${p.id} eliminado.`, tipo: "success" });
      await datos.cargarPedidos();
    } catch (e) {
      mostrarError(e);
    }
  }

  return (
    <div className="container py-5 panel-becs">
      <div className="panel-cabecera">
        <h1>🛠️ Panel del administrador</h1>
        <span className="panel-usuario">{usuario} · Administrador</span>
      </div>

      <CajaAviso aviso={aviso} onCerrar={() => setAviso(null)} />
      {datos.error && <div className="alert alert-danger">{datos.error}</div>}

      <Pestanas<Pestana>
        opciones={[
          { id: "productos", texto: `🥜 Productos (${datos.productos.length})` },
          { id: "pedidos", texto: `🧾 Pedidos (${datos.pedidos.length})` },
          { id: "clientes", texto: `🧑 Clientes (${clientes?.length ?? 0})` },
          { id: "usuarios", texto: `👥 Usuarios (${usuarios?.length ?? 0})` },
        ]}
        activa={pestana}
        onCambiar={setPestana}
      />

      {pestana === "productos" && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-becs" onClick={() => setProductoEditado("nuevo")}>
              + Nuevo producto
            </button>
          </div>
          <TablaProductos
            productos={datos.productos}
            cargando={datos.cargando}
            acciones={(p) => (
              <>
                <button className="btn btn-sm btn-outline-dark" onClick={() => setProductoVisto(p)}>
                  Ver
                </button>
                <button className="btn btn-sm btn-becs" onClick={() => setProductoEditado(p)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarProducto(p)}>
                  Eliminar
                </button>
              </>
            )}
          />
        </>
      )}

      {pestana === "pedidos" && (
        <TablaPedidos
          pedidos={datos.pedidos}
          cargando={datos.cargando}
          nombreProducto={datos.nombreProducto}
          acciones={(p) => (
            <>
              <button className="btn btn-sm btn-outline-dark" onClick={() => setPedidoVisto(p)}>
                Ver
              </button>
              <button className="btn btn-sm btn-becs" onClick={() => cambiarEstadoPedido(p)}>
                {p.estado ? "Marcar pendiente" : "Marcar entregado"}
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarPedido(p)}>
                Eliminar
              </button>
            </>
          )}
        />
      )}

      {pestana === "clientes" && (
        <div className="table-responsive">
          <table className="table table-hover align-middle tabla-panel" id="tabla_clientes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {clientes === null ? (
                <FilaTexto columnas={6} texto="Cargando..." />
              ) : clientes.length === 0 ? (
                <FilaTexto columnas={6} texto="No hay clientes." />
              ) : (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      {c.nombre} {c.apellido}
                    </td>
                    <td>{c.mail}</td>
                    <td>{c.telefono}</td>
                    <td>{c.direccion ? `${c.direccion.direccion}, ${c.direccion.comuna}` : "—"}</td>
                    <td>{formatearFecha(c.fechaRegistro)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pestana === "usuarios" && (
        <div className="table-responsive">
          <table className="table table-hover align-middle tabla-panel" id="tabla_usuarios">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {usuarios === null ? (
                <FilaTexto columnas={4} texto="Cargando..." />
              ) : usuarios.length === 0 ? (
                <FilaTexto columnas={4} texto="No hay usuarios." />
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.correo}</td>
                    <td>
                      {(u.roles ?? []).map((r) => (
                        <span className="badge text-bg-secondary me-1" key={r.id ?? r.nombreRol}>
                          {NOMBRE_ROL[r.nombreRol] ?? r.nombreRol}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {productoVisto && (
        <Modal titulo={productoVisto.nombre} onCerrar={() => setProductoVisto(null)}>
          <DetalleProducto producto={productoVisto} />
        </Modal>
      )}

      {productoEditado && (
        <Modal
          titulo={productoEditado === "nuevo" ? "Nuevo producto" : `Editar: ${productoEditado.nombre}`}
          onCerrar={() => setProductoEditado(null)}
        >
          <FormularioProducto
            producto={productoEditado === "nuevo" ? null : productoEditado}
            categorias={categorias}
            unidades={unidades}
            onCancelar={() => setProductoEditado(null)}
            onGuardado={async (texto) => {
              setProductoEditado(null);
              setAviso({ texto, tipo: "success" });
              await datos.cargarProductos();
            }}
          />
        </Modal>
      )}

      {pedidoVisto && (
        <Modal titulo={`Pedido #${pedidoVisto.id}`} onCerrar={() => setPedidoVisto(null)}>
          <DetallePedidoVista pedido={pedidoVisto} nombreProducto={datos.nombreProducto} />
        </Modal>
      )}
    </div>
  );
}

/* Formulario para crear (POST) o editar (PUT) un producto */
function FormularioProducto({
  producto,
  categorias,
  unidades,
  onCancelar,
  onGuardado,
}: {
  producto: ProductoApi | null;
  categorias: Categoria[];
  unidades: UnidadMedida[];
  onCancelar: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? "",
    precio: producto?.precio ? String(producto.precio) : "",
    descripcion: producto?.descripcion ?? "",
    categoria: producto?.categoria?.id ? String(producto.categoria.id) : "",
    unidad: producto?.unidadMedida?.id ? String(producto.unidadMedida.id) : "",
  });
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      categoria: { id: Number(form.categoria) },
      unidadMedida: { id: Number(form.unidad) },
    };
    if (!datos.nombre) return setMensaje("El nombre es obligatorio.");
    if (!(datos.precio > 0)) return setMensaje("El precio debe ser mayor a 0.");
    if (!datos.categoria.id || !datos.unidadMedida.id)
      return setMensaje("Selecciona la categoría y la unidad de medida.");

    setGuardando(true);
    setMensaje("");
    try {
      if (producto) {
        await api(`/productos/${producto.id}`, { method: "PUT", body: { id: producto.id, ...datos } });
      } else {
        await api("/productos", { method: "POST", body: datos });
      }
      onGuardado(producto ? "Producto actualizado." : "Producto creado.");
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : String(err));
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} noValidate id="form_producto">
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="p_nombre">
            Nombre
          </label>
          <input className="form-control" id="p_nombre" name="nombre" value={form.nombre} onChange={cambiar} />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="p_precio">
            Precio
          </label>
          <input type="number" min="1" className="form-control" id="p_precio" name="precio" value={form.precio} onChange={cambiar} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="p_descripcion">
            Descripción
          </label>
          <textarea className="form-control" id="p_descripcion" name="descripcion" rows={2} value={form.descripcion} onChange={cambiar} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="p_categoria">
            Categoría
          </label>
          <select className="form-select" id="p_categoria" name="categoria" value={form.categoria} onChange={cambiar}>
            <option value="">Selecciona...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="p_unidad">
            Unidad de medida
          </label>
          <select className="form-select" id="p_unidad" name="unidad" value={form.unidad} onChange={cambiar}>
            <option value="">Selecciona...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.abreviatura})
              </option>
            ))}
          </select>
        </div>
      </div>
      {mensaje && (
        <p className="texto-invalido fw-bold mt-3 mb-0" role="alert">
          {mensaje}
        </p>
      )}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="btn btn-outline-dark" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-becs" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function FilaTexto({ columnas, texto }: { columnas: number; texto: string }) {
  return (
    <tr>
      <td colSpan={columnas} className="text-center text-muted py-4">
        {texto}
      </td>
    </tr>
  );
}
