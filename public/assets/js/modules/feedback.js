/**
 * feedback.js - Gerenciamento de feedback do usuário
 * Este módulo lida com a coleta e processamento de feedback dos usuários
 */

import { showNotification } from './ui.js'
import { getFromStorage, saveToStorage } from './storage.js'
import { submitFeedback as apiFeedback } from './api.js'

// Constantes
const FEEDBACK_STORAGE_KEY = 'user_feedback_history'

/**
 * Gerencia o feedback do usuário sobre a análise
 * @param {string} verificationId - ID da verificação
 * @param {string} feedbackType - Tipo de feedback (positive/negative)
 * @param {HTMLElement} feedbackSection - Elemento DOM da seção de feedback
 */
export function processFeedback(verificationId, feedbackType, feedbackSection) {
  // Registra o feedback
  recordFeedback(verificationId, feedbackType)

  // Atualiza a UI para refletir que o feedback foi recebido
  updateFeedbackUI(feedbackSection, feedbackType)

  // Tenta enviar o feedback para o servidor (em background)
  sendFeedbackToServer({
    verificationId,
    feedbackType,
    timestamp: new Date().toISOString()
  }).catch(error => {
    console.error('Erro ao enviar feedback para o servidor:', error)
    // Armazena para tentar enviar mais tarde
    storePendingFeedback({
      verificationId,
      feedbackType,
      timestamp: new Date().toISOString()
    })
  })
}

/**
 * Atualiza a UI da seção de feedback
 * @param {HTMLElement} section - Seção de feedback no DOM
 * @param {string} feedbackType - Tipo de feedback (positive/negative)
 */
function updateFeedbackUI(section, feedbackType) {
  if (!section) return

  // Desabilitar os botões após o clique
  section.querySelectorAll('.btn-feedback').forEach(btn => {
    btn.disabled = true
    btn.classList.remove('btn-outline-success', 'btn-outline-danger')
    btn.classList.add('btn-light')
  })

  // Destacar o botão selecionado
  const selectedButton = section.querySelector(
    `[data-feedback="${feedbackType}"]`
  )
  if (selectedButton) {
    selectedButton.classList.remove('btn-light')
    selectedButton.classList.add(
      feedbackType === 'positive' ? 'btn-success' : 'btn-danger'
    )
  }

  // Substituir os botões por uma mensagem de agradecimento
  setTimeout(() => {
    section.innerHTML = `
      <div class="text-muted small">
        <i class="fas fa-check-circle text-success"></i>
        Obrigado pelo seu feedback!
      </div>
    `
  }, 1000)
}

/**
 * Registra o feedback no armazenamento local
 * @param {string} verificationId - ID da verificação
 * @param {string} feedbackType - Tipo de feedback (positive/negative)
 */
function recordFeedback(verificationId, feedbackType) {
  // Recupera histórico existente ou inicia um novo
  const feedbackHistory = getFromStorage(FEEDBACK_STORAGE_KEY, [])

  // Adiciona novo feedback
  feedbackHistory.push({
    verificationId,
    feedbackType,
    timestamp: new Date().toISOString(),
    synced: false
  })

  // Limita o tamanho do histórico (mantém os últimos 50)
  const trimmedHistory = feedbackHistory.slice(-50)

  // Salva de volta no storage
  saveToStorage(FEEDBACK_STORAGE_KEY, trimmedHistory)
}

/**
 * Envia o feedback para o servidor
 * @param {Object} feedbackData - Dados do feedback
 * @returns {Promise} - Promessa da operação
 */
async function sendFeedbackToServer(feedbackData) {
  try {
    await apiFeedback(feedbackData)
    // Marca como sincronizado no histórico local
    updateFeedbackSyncStatus(feedbackData.verificationId, true)
    return true
  } catch (error) {
    console.error('Falha ao enviar feedback:', error)
    throw error
  }
}

/**
 * Armazena feedback pendente para sincronização posterior
 * @param {Object} feedbackData - Dados do feedback
 */
function storePendingFeedback(feedbackData) {
  const pendingFeedback = getFromStorage('pending_feedback', [])
  pendingFeedback.push({
    ...feedbackData,
    attempts: 0,
    lastAttempt: new Date().toISOString()
  })
  saveToStorage('pending_feedback', pendingFeedback)
}

/**
 * Atualiza o status de sincronização de um feedback
 * @param {string} verificationId - ID da verificação
 * @param {boolean} synced - Status de sincronização
 */
function updateFeedbackSyncStatus(verificationId, synced) {
  const feedbackHistory = getFromStorage(FEEDBACK_STORAGE_KEY, [])

  const updatedHistory = feedbackHistory.map(item => {
    if (item.verificationId === verificationId) {
      return { ...item, synced }
    }
    return item
  })

  saveToStorage(FEEDBACK_STORAGE_KEY, updatedHistory)
}

/**
 * Tenta sincronizar feedback pendente
 * Pode ser chamado periodicamente ou quando a conexão é restaurada
 */
export async function syncPendingFeedback() {
  if (!navigator.onLine) return

  const pendingFeedback = getFromStorage('pending_feedback', [])
  if (pendingFeedback.length === 0) return

  // Processa itens pendentes
  const stillPending = []

  for (const feedback of pendingFeedback) {
    try {
      await sendFeedbackToServer({
        verificationId: feedback.verificationId,
        feedbackType: feedback.feedbackType,
        timestamp: feedback.timestamp
      })
      // Se teve sucesso, não adiciona de volta à lista pendente
    } catch (error) {
      // Se falhou, incrementa tentativas e adiciona de volta à lista
      stillPending.push({
        ...feedback,
        attempts: (feedback.attempts || 0) + 1,
        lastAttempt: new Date().toISOString()
      })
    }
  }

  // Atualiza a lista de pendentes
  saveToStorage('pending_feedback', stillPending)

  // Notifica se houve sincronização bem-sucedida
  if (stillPending.length < pendingFeedback.length) {
    showNotification('Feedback sincronizado com sucesso!', 'success')
  }
}

/**
 * Configura ouvinte de eventos para sincronizar quando a conexão for restaurada
 */
export function setupFeedbackSyncListeners() {
  window.addEventListener('online', () => {
    syncPendingFeedback()
  })
}

/**
 * Obtém estatísticas de feedback
 * @returns {Object} - Estatísticas de feedback
 */
export function getFeedbackStats() {
  const feedbackHistory = getFromStorage(FEEDBACK_STORAGE_KEY, [])

  const totalFeedback = feedbackHistory.length
  const positiveFeedback = feedbackHistory.filter(
    f => f.feedbackType === 'positive'
  ).length
  const negativeFeedback = feedbackHistory.filter(
    f => f.feedbackType === 'negative'
  ).length

  const percentagePositive =
    totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0

  return {
    total: totalFeedback,
    positive: positiveFeedback,
    negative: negativeFeedback,
    percentagePositive
  }
}

export default {
  processFeedback,
  syncPendingFeedback,
  setupFeedbackSyncListeners,
  getFeedbackStats
}
