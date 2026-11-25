"use client";

/* Registro de clientes conectado al backend:
 *  1. POST /api/v1/auth/registrar → crea la cuenta. El backend le asigna
 *     siempre el rol CLIENTE (nadie puede registrarse como admin).
 *     El usuario de la cuenta es el correo.
 *  2. POST /api/v1/auth/login     → obtiene el token JWT.
 *  3. POST /api/v1/clientes       → crea la ficha de cliente con su
 *     dirección (se necesita para hacer pedidos). */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, crearCliente, iniciarSesion } from "@/lib/api";
import {
  validarConfirmacion,
  validarMail,
  validarNombre,
  validarPass,
} from "@/app/validadoresBecs.js";

const FORM_INICIAL = {
  nombre: "",
  apellido: "",
  contra: "",
  contra_conf: "",
  mail: "",
  telefono: "",
  direccion: "",
  comuna: "",
};

export default function RegistroPage() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const error = (texto: string) => setMensaje({ texto, tipo: "texto-invalido" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarNombre(form.nombre)) return error("El nombre debe tener al menos 3 caracteres.");
    if (!validarNombre(form.apellido)) return error("El apellido debe tener al menos 3 caracteres.");
    if (!validarMail(form.mail)) return error("Ingresa un correo válido.");
    if (!validarPass(form.contra)) return error("La contraseña debe tener al menos 6 caracteres.");
    if (!validarConfirmacion(form.contra, form.contra_conf)) return error("Las contraseñas no coinciden.");
    if (!/^\+?\d{8,12}$/.test(form.telefono.replace(/\s/g, "")))
      return error("Ingresa un teléfono válido (ej: +56912345678).");
    if (!form.direccion.trim() || !form.comuna.trim())
      return error("La dirección y la comuna son necesarias para retirar tus pedidos.");

    const correo = form.mail.trim().toLowerCase();
    setCargando(true);
    setMensaje({ texto: "", tipo: "" });
    try {
      // 1. Cuenta de usuario (rol CLIENTE)
      await api("/auth/registrar", {
        method: "POST",
        body: { username: correo, correo, password: form.contra },
        autenticar: false,
        texto: true,
      });

      // 2. Sesión
      await iniciarSesion(correo, form.contra);

      // 3. Ficha de cliente
      try {
        await crearCliente({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          telefono: form.telefono.replace(/\s/g, ""),
          direccion: form.direccion.trim(),
          comuna: form.comuna.trim(),
        });
      } catch (errorCliente) {
        // La cuenta ya quedó creada; los datos se completan al comprar
        console.warn("No se pudo crear la ficha de cliente:", errorCliente);
      }

      setMensaje({ texto: "¡Cuenta creada! Te llevamos a la tienda...", tipo: "texto-valido" });
      setForm(FORM_INICIAL);
      setTimeout(() => router.push("/productos"), 1200);
    } catch (err) {
      error(err instanceof Error ? err.message : "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container my-5">
      <div id="contenedor_formulario" className="p-4 rounded shadow bg-white">
        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="p-4 border">
            <legend className="text-center mb-4">Regístrate en BECS</legend>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input type="text" name="nombre" placeholder="Nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <input type="text" name="apellido" placeholder="Apellido" className="form-control" value={form.apellido} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3">
              <input type="email" name="mail" placeholder="Mail (será tu usuario)" className="form-control" autoComplete="email" value={form.mail} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="password" name="contra" placeholder="Contraseña (mínimo 6 caracteres)" className="form-control" autoComplete="new-password" value={form.contra} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="password" name="contra_conf" placeholder="Confirmar contraseña" className="form-control" autoComplete="new-password" value={form.contra_conf} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="text" name="telefono" placeholder="Teléfono (+569XXXXXXXX)" className="form-control" value={form.telefono} onChange={handleChange} required />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-8">
                <input type="text" name="direccion" placeholder="Dirección" className="form-control" value={form.direccion} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <input type="text" name="comuna" placeholder="Comuna" className="form-control" value={form.comuna} onChange={handleChange} required />
              </div>
            </div>

            {mensaje.texto && (
              <div className={`mb-3 fw-bold ${mensaje.tipo}`} role="alert" id="mensaje_registro">
                {mensaje.texto}
              </div>
            )}

            <div className="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" className="btn btn-becs" disabled={cargando}>
                {cargando ? "Registrando..." : "Registrarse"}
              </button>
            </div>
            <p className="text-center mt-3 mb-0">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
