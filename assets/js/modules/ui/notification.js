/**
 * Módulo para gerenciar notificações toast
 */

import { getElements } from '../state/store.js'

/**
 * Exibe notificações toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success, info, warning, danger)
 * @param {number} duration - Duração em ms da notificação (opcional)
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const elements = getElements()

  // Verifica se o elemento toast existe
  if (!elements.notificationToast) {
    console.error('Elemento toast não encontrado')
    return
  }

  // Verifica o idioma atual
  const currentLang = document.documentElement.lang || 'pt'

  // Traduzir mensagem se necessário (implementação simplificada)
  // Em um cenário real, usaria o módulo de tradução completo
  const translatedMessage =
    currentLang === 'pt' ? message : translateMessage(message)

  // Configura o toast
  const toast = new bootstrap.Toast(elements.notificationToast, {
    delay: duration
  })

  // Define o conteúdo e estilo do toast
  elements.notificationToast.querySelector('.toast-body').textContent =
    translatedMessage
  elements.notificationToast.className = `toast bg-${type}`

  // Exibe o toast
  toast.show()
}

/**
 * Função básica para tradução de mensagens
 * Em uma implementação real, isso seria mais robusto
 * @param {string} message - Mensagem a ser traduzida
 * @returns {string} Mensagem traduzida
 */
function translateMessage(message) {
  // Implementação simplificada - em uma aplicação real,
  // usaria um sistema mais completo de tradução
  const translations = {
    'Ocorreu um erro durante a verificação. Tente novamente.':
      'An error occurred during verification. Please try again.',
    'Obrigado pelo seu feedback!': 'Thank you for your feedback!',
    'Você está offline. Algumas funcionalidades podem estar indisponíveis.':
      'You are offline. Some features may be unavailable.',
    'Conexão restabelecida!': 'Connection restored!',
    'Histórico apagado com sucesso!': 'History successfully cleared!'
  }

  return translations[message] || message
}

/**
 * Exibe notificação de erro
 * @param {string} message - Mensagem de erro
 */
export function showErrorNotification(message) {
  showNotification(message, 'danger', 5000)
}

/**
 * Exibe notificação de sucesso
 * @param {string} message - Mensagem de sucesso
 */
export function showSuccessNotification(message) {
  showNotification(message, 'success')
}

/**
 * Exibe notificação de alerta
 * @param {string} message - Mensagem de alerta
 */
export function showWarningNotification(message) {
  showNotification(message, 'warning', 4000)
}
