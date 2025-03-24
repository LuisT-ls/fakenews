/**
 * Módulo para gerenciar eventos globais da aplicação
 * Utiliza padrão de event delegation para melhor performance
 */

import { getElements } from '../state/store.js'
import { handleVerification } from './verification.js'
import { handleClearHistory } from './historyManager.js'
import { shareContent } from '../analytics/sharing.js'
import { showNotification } from '../ui/notification.js'
import { addDynamicStyles } from '../ui/display.js'

/**
 * Configura todos os event listeners da aplicação
 */
export function setupEventListeners() {
  const elements = getElements()

  // Event Delegation - gerencia cliques globais
  document.addEventListener('click', handleGlobalClicks)

  // Monitora input para habilitar/desabilitar botão de verificação
  elements.userInput.addEventListener('input', () => {
    elements.verifyButton.disabled = !elements.userInput.value.trim()
  })

  // Listener para o botão de confirmar limpeza do histórico
  document
    .getElementById('confirmClearHistory')
    ?.addEventListener('click', () => {
      // Limpa o histórico
      clearHistoryConfirmed()
    })

  // Listeners de conectividade
  window.addEventListener('offline', () =>
    showNotification(
      'Você está offline. Algumas funcionalidades podem estar indisponíveis.'
    )
  )
  window.addEventListener('online', () =>
    showNotification('Conexão restabelecida!')
  )

  // Configurar o conteúdo expansível
  setupExpandableContent()

  // Inicializar os skeletons de carregamento
  initSkeletons()

  // Adicionar estilos dinâmicos para animações e transições
  addDynamicStyles()
}

/**
 * Gerencia clicks globais da aplicação usando event delegation
 * @param {Event} e - Evento de click
 */
export function handleGlobalClicks(e) {
  const elements = getElements()
  const target = e.target
  const shareButton = target.closest('[data-share]')

  if (target === elements.verifyButton) {
    handleVerification()
  } else if (target === elements.clearHistoryBtn) {
    handleClearHistory()
  } else if (shareButton) {
    const platform = shareButton.getAttribute('data-share')
    shareContent(platform)
  }
}

/**
 * Confirma e executa a limpeza do histórico
 */
function clearHistoryConfirmed() {
  // Importação dinâmica para evitar referências circulares
  import('../utils/storage.js').then(({ clearHistory }) => {
    // Executa a limpeza
    clearHistory()

    // Fecha o modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById('clearHistoryModal')
    )
    modal.hide()

    // Mostra notificação de sucesso
    showNotification('Histórico apagado com sucesso!', 'success')
  })
}

/**
 * Configura o comportamento do conteúdo expansível
 */
function setupExpandableContent() {
  const trigger = document.querySelector('.expand-trigger')
  const content = document.querySelector('.expand-content')

  if (!trigger || !content) return

  trigger.addEventListener('click', function () {
    this.classList.toggle('active')
    content.classList.toggle('show')

    // Smooth scroll to content when expanding
    if (content.classList.contains('show')) {
      setTimeout(() => {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  })
}

/**
 * Inicializa os elementos de skeleton loading
 */
function initSkeletons() {
  const skeletons = document.querySelectorAll('.skeleton-text')
  skeletons.forEach(skeleton => {
    const content = skeleton.dataset.content
    if (content) {
      skeleton.outerHTML = content
    }
  })
}
