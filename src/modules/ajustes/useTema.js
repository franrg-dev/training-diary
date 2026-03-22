const CLAVE_LS = 'tema'

function aplicarTema(tema) {
  if (tema === 'auto') {
    document.documentElement.removeAttribute('data-tema')
  } else {
    document.documentElement.setAttribute('data-tema', tema)
  }
}

/** Llamar antes de montar React para evitar parpadeo */
export function inicializarTema() {
  const tema = localStorage.getItem(CLAVE_LS) || 'auto'
  aplicarTema(tema)
}

export function getTema() {
  return localStorage.getItem(CLAVE_LS) || 'auto'
}

export function setTema(tema) {
  localStorage.setItem(CLAVE_LS, tema)
  aplicarTema(tema)
}
