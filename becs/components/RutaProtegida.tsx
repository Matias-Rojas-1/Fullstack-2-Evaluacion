"use client";

/* Protege una página según el rol. Si el usuario no tiene permiso
 * lo redirige: sin sesión → /login, con otro rol → su página de inicio.
 * (La protección real la hace el backend con el JWT; esto solo evita
 * que se muestren vistas que no le corresponden.) */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DatosSesion, paginaInicio, useSesion } from "@/lib/api";

interface Props {
  permitir: (sesion: DatosSesion) => boolean;
  children: (sesion: DatosSesion) => React.ReactNode;
}

export default function RutaProtegida({ permitir, children }: Props) {
  const { sesion, lista } = useSesion();
  const router = useRouter();
  const autorizado = !!sesion && permitir(sesion);

  useEffect(() => {
    if (!lista || autorizado) return;
    router.replace(sesion ? paginaInicio(sesion) : "/login");
  }, [lista, autorizado, sesion, router]);

  if (!autorizado || !sesion) {
    return (
      <div className="container py-5 text-center text-muted">
        {lista ? "Redirigiendo…" : "Cargando…"}
      </div>
    );
  }
  return <>{children(sesion)}</>;
}
