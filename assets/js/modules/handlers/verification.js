/**
 * Módulo responsável pela lógica de verificação e processamento dos resultados
 */

import { checkWithGemini } from '../api/gemini.js'
import { getElements } from '../state/store.js'
import { displayResults, showLoadingState } from '../ui/display.js'
import { saveVerification } from '../utils/storage.js'
import { showNotification } from '../ui/notification.js'

/**
 * Gerencia o processo de verificação do texto
 * Coordena a interação com a API e atualização da UI
 */
export async function handleVerification() {
  const elements = getElements()
  const text = elements.userInput.value.trim()

  if (!text) return

  showLoadingState(true)

  try {
    // Chama API do Gemini para análise
    const geminiResult = await checkWithGemini(text)

    // Cria objeto de verificação com o resultado
    const verification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      geminiAnalysis: geminiResult,
      overallScore: geminiResult.score
    }

    // Exibe os resultados e salva a verificação
    displayResults(verification)
    saveVerification(verification)
  } catch (error) {
    console.error('Erro durante a verificação:', error)
    showNotification(
      'Ocorreu um erro durante a verificação. Tente novamente.',
      'danger'
    )
  } finally {
    showLoadingState(false)
  }
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
 * Submete o feedback do usuário
 * @param {string} type - Tipo de feedback (positive/negative)
 */
export function submitFeedback(type) {
  showNotification('Obrigado pelo seu feedback!', 'success')
  console.log(`Feedback ${type} recebido e processado`)

  // Aqui poderia ter uma implementação para enviar o feedback a um servidor
}
