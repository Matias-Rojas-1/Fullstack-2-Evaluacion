"use client";

/* Panel del Vendedor (rol STAFF).
 * Según la pauta solo puede VER:
 *   - listado y detalle de productos  → GET /api/v1/productos
 *   - listado y detalle de pedidos    → GET /api/v1/pedidos
 * No tiene botones para crear, editar ni eliminar, y no ve otras secciones. */

import { useState } from "react";
import RutaProtegida from "@/components/RutaProtegida";
import {
  DetallePedidoVista,
  DetalleProducto,
  Modal,
  Pestanas,
  TablaPedidos,
  TablaProductos,
  useDatosPanel,
} from "@/components/Panel";
import { Pedido, ProductoApi } from "@/lib/api";

type Pestana = "productos" | "pedidos";

export default function VendedorPage() {
  return (
    <RutaProtegida permitir={(s) => s.esVendedor}>
      {(sesion) => <PanelVendedor usuario={sesion.usuario} />}
    </RutaProtegida>
  );
}

function PanelVendedor({ usuario }: { usuario: string }) {
  const datos = useDatosPanel();
  const [pestana, setPestana] = useState<Pestana>("pedidos");
  const [productoVisto, setProductoVisto] = useState<ProductoApi | null>(null);
  const [pedidoVisto, setPedidoVisto] = useState<Pedido | null>(null);

  return (
    <div className="container py-5 panel-becs">
      <div className="panel-cabecera">
        <h1>🧾 Panel del vendedor</h1>
        <span className="panel-usuario">{usuario} · Vendedor</span>
      </div>

      {datos.error && <div className="alert alert-danger">{datos.error}</div>}

      <Pestanas<Pestana>
        opciones={[
          { id: "pedidos", texto: `🧾 Pedidos (${datos.pedidos.length})` },
          { id: "productos", texto: `🥜 Productos (${datos.productos.length})` },
        ]}
        activa={pestana}
        onCambiar={setPestana}
      />

      {pestana === "productos" ? (
        <TablaProductos
          productos={datos.productos}
          cargando={datos.cargando}
          acciones={(p) => (
            <button className="btn btn-sm btn-outline-dark" onClick={() => setProductoVisto(p)}>
              Ver
            </button>
          )}
        />
      ) : (
        <TablaPedidos
          pedidos={datos.pedidos}
          cargando={datos.cargando}
          nombreProducto={datos.nombreProducto}
          acciones={(p) => (
            <button className="btn btn-sm btn-outline-dark" onClick={() => setPedidoVisto(p)}>
              Ver
            </button>
          )}
        />
      )}

      {productoVisto && (
        <Modal titulo={productoVisto.nombre} onCerrar={() => setProductoVisto(null)}>
          <DetalleProducto producto={productoVisto} />
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
