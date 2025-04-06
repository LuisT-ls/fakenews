/**
 * ui.js - Componentes de interface de usuário
 * Este módulo gerencia elementos de UI como notificações, toasts e modais
 */

import { elements } from './dom.js'
import { translateDynamicContent } from '../translations.js'

/**
 * Exibe notificações toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success, info, warning, danger)
 */
export function showNotification(message, type = 'info') {
  const currentLang = document.documentElement.lang
  const translatedMessage = translateDynamicContent(message, currentLang)

  // Verifica se o Toast está disponível (Bootstrap)
  if (typeof bootstrap !== 'undefined' && elements.notificationToast) {
    const toast = new bootstrap.Toast(elements.notificationToast)
    elements.notificationToast.querySelector('.toast-body').textContent =
      translatedMessage
    elements.notificationToast.className = `toast bg-${type}`
    toast.show()
  } else {
    // Fallback para quando bootstrap não está disponível
    console.log(`Notificação (${type}): ${translatedMessage}`)

    // Criar notificação simples caso o elemento toast não exista
    if (!elements.notificationToast) {
      const simpleNotification = document.createElement('div')
      simpleNotification.textContent = translatedMessage
      simpleNotification.className = `simple-notification notification-${type}`
      simpleNotification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background-color: ${getColorByType(type)};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1050;
        animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
      `

      // Adicionar estilos específicos para animação
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
      `
      document.head.appendChild(styleElement)

      document.body.appendChild(simpleNotification)

      // Remover após 3 segundos
      setTimeout(() => {
        simpleNotification.remove()
        styleElement.remove()
      }, 3000)
    }
  }
}

/**
 * Retorna a cor para o tipo de notificação
 * @param {string} type - Tipo da notificação
 * @returns {string} Cor CSS
 */
function getColorByType(type) {
  const colors = {
    success: '#28a745',
    info: '#17a2b8',
    warning: '#ffc107',
    danger: '#dc3545'
  }
  return colors[type] || colors.info
}

/**
 * Inicializa o switch de tema (claro/escuro)
 */
export function initThemeSwitch() {
  console.log('Inicializando switch de tema')
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', theme)

  if (elements.themeSwitcher) {
    const themeIcon = elements.themeSwitcher.querySelector('i')
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
    }

    // Remover event listeners anteriores para evitar duplicação
    elements.themeSwitcher.removeEventListener('click', toggleTheme)

    // Adicionar novo event listener
    elements.themeSwitcher.addEventListener('click', toggleTheme)
    console.log('Event listener de tema configurado')
  } else {
    console.error('Elemento themeSwitcher não encontrado')
  }
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
  console.log('Alternando tema')
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)

  const themeIcon = elements.themeSwitcher.querySelector('i')
  if (themeIcon) {
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
  }
}

export default {
  showNotification,
  initThemeSwitch
}
