export function validarNombre(nombre) {
  if (!nombre) return false;
  const limpio = nombre.trim();
  return limpio.length >= 3 && isNaN(Number(limpio));
}

export function validarPass(contra) {
  if (!contra || contra.length < 4) {
    return false;
  }
  return true;
}

export function validarConfirmacion(contra, contra_conf) {
  if (!contra_conf) {
    return false;
  }
  return contra === contra_conf;
}

export function validarMail(mail) {
  const formato_mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return formato_mail.test(mail);
}

export function calcularTotalCarrito(items) {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}