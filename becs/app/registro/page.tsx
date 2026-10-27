"use client";
import React, { useState } from "react";

export default function RegistroPage() {
  const [form, setForm] = useState({
    nombre: "",
    contra: "",
    contra_conf: "",
    mail: "",
    telefono: "",
    direccion: "",
  });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nombre.length < 3) {
      setMensaje({ texto: "El nombre debe tener al menos 3 caracteres.", tipo: "texto-invalido" });
      return;
    }
    if (form.contra.length < 4) {
      setMensaje({ texto: "La contraseña debe tener al menos 4 caracteres.", tipo: "texto-invalido" });
      return;
    }
    if (form.contra !== form.contra_conf) {
      setMensaje({ texto: "Las contraseñas no coinciden.", tipo: "texto-invalido" });
      return;
    }

    localStorage.setItem("usuario_becs", JSON.stringify(form));
    setMensaje({ texto: "¡Registro exitoso! Datos guardados localmente.", tipo: "texto-valido" });
  };

  return (
    <main className="container my-5">
      <div id="contenedor_formulario" className="p-4 rounded shadow bg-white">
        <form onSubmit={handleSubmit}>
          <fieldset className="p-4 border">
            <legend className="text-center mb-4">Regístrate en BECS</legend>

            <div className="mb-3">
              <input type="text" name="nombre" placeholder="Nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="password" name="contra" placeholder="Contraseña" className="form-control" value={form.contra} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="password" name="contra_conf" placeholder="Confirmar contraseña" className="form-control" value={form.contra_conf} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="email" name="mail" placeholder="Mail" className="form-control" value={form.mail} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="text" name="telefono" placeholder="Teléfono (+569XXXXXXXX)" className="form-control" value={form.telefono} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="text" name="direccion" placeholder="Dirección (Opcional)" className="form-control" value={form.direccion} onChange={handleChange} />
            </div>

            {mensaje.texto && <div className={`mb-3 fw-bold ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <div className="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" className="btn btn-becs">Registrarse</button>
            </div>
          </fieldset>
        </form>
      </div>
    </main>
  );
}