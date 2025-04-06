/**
 * gemini.js - Integração com API Gemini
 * Este módulo gerencia a integração com a API do Gemini para análise de textos
 */

import { elements } from './dom.js'
import { saveVerification } from './history.js'
import { showNotification } from './ui.js'
import { fetchApiKey } from './api.js'

/**
 * Gerencia o processo de verificação do texto
 * Coordena a interação com a API e atualização da UI
 */
export async function handleVerification() {
  const text = elements.userInput.value.trim()
  if (!text) return

  showLoadingState(true)

  try {
    const geminiResult = await checkWithGemini(text)
    const verification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      geminiAnalysis: geminiResult,
      overallScore: geminiResult.score
    }

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
 * Realiza a verificação do texto usando a API do Gemini
 * @param {string} text - Texto a ser verificado
 * @returns {Promise<Object>} Resultado da análise
 */
async function checkWithGemini(text) {
  try {
    // Obter chave API do módulo API
    const apiKey = await fetchApiKey()
    console.log('API Key obtida com sucesso') // Não exibir a chave no console

    // Linguagem atual
    const currentLang = document.documentElement.lang || 'pt'
    const promptLang = currentLang === 'pt' ? 'em português' : 'in English'

    // Data atual para comparação
    const currentDate = new Date()

    // Prompt atualizado com consciência temporal
    const prompt = `Analise detalhadamente o seguinte texto para verificar sua veracidade. 
    Observe que sua base de conhecimento vai até 2022, então para eventos após essa data, 
    indique claramente essa limitação na análise e foque nos elementos verificáveis do texto
    que não dependem do período temporal. Forneça a resposta ${promptLang}:
    
    Data atual: ${currentDate.toISOString()}
    Texto para análise: "${text}"

Return only a valid JSON object with this exact structure, without any additional text:
{
  "score": [0-1],
  "confiabilidade": [0-1],
  "classificacao": ["Comprovadamente Verdadeiro", "Parcialmente Verdadeiro", "Não Verificável", "Provavelmente Falso", "Comprovadamente Falso"],
  "explicacao_score": "string",
  "elementos_verdadeiros": ["array"],
  "elementos_falsos": ["array"],
  "elementos_suspeitos": ["array"],
  "fontes_confiaveis": ["array"],
  "indicadores_desinformacao": ["array"],
  "analise_detalhada": "string",
  "recomendacoes": ["array"],
  "limitacao_temporal": {
    "afeta_analise": boolean,
    "elementos_nao_verificaveis": ["array"],
    "sugestoes_verificacao": ["array"]
  }
}`

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 16,
        maxOutputTokens: 2048
      }
    }

    // Log do corpo da requisição para debug (sem expor a chave)
    console.log('Enviando requisição para a API Gemini')

    // Fazer requisição para a API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro detalhado da API:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Resposta da API recebida com sucesso')

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!rawText) {
      console.error('Estrutura da resposta:', JSON.stringify(data))
      throw new Error('Resposta inválida da API')
    }

    const cleanText = rawText.replace(/```json|```/g, '').trim()

    try {
      const result = JSON.parse(cleanText)
      return result
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.error('Texto recebido:', cleanText)
      throw new Error('Formato de resposta inválido')
    }
  } catch (error) {
    console.error('Erro na análise:', error)
    throw error
  }
}

/**
 * Controla o estado de loading da interface
 * @param {boolean} loading - Estado de carregamento
 */
function showLoadingState(loading) {
  elements.verifyButton.disabled = loading
  elements.spinner.classList.toggle('d-none', !loading)
  elements.verifyButton.querySelector('span').textContent = loading
    ? 'Verificando...'
    : 'Verificar Agora'
}

export default {
  handleVerification
}
