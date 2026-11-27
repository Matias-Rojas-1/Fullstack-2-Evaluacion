"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Categoria } from "@/lib/api";

function iconoCategoria(nombre: string) {
  const texto = nombre.toLowerCase();
  if (texto.includes("semilla") || texto.includes("grano")) return "🌱";
  if (texto.includes("mix")) return "🥗";
  if (texto.includes("miel")) return "🍯";
  return "🥜";
}

export default function CategoriasInicio() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  useEffect(() => {
  api<Categoria[]>("/productos/categorias", { autenticar: false })
    .then((datos) => setCategorias(datos))
    .catch((error) => console.log("Error al cargar categorías:", error));
}, []);
  return <div className="row g-4 justify-content-center">
    {categorias.map((categoria) => (
      <div className="col-6 col-md-3" key={categoria.id}>
        <Link
          href={`/productos?categoria=${encodeURIComponent(categoria.nombre)}`}
          className="categoria-card"
        >
          <div className="categoria-icono"><div className="categoria-icono">{iconoCategoria(categoria.nombre)}</div></div>
          <h5>{categoria.nombre}</h5>
        </Link>
      </div>
    ))}
  </div>;
}