# BECS Frutos Secos — Frontend (Next.js)

Página web de la tienda BECS conectada a los microservicios del proyecto
**FrutosSecosBECS** (Spring Boot) a través del **API Gateway**.

## Requisitos

1. Backend levantado: MySQL (XAMPP), los microservicios y el API Gateway en `http://localhost:9090`.
2. Node.js 20 o superior.

## Cómo ejecutar

```bash
cd becs
npm install
npm run dev
```

Abrir `http://localhost:3000`.

La dirección del backend se puede cambiar copiando `.env.example` como `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:9090/api/v1
```

## Conexión con el backend

Todas las peticiones se hacen con `fetch` desde `lib/api.ts`, que agrega el token
JWT en el encabezado `Authorization: Bearer <token>`.

| Página | Endpoint(s) | Rol |
|---|---|---|
| `/login` | `POST /api/v1/auth/login` | Público |
| `/registro` | `POST /api/v1/auth/registrar`, `POST /api/v1/clientes` | Público (crea un CLIENTE) |
| `/productos` | `GET /api/v1/productos`, `GET /api/v1/productos/categorias` | Público |
| `/carrito` | `GET /api/v1/clientes/buscar?mail=`, `POST /api/v1/clientes`, `POST /api/v1/pedidos` | Cliente |
| `/vendedor` | `GET /api/v1/productos`, `GET /api/v1/pedidos` (solo lectura) | Vendedor (STAFF) |
| `/admin` | CRUD `/api/v1/productos`, `GET/PUT/DELETE /api/v1/pedidos`, `GET /api/v1/clientes`, `GET /api/v1/admin/usuarios` | Administrador (ADMIN / OWNER) |

## Roles

- **Administrador**: acceso completo desde su panel (productos, pedidos, clientes y usuarios).
- **Vendedor**: solo ve el listado y detalle de productos y de pedidos. No ve ninguna otra opción.
- **Cliente**: solo la tienda (productos, carrito y compra).

Después del login cada rol es enviado a su página (`/admin`, `/vendedor` o `/productos`)
y el menú muestra solo las opciones que le corresponden. Si alguien entra a una ruta
que no le corresponde es redirigido. La seguridad real la aplica el backend con el JWT
(Spring Security), la web solo oculta lo que el rol no puede usar.

## Estructura

```
becs/
├── lib/api.ts                  # fetch al backend, sesión JWT y utilidades
├── components/
│   ├── Navegacion.tsx          # menú según el rol
│   ├── RutaProtegida.tsx       # redirige si el rol no tiene acceso
│   └── Panel.tsx               # tablas, detalle y modal de los paneles
└── app/
    ├── login/  registro/  productos/  carrito/
    ├── admin/                  # panel del administrador
    ├── vendedor/               # panel del vendedor
    └── tests/                  # pruebas QUnit de los validadores
```
