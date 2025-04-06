/**
 * events.js - Gerencia eventos principais da aplicação
 * Este módulo centraliza o gerenciamento de eventos da aplicação,
 * configurando listeners e handlers para interações do usuário
 */

import { elements } from './dom.js'
import { shareContent } from './share.js'
import { handleVerification } from './gemini.js'
import { handleClearHistory } from './history.js'
import { showNotification } from './ui.js'
import {
  setContrast,
  changeFontSize,
  changeLineSpacing,
  toggleHighlightLinks
} from './accessibility.js'

/**
 * Gerencia clicks globais da aplicação usando event delegation
 * @param {Event} e - Evento de click
 */
function handleGlobalClicks(e) {
  const target = e.target
  const shareButton = target.closest('[data-share]')
  const contrastButton = target.closest('[data-contrast]')
  const fontButton = target.closest('[data-font-action]')
  const spacingButton = target.closest('[data-spacing]')

  // Botões principais da aplicação
  if (target === elements.verifyButton) {
    handleVerification()
  } else if (target === elements.clearHistoryBtn) {
    handleClearHistory()
  }
  // Botões de compartilhamento
  else if (shareButton) {
    const platform = shareButton.getAttribute('data-share')
    shareContent(platform)
  }
  // Botões de acessibilidade
  else if (contrastButton) {
    const type = contrastButton.getAttribute('data-contrast')
    setContrast(type)
  } else if (fontButton) {
    const action = fontButton.getAttribute('data-font-action')
    changeFontSize(action)
  } else if (spacingButton) {
    const type = spacingButton.getAttribute('data-spacing')
    changeLineSpacing(type)
  }
}

/**
 * Configura handlers para feedback de análise
 * @param {HTMLElement} button - Botão de feedback
 * @param {HTMLElement} section - Seção de feedback
 */
export function handleFeedback(button, section) {
  const verificationId = section.dataset.verificationId
  const feedbackType = button.dataset.feedback

  // Usar verificationId para rastrear qual verificação recebeu feedback
  console.log(`Feedback para verificação ${verificationId}: ${feedbackType}`)

  // Desabilitar os botões após o clique
  section.querySelectorAll('.btn-feedback').forEach(btn => {
    btn.disabled = true
    btn.classList.remove('btn-outline-success', 'btn-outline-danger')
    btn.classList.add('btn-light')
  })

  // Destacar o botão selecionado
  button.classList.remove('btn-light')
  button.classList.add(
    feedbackType === 'positive' ? 'btn-success' : 'btn-danger'
  )

  // Substituir os botões por uma mensagem de agradecimento
  setTimeout(() => {
    section.innerHTML = `
      <div class="text-muted small">
        <i class="fas fa-check-circle text-success"></i>
        Obrigado pelo seu feedback!
      </div>
    `
  }, 1000)

  // Salvar o feedback
  submitFeedback(feedbackType)
}

/**
 * Processa o envio de feedback
 * @param {string} type - Tipo de feedback (positive/negative)
 */
function submitFeedback(type) {
  showNotification('Obrigado pelo seu feedback!', 'success')
  console.log(`Feedback ${type} recebido e processado`)
}

/**
 * Configura todos os event listeners da aplicação
 */
export function setupEventListeners() {
  console.log('Configurando event listeners')

  // Event Delegation para clicks globais
  document.removeEventListener('click', handleGlobalClicks)
  document.addEventListener('click', handleGlobalClicks)

  // Input para ativar/desativar botão de verificação
  if (elements.userInput && elements.verifyButton) {
    elements.userInput.addEventListener('input', () => {
      elements.verifyButton.disabled = !elements.userInput.value.trim()
    })
  }

  // Confirmação de limpar histórico
  const confirmClearHistory = document.getElementById('confirmClearHistory')
  if (confirmClearHistory) {
    confirmClearHistory.addEventListener('click', () => {
      // Limpa o histórico (implementado no módulo history.js)
      window.dispatchEvent(new CustomEvent('clearHistory'))

      // Fecha o modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('clearHistoryModal')
      )
      if (modal) modal.hide()

      // Mostra notificação de sucesso
      showNotification('Histórico apagado com sucesso!', 'success')
    })
  }

  // Monitoramento de conectividade
  window.addEventListener('offline', () =>
    showNotification(
      'Você está offline. Algumas funcionalidades podem estar indisponíveis.'
    )
  )
  window.addEventListener('online', () =>
    showNotification('Conexão restabelecida!')
  )

  // Configurar o toggle de destaque de links
  const highlightLinksToggle = document.getElementById('highlightLinksToggle')
  if (highlightLinksToggle) {
    highlightLinksToggle.addEventListener('change', e => {
      toggleHighlightLinks(e.target.checked)
    })
  }
}

export default {
  setupEventListeners,
  handleFeedback
}
