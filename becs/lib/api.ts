
import { useSyncExternalStore } from "react";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9090/api/v1";

/* ------------------------------------------------------------
 * Tipos que devuelve el backend
 * ------------------------------------------------------------ */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface ProductoApi {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: Categoria;
  unidadMedida?: UnidadMedida;
}

export interface Direccion {
  id?: number;
  direccion: string;
  comuna: string;
  region: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  fechaRegistro: string;
  direccion?: Direccion;
}

export interface DetallePedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  fechaPedido: string;
  fechaRetiro: string;
  estado: boolean;
  canalPedido: string;
  observacion?: string | null;
  detallePedido?: DetallePedido;
  datosCliente?: Cliente | string | null;
}

export interface Usuario {
  id: number;
  username: string;
  correo: string;
  roles?: { id: number; nombreRol: string }[];
}

/* ------------------------------------------------------------
 * Sesión: el JWT se guarda en localStorage. Dentro trae el
 * usuario (sub), su correo y sus roles.
 * ------------------------------------------------------------ */
const CLAVE_TOKEN = "becs_token";
const CLAVE_CLIENTE = "becs_cliente";
const EVENTO_SESION = "becs-sesion";

export interface DatosSesion {
  usuario: string;
  correo: string;
  roles: string[];
  esAdmin: boolean;
  esVendedor: boolean;
  esCliente: boolean;
}

function leerPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLAVE_TOKEN);
}

export function guardarSesion(token: string) {
  localStorage.setItem(CLAVE_TOKEN, token);
  sessionStorage.removeItem(CLAVE_CLIENTE);
  window.dispatchEvent(new Event(EVENTO_SESION));
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_CLIENTE);
  window.dispatchEvent(new Event(EVENTO_SESION));
}

// Lee la sesión actual (null si no hay token o si expiró).
// No verifica la firma: eso lo hace el backend en cada petición.
export function leerSesion(token: string | null = obtenerToken()): DatosSesion | null {
  if (!token) return null;
  const datos = leerPayload(token);
  if (!datos) return null;
  if (typeof datos.exp === "number" && datos.exp * 1000 < Date.now()) return null;

  const roles = Array.isArray(datos.roles) ? (datos.roles as string[]) : [];
  // Roles según la pauta: Administrador = ADMIN u OWNER · Vendedor = STAFF · Cliente = CLIENTE
  const esAdmin = roles.includes("ADMIN") || roles.includes("OWNER");
  const esVendedor = !esAdmin && roles.includes("STAFF");
  return {
    usuario: String(datos.sub ?? ""),
    correo: String(datos.correo ?? ""),
    roles,
    esAdmin,
    esVendedor,
    esCliente: !esAdmin && !esVendedor && roles.includes("CLIENTE"),
  };
}

export function paginaInicio(sesion: DatosSesion | null): string {
  if (sesion?.esAdmin) return "/admin";
  if (sesion?.esVendedor) return "/vendedor";
  return "/productos";
}

/* Hook para leer la sesión en componentes de cliente.
 * useSyncExternalStore evita errores de hidratación: en el servidor
 * no hay localStorage, así que se usa "sin sesión" y en el navegador
 * se actualiza con el token guardado. */
function suscribirSesion(avisar: () => void) {
  window.addEventListener(EVENTO_SESION, avisar);
  window.addEventListener("storage", avisar); // cambios desde otra pestaña
  return () => {
    window.removeEventListener(EVENTO_SESION, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function useSesion(): { sesion: DatosSesion | null; lista: boolean } {
  // El snapshot es el token (un string), así React compara por valor
  const token = useSyncExternalStore(suscribirSesion, obtenerToken, () => undefined);
  // lista = false durante el render del servidor y la hidratación
  const lista = token !== undefined;
  return { sesion: lista ? leerSesion(token) : null, lista };
}

/* ------------------------------------------------------------
 * api(): única función para hablar con el backend.
 * Agrega el token y traduce los errores a mensajes legibles.
 * ------------------------------------------------------------ */
interface OpcionesApi {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  autenticar?: boolean;
  texto?: boolean;
}

export class ErrorApi extends Error {
  constructor(mensaje: string, public status: number) {
    super(mensaje);
  }
}

export async function api<T = unknown>(
  ruta: string,
  { method = "GET", body, autenticar = true, texto = false }: OpcionesApi = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = obtenerToken();
  if (autenticar && token && leerSesion(token)) headers["Authorization"] = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(API_URL + ruta, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErrorApi(
      "No se pudo conectar con el servidor. Revisa que el API Gateway (puerto 9090) y los microservicios estén levantados.",
      0
    );
  }

  if (respuesta.status === 401 && autenticar && token) {
    cerrarSesion();
    throw new ErrorApi("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }
  if (respuesta.status === 403) {
    throw new ErrorApi("No tienes permisos para realizar esta acción.", 403);
  }

  const contenido = respuesta.status === 204 ? "" : await respuesta.text();
  if (!respuesta.ok) {
    throw new ErrorApi(mensajeDeError(respuesta.status, contenido), respuesta.status);
  }
  if (texto) return contenido as T;
  try {
    return (contenido ? JSON.parse(contenido) : null) as T;
  } catch {
    return contenido as T;
  }
}

// Spring a veces responde un JSON de error; se extrae el mensaje útil
function mensajeDeError(status: number, cuerpo: string): string {
  try {
    const json = JSON.parse(cuerpo);
    return json.message || json.error || `Error ${status}`;
  } catch {
    return cuerpo && cuerpo.length < 300 ? cuerpo : `Error ${status} en el servidor`;
  }
}

/* ------------------------------------------------------------
 * Operaciones usadas por varias páginas
 * ------------------------------------------------------------ */
export async function iniciarSesion(username: string, password: string) {
  const token = await api<string>("/auth/login", {
    method: "POST",
    body: { username, password },
    autenticar: false,
    texto: true,
  });
  if (!token || token.trim().split(".").length !== 3) {
    throw new ErrorApi("El servidor no devolvió un token válido.", 500);
  }
  guardarSesion(token.trim());
  return leerSesion(token.trim());
}

// Ficha de cliente del usuario conectado (se busca por el correo del token)
export async function obtenerClienteConectado(): Promise<Cliente | null> {
  const guardado = sessionStorage.getItem(CLAVE_CLIENTE);
  if (guardado) return JSON.parse(guardado);

  const correo = leerSesion()?.correo;
  if (!correo) return null;
  try {
    const cliente = await api<Cliente>("/clientes/buscar?mail=" + encodeURIComponent(correo));
    sessionStorage.setItem(CLAVE_CLIENTE, JSON.stringify(cliente));
    return cliente;
  } catch (e) {
    if (e instanceof ErrorApi && e.status === 404) return null; // aún no tiene ficha
    throw e;
  }
}

export interface DatosNuevoCliente {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  comuna: string;
}

export async function crearCliente(datos: DatosNuevoCliente): Promise<Cliente> {
  const cliente = await api<Cliente>("/clientes", {
    method: "POST",
    body: {
      nombre: datos.nombre,
      apellido: datos.apellido,
      telefono: datos.telefono,
      mail: leerSesion()?.correo,
      fechaRegistro: hoyIso(),
      direccion: { direccion: datos.direccion, comuna: datos.comuna, region: "Metropolitana" },
    },
  });
  sessionStorage.setItem(CLAVE_CLIENTE, JSON.stringify(cliente));
  return cliente;
}

/* ------------------------------------------------------------
 * Formato y adaptación de datos
 * ------------------------------------------------------------ */
export function formatearPesos(valor: number | undefined | null): string {
  return "$" + Math.round(Number(valor) || 0).toLocaleString("es-CL");
}

export function hoyIso(diasExtra = 0): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasExtra);
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatearFecha(iso?: string | null): string {
  if (!iso) return "—";
  const [a, m, d] = String(iso).slice(0, 10).split("-");
  return d && m && a ? `${d}-${m}-${a}` : String(iso);
}

export function unidadProducto(p?: ProductoApi): string {
  return p?.unidadMedida?.abreviatura || p?.unidadMedida?.nombre || "unidad";
}

// Las imágenes no vienen de la API: se asocian por el nombre del producto
const IMAGENES: [string, string][] = [
  ["japon", "japones.jpeg"],
  ["caju", "caju.jpeg"],
  ["cajú", "caju.jpeg"],
  ["confitado", "maniconfitadomora.jpeg"],
  ["maní", "mani.jpeg"],
  ["mani", "mani.jpeg"],
  ["maiz", "maizcur.jpeg"],
  ["maíz", "maizcur.jpeg"],
  ["nuez", "nueces.jpeg"],
  ["nueces", "nueces.jpeg"],
  ["pistach", "pistachos.jpeg"],
  ["coco", "coco.jpeg"],
  ["miel", "mieles.jpeg"],
  ["mote", "moteconhuesillo.jpeg"],
  ["huesillo", "moteconhuesillo.jpeg"],
  ["aliño", "alinocompleto.jpeg"],
  ["alino", "alinocompleto.jpeg"],
  ["flor", "flor.jpeg"],
];

export function imagenProducto(nombre?: string): string {
  const texto = String(nombre ?? "").toLowerCase();
  const encontrada = IMAGENES.find(([clave]) => texto.includes(clave));
  return "/img/" + (encontrada ? encontrada[1] : "logo.jpeg");
}
