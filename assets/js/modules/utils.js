/**
 * utils.js - Funções utilitárias
 * Este módulo contém funções utilitárias de uso geral
 */

/**
 * Formata uma data para exibição local
 * @param {string|Date} date - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir o horário
 * @returns {string} Data formatada
 */
export function formatDate(date, includeTime = true) {
  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return dateObj.toLocaleString(
    document.documentElement.lang || 'pt-BR',
    options
  )
}

/**
 * Trunca um texto para um tamanho máximo
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo
 * @param {string} suffix - Sufixo a ser adicionado quando truncado
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + suffix
}

/**
 * Verifica se a aplicação está rodando em um dispositivo móvel
 * @returns {boolean} Verdadeiro se for mobile
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Debounce para limitar a frequência de chamadas de função
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Detecção do idioma do navegador
 * @returns {string} Código do idioma
 */
export function getBrowserLanguage() {
  return navigator.language || navigator.userLanguage || 'pt-BR'
}

/**
 * Valida se uma URL é válida
 * @param {string} url - URL a ser validada
 * @returns {boolean} Verdadeiro se for válida
 */
export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export default {
  formatDate,
  truncateText,
  isMobileDevice,
  debounce,
  getBrowserLanguage,
  isValidUrl
}
