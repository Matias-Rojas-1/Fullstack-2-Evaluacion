"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mail, setMail] = useState("");
  const [contra, setContra] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const usuarioGuardado = localStorage.getItem("usuario_becs");

    if (!usuarioGuardado) {
      setError("No hay usuarios registrados en este navegador.");
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    if (usuario.mail === mail && usuario.contra === contra) {
      alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
      router.push("/");
    } else {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <main className="container my-5" style={{ maxWidth: "500px" }}>
      <div className="p-4 border bg-white rounded shadow">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input type="email" placeholder="Correo electrónico" className="form-control" value={mail} onChange={(e) => setMail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <input type="password" placeholder="Contraseña" className="form-control" value={contra} onChange={(e) => setContra(e.target.value)} required />
          </div>
          {error && <div className="text-danger mb-3 fw-bold">{error}</div>}
          <button type="submit" className="btn btn-becs w-100">Entrar</button>
        </form>
      </div>
    </main>
  );
}