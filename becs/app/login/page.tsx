"use client";

/* Login contra el backend: POST /api/v1/auth/login { username, password }
 * El servicio de usuarios responde con un token JWT (texto) que se guarda
 * en localStorage. Luego se redirige según el rol:
 *   Administrador → /admin · Vendedor → /vendedor · Cliente → /productos */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { iniciarSesion, paginaInicio } from "@/lib/api";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contra, setContra] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !contra) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    setCargando(true);
    try {
      const sesion = await iniciarSesion(usuario.trim(), contra);
      router.push(paginaInicio(sesion));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container my-5" style={{ maxWidth: "500px" }}>
      <div className="p-4 border bg-white rounded shadow">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} id="form_login" noValidate>
          <div className="mb-3">
            <label htmlFor="campo_usuario" className="form-label">
              Usuario o correo
            </label>
            <input
              id="campo_usuario"
              type="text"
              placeholder="ej: cliente@correo.cl"
              className="form-control"
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="campo_contra" className="form-label">
              Contraseña
            </label>
            <input
              id="campo_contra"
              type="password"
              placeholder="Contraseña"
              className="form-control"
              autoComplete="current-password"
              value={contra}
              onChange={(e) => setContra(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-danger mb-3 fw-bold" role="alert" id="mensaje_login">
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-becs w-100" disabled={cargando}>
            {cargando ? "Ingresando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          ¿No tienes cuenta? <Link href="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </main>
  );
}
