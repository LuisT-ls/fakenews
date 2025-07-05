/**
 * history.js - Gerenciamento do histórico de verificações
 * Este módulo gerencia o histórico de verificações do usuário,
 * incluindo armazenamento, recuperação e exibição
 */

import { elements } from './dom.js'
import { displayResults } from './rendering.js'
import { showNotification } from './ui.js'

// Estado global do histórico
let verificationHistory = []

/**
 * Salva uma verificação no histórico
 * @param {Object} verification - Objeto de verificação a ser salvo
 */
export function saveVerification(verification) {
  verificationHistory.unshift(verification)
  if (verificationHistory.length > 10) verificationHistory.pop()
  localStorage.setItem(
    'verificationHistory',
    JSON.stringify(verificationHistory)
  )
  updateHistoryDisplay()
  displayResults(verification)
}

/**
 * Carrega o histórico de verificações do localStorage
 */
export function loadVerificationHistory() {
  try {
    verificationHistory =
      JSON.parse(localStorage.getItem('verificationHistory')) || []
    updateHistoryDisplay()
  } catch (error) {
    console.error('Erro ao carregar histórico:', error)
    verificationHistory = []
  }
}

/**
 * Atualiza a exibição do histórico na interface com animação
 * Exibe uma mensagem quando não há histórico ou lista as verificações realizadas
 */
function updateHistoryDisplay() {
  // Se não houver histórico
  if (verificationHistory.length === 0) {
    // Animação de fade-out
    elements.verificationsHistory.style.opacity = '0'
    setTimeout(() => {
      elements.verificationsHistory.innerHTML =
        '<p class="text-center text-muted">Nenhuma verificação realizada</p>'
      // Animação de fade-in
      elements.verificationsHistory.style.opacity = '1'
    }, 300)
  }
  // Se houver histórico
  else {
    // Se a lista já estiver visível, não precisa de animação
    if (elements.verificationsHistory.style.opacity !== '0') {
      elements.verificationsHistory.innerHTML = generateHistoryHTML()
    }
    // Se estiver invisível (após limpeza por exemplo), usa animação
    else {
      setTimeout(() => {
        elements.verificationsHistory.innerHTML = generateHistoryHTML()
        elements.verificationsHistory.style.opacity = '1'
      }, 300)
    }
  }
}

/**
 * Gera o HTML para a lista de histórico
 * @returns {string} HTML da lista de histórico
 */
function generateHistoryHTML() {
  return verificationHistory
    .map(
      verification => `
      <div class="list-group-item history-item" data-verification-id="${
        verification.id
      }">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">${new Date(
            verification.timestamp
          ).toLocaleString()}</small>
          <span class="badge bg-${getScoreClass(verification.overallScore)}">
            ${Math.round(verification.overallScore * 100)}%
          </span>
        </div>
        <p class="mb-1 text-truncate">${verification.text}</p>
      </div>
    `
    )
    .join('')
}

/**
 * Determina a classe CSS baseada no score
 * @param {number} score - Score da verificação (0-1)
 * @returns {string} Classe CSS correspondente
 */
export function getScoreClass(score) {
  return score >= 0.7 ? 'success' : score >= 0.4 ? 'warning' : 'danger'
}

/**
 * Gerencia a limpeza do histórico
 */
export function handleClearHistory() {
  // Verifica se há itens no histórico
  if (verificationHistory.length === 0) {
    // Se não houver histórico, mostra um modal diferente
    const modalContent = `
      <div class="modal fade" id="emptyHistoryModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title">
                <i class="fas fa-info-circle text-info me-2"></i>
                Histórico Vazio
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="mb-4">
                <span class="fa-stack fa-2x">
                  <i class="fas fa-circle fa-stack-2x text-info"></i>
                  <i class="fas fa-inbox fa-stack-1x fa-inverse"></i>
                </span>
              </div>
              <h6 class="mb-3">Não há histórico para apagar</h6>
              <p class="text-muted mb-0">Realize algumas verificações primeiro para construir seu histórico.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">
                <i class="fas fa-check me-2"></i>
                Entendi
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remove qualquer instância anterior do modal
    const existingModal = document.getElementById('emptyHistoryModal')
    if (existingModal) {
      existingModal.remove()
    }

    // Adiciona o novo modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalContent)

    // Mostra o modal
    const modal = new bootstrap.Modal(
      document.getElementById('emptyHistoryModal')
    )
    modal.show()

    // Remove o modal do DOM após ser fechado
    document
      .getElementById('emptyHistoryModal')
      .addEventListener('hidden.bs.modal', function () {
        this.remove()
      })

    return
  }

  // Se houver histórico, mostra o modal de confirmação normal
  const modal = new bootstrap.Modal(
    document.getElementById('clearHistoryModal')
  )
  modal.show()
}

/**
 * Limpa completamente o histórico
 * Handler para o evento customizado 'clearHistory'
 */
export function clearHistory() {
  verificationHistory = []
  localStorage.removeItem('verificationHistory')
  updateHistoryDisplay()
  showNotification('Histórico apagado com sucesso!', 'success')
}

// Listener para o evento customizado de limpar histórico
window.addEventListener('clearHistory', clearHistory)

/**
 * Carrega e exibe uma verificação específica do histórico
 * @param {number} id - ID da verificação a ser carregada
 */
export function loadVerificationById(id) {
  const verification = verificationHistory.find(v => v.id === parseInt(id))
  if (verification) {
    displayResults(verification)
    elements.resultSection.classList.remove('d-none')
    elements.resultSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// Função para configurar event listeners de histórico
export function setupHistoryEvents() {
  // Listener para cliques em itens do histórico (usando event delegation)
  document.addEventListener('click', e => {
    const historyItem = e.target.closest('.history-item')
    if (historyItem) {
      const id = historyItem.dataset.verificationId
      if (id) loadVerificationById(parseInt(id))
    }
  })
}

export default {
  loadVerificationHistory,
  saveVerification,
  getScoreClass,
  handleClearHistory,
  clearHistory,
  setupHistoryEvents
}
