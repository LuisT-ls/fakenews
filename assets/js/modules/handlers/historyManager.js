/**
 * Módulo para gerenciar o histórico de verificações
 */

import { getVerificationHistory } from '../state/store.js'
import { showNotification } from '../ui/notification.js'
import { clearHistory } from '../utils/storage.js'

/**
 * Gerencia a limpeza do histórico
 */
export function handleClearHistory() {
  const history = getVerificationHistory()

  // Verifica se há itens no histórico
  if (history.length === 0) {
    // Se não houver histórico, mostra um modal diferente
    showEmptyHistoryModal()
    return
  }

  // Se houver histórico, mostra o modal de confirmação normal
  const modal = new bootstrap.Modal(
    document.getElementById('clearHistoryModal')
  )
  modal.show()
}

/**
 * Exibe um modal informando que o histórico está vazio
 */
function showEmptyHistoryModal() {
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
}

/**
 * Exporta verificações em formato JSON
 * @returns {string} Dados do histórico em formato JSON
 */
export function exportHistory() {
  const history = getVerificationHistory()
  return JSON.stringify(history, null, 2)
}

/**
 * Importa verificações a partir de um JSON válido
 * @param {string} jsonData - Dados em formato JSON
 * @returns {boolean} true se importado com sucesso, false caso contrário
 */
export function importHistory(jsonData) {
  try {
    const parsedData = JSON.parse(jsonData)

    // Verifica se é um array
    if (!Array.isArray(parsedData)) {
      throw new Error('Formato inválido: não é um array')
    }

    // Verifica se os objetos têm a estrutura correta
    const validData = parsedData.every(
      item =>
        item.id &&
        item.timestamp &&
        item.text &&
        item.geminiAnalysis &&
        typeof item.overallScore === 'number'
    )

    if (!validData) {
      throw new Error('Formato inválido: estrutura incorreta')
    }

    // Importa o histórico
    localStorage.setItem('verificationHistory', jsonData)

    // Recarrega a página para aplicar as mudanças
    window.location.reload()

    return true
  } catch (error) {
    console.error('Erro ao importar histórico:', error)
    showNotification(
      'Não foi possível importar o histórico. Verifique o formato do arquivo.',
      'danger'
    )
    return false
  }
}

/**
 * Limpa o histórico de verificações após confirmação
 */
export function clearHistoryConfirmed() {
  // Limpa o histórico
  clearHistory()

  // Fecha o modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById('clearHistoryModal')
  )
  modal.hide()

  // Mostra notificação de sucesso
  showNotification('Histórico apagado com sucesso!', 'success')
}
