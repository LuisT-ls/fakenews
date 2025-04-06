/**
 * api.js - Funções relacionadas a chamadas de API
 * Este módulo centraliza as chamadas de API externas
 */

/**
 * Obtém a chave da API do Gemini do servidor
 * @returns {Promise<string>} Chave da API
 */
export async function fetchApiKey() {
  try {
    const keyResponse = await fetch(
      'https://fakenews-sigma.vercel.app/api/getApiKey',
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!keyResponse.ok) {
      console.error('Erro ao obter chave:', await keyResponse.text())
      throw new Error('Não foi possível obter a chave API')
    }

    const { apiKey } = await keyResponse.json()
    return apiKey
  } catch (error) {
    console.error('Falha ao recuperar API key:', error)
    throw error
  }
}

/**
 * Submete feedback para o servidor
 * @param {Object} feedbackData - Dados do feedback
 * @returns {Promise<Object>} Resposta do servidor
 */
export async function submitFeedback(feedbackData) {
  try {
    // Implementação futura: enviar feedback para o servidor
    console.log('Feedback enviado:', feedbackData)
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar feedback:', error)
    throw error
  }
}

export default {
  fetchApiKey,
  submitFeedback
}
