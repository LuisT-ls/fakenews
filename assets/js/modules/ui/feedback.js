/**
 * Módulo para gerenciar o feedback do usuário sobre análises
 */

import { submitFeedback } from '../handlers/verification.js'

/**
 * Gerencia o feedback do usuário sobre a análise
 * @param {HTMLElement} button - Botão de feedback clicado
 * @param {HTMLElement} feedbackSection - Seção de feedback no DOM
 */
export function handleFeedback(button, feedbackSection) {
  // Obtém o ID da verificação e o tipo de feedback
  const verificationId = feedbackSection.dataset.verificationId
  const feedbackType = button.dataset.feedback

  // Desabilitar os botões após o clique
  feedbackSection.querySelectorAll('.btn-feedback').forEach(btn => {
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
    feedbackSection.innerHTML = `
      <div class="text-muted small">
        <i class="fas fa-check-circle text-success"></i>
        Obrigado pelo seu feedback!
      </div>
    `
  }, 1000)

  // Salvar o feedback
  submitFeedback(feedbackType)

  // Em uma implementação real, poderíamos enviar o feedback para um servidor:
  // saveFeedbackToServer(verificationId, feedbackType);
}

/**
 * Envia o feedback para o servidor (simulação)
 * @param {string} verificationId - ID da verificação
 * @param {string} feedbackType - Tipo de feedback (positive/negative)
 */
async function saveFeedbackToServer(verificationId, feedbackType) {
  try {
    // Simulação de envio para API
    console.log(
      `Enviando feedback para o servidor: ID ${verificationId}, Tipo: ${feedbackType}`
    )

    // Em uma implementação real, seria uma chamada de API
    /*
    await fetch('https://api.exemplo.com/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verificationId,
        feedbackType,
        timestamp: new Date().toISOString()
      })
    });
    */

    return true
  } catch (error) {
    console.error('Erro ao enviar feedback:', error)
    return false
  }
}

/**
 * Verifica se um usuário já deu feedback em uma verificação específica
 * @param {string} verificationId - ID da verificação
 * @returns {boolean} True se já deu feedback, False caso contrário
 */
export function hasUserGivenFeedback(verificationId) {
  // Verificar se há feedback salvo localmente para esta verificação
  const feedbackHistory = JSON.parse(
    localStorage.getItem('feedbackHistory') || '{}'
  )
  return !!feedbackHistory[verificationId]
}

/**
 * Salva o estado de feedback no localStorage
 * @param {string} verificationId - ID da verificação
 * @param {string} feedbackType - Tipo de feedback (positive/negative)
 */
export function saveFeedbackLocally(verificationId, feedbackType) {
  const feedbackHistory = JSON.parse(
    localStorage.getItem('feedbackHistory') || '{}'
  )

  feedbackHistory[verificationId] = {
    type: feedbackType,
    timestamp: new Date().toISOString()
  }

  localStorage.setItem('feedbackHistory', JSON.stringify(feedbackHistory))
}
