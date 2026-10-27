"use client";
import { useEffect } from "react";
// @ts-ignore
import { validarNombre, validarPass, validarConfirmacion, validarMail, calcularTotalCarrito } from "@/app/validadoresBecs.js";

declare global {
  interface Window {
    QUnit: any;
  }
}

export default function TestsPage() {
  useEffect(() => {
    if (document.getElementById("qunit-script")) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://code.jquery.com/qunit/qunit-2.20.0.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "qunit-script";
    script.src = "https://code.jquery.com/qunit/qunit-2.20.0.js";
    script.async = true;

    script.onload = () => {
      const Q = (window as any).QUnit;

      Q.module("Pruebas Unitarias - Tienda BECS", () => {
        
        Q.test("1. Validar Nombre de Registro", (assert: any) => {
          assert.true(validarNombre("Matias"), "Nombre válido de más de 3 letras");
          assert.false(validarNombre("Jo"), "Nombre muy corto debe fallar");
          assert.false(validarNombre("12345"), "Un nombre no puede ser numérico");
        });

        Q.test("2. Validar Contraseña", (assert: any) => {
          assert.true(validarPass("admin123"), "Contraseña de más de 4 caracteres es válida");
          assert.false(validarPass("123"), "Contraseña menor a 4 caracteres debe fallar");
        });

        Q.test("3. Validar Confirmación de Contraseña", (assert: any) => {
          assert.true(validarConfirmacion("secreto", "secreto"), "Las contraseñas coinciden");
          assert.false(validarConfirmacion("secreto", "otro"), "Las contraseñas no coinciden");
        });

        Q.test("4. Validar Formato de Correo Electrónico", (assert: any) => {
          assert.true(validarMail("contacto@becs.cl"), "Correo con formato correcto");
          assert.false(validarMail("correosinarroba.cl"), "Correo sin @ debe fallar");
        });

        Q.test("5. Calcular Total del Carrito en Tiempo Real", (assert: any) => {
          const itemsCarrito = [
            { precio: 850, cantidad: 2 },  // Maní japonés merkén ($1700)
            { precio: 2000, cantidad: 1 }   // Castañas de cajú ($2000)
          ];
          const totalEsperado = 3700;
          assert.equal(calcularTotalCarrito(itemsCarrito), totalEsperado, "El cálculo total del carrito es exacto (3700)");
        });

      });

      Q.start();
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div className="container my-5">
      <h1>Pruebas Unitarias QUnit - BECS (Frutos Secos)</h1>
      <div id="qunit"></div>
      <div id="qunit-fixture"></div>
    </div>
  );
}