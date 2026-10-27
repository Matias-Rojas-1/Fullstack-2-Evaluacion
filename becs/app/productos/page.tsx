"use client";
import React, { useState, useEffect } from "react";

interface Producto {
  id: number;
  titulo: string;
  precio: number;
  unidad: string;
  imagen: string;
}

export default function ProductosPage() {
  const [listaProductos, setListaProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<{ producto: Producto; cantidad: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Consumir datos desde el json-server corriendo en el puerto 4000
  useEffect(() => {
    fetch("http://localhost:4000/productos")
      .then((res) => res.json())
      .then((data) => {
        setListaProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al conectar con json-server:", err);
        setLoading(false);
      });
  }, []);

  const agregarAlCarrito = (prod: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === prod.id);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
  };

  const disminuirDelCarrito = (id: number) => {
    setCarrito((prev) => {
      return prev
        .map((item) => (item.producto.id === id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0);
    });
  };

  const total = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="container productos-container my-5 p-4">
      <h1 id="headerProductos" className="text-center mb-4">CATÁLOGO DE PRODUCTOS Y CARRITO</h1>
      
      <div className="row">
        {/* LISTADO DE PRODUCTOS */}
        <div className="col-lg-8 mb-4">
          {loading ? (
            <p className="text-center">Cargando productos desde el servidor...</p>
          ) : listaProductos.length === 0 ? (
            <p className="text-center text-danger">No se pudieron cargar los productos. Asegúrate de que json-server esté corriendo en el puerto 4000.</p>
          ) : (
            <div className="row g-4">
              {listaProductos.map((prod) => (
                <div className="col-12 col-sm-6 col-md-4" key={prod.id}>
                  <div className="card h-100">
                    <img src={prod.imagen} className="card-img-top" alt={prod.titulo} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{prod.titulo}</h5>
                      <p className="card-text">${prod.precio} x {prod.unidad}</p>
                      <button 
                        className="btn btn-becs mt-auto w-100" 
                        onClick={() => agregarAlCarrito(prod)}
                      >
                        Añadir 🛒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CARRITO EN TIEMPO REAL */}
        <div className="col-lg-4">
          <div className="p-3 border bg-white rounded shadow-sm sticky-top" style={{ top: "90px" }}>
            <h3 className="mb-3">🛒 Tu Carrito ({totalItems})</h3>
            
            {carrito.length === 0 ? (
              <p className="text-muted">El carrito está vacío. ¡Agrega productos!</p>
            ) : (
              <>
                <ul className="list-group mb-3" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  {carrito.map((item) => (
                    <li key={item.producto.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="me-2">
                        <h6 className="my-0 text-dark" style={{ fontSize: "0.85rem" }}>{item.producto.titulo}</h6>
                        <small className="text-muted">${item.producto.precio} x {item.producto.unidad}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button 
                          className="btn btn-sm btn-outline-secondary px-2 py-0" 
                          onClick={() => disminuirDelCarrito(item.producto.id)}
                        >
                          -
                        </button>
                        <span className="fw-bold">{item.cantidad}</span>
                        <button 
                          className="btn btn-sm btn-outline-secondary px-2 py-0" 
                          onClick={() => agregarAlCarrito(item.producto)}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="fw-bold mb-0">Total:</h5>
                    <h5 className="fw-bold text-success mb-0">${total.toLocaleString("es-CL")}</h5>
                  </div>
                  <button 
                    className="btn btn-success w-100 py-2 fw-bold" 
                    onClick={() => {
                      alert("¡Compra realizada con éxito! Gracias por preferir BECS.");
                      setCarrito([]);
                    }}
                  >
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}