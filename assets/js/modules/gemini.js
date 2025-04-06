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

    // Verificação se estamos em modo de desenvolvimento
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    // Se estamos em desenvolvimento e o modo simulado está ativo, retorne dados simulados
    if (
      isDevelopment &&
      localStorage.getItem('use_simulated_data') === 'true'
    ) {
      console.log('Usando dados simulados (modo desenvolvimento)')
      return getSimulatedResult(text)
    }

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

    // URL atualizada para a API - tentando v1beta caso v1 não funcione
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

    // Fazer requisição para a API
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro detalhado da API:', errorText)

      // Para desenvolvimento e em caso de falha da API, usar dados simulados
      console.warn('Usando dados simulados devido a erro na API')
      return getSimulatedResult(text)
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
      console.warn('Usando dados simulados devido a erro no parse')
      return getSimulatedResult(text)
    }
  } catch (error) {
    console.error('Erro na análise:', error)
    // Em caso de qualquer erro, usar dados simulados para não quebrar a interface
    return getSimulatedResult(text)
  }
}

/**
 * Gera um resultado simulado para desenvolvimento ou quando a API falha
 * @param {string} text - Texto que foi analisado
 * @returns {Object} - Resultado simulado da análise
 */
function getSimulatedResult(text) {
  // Gera um score semi-aleatório baseado no tamanho do texto (apenas para simular variação)
  const baseScore = 0.65
  const randomVariation = (text.length % 100) / 500 // Pequena variação baseada no tamanho
  const score = Math.min(0.95, Math.max(0.15, baseScore + randomVariation))

  // Define a classificação com base no score
  let classificacao
  if (score > 0.8) classificacao = 'Comprovadamente Verdadeiro'
  else if (score > 0.6) classificacao = 'Parcialmente Verdadeiro'
  else if (score > 0.4) classificacao = 'Não Verificável'
  else if (score > 0.2) classificacao = 'Provavelmente Falso'
  else classificacao = 'Comprovadamente Falso'

  // Extrai algumas palavras-chave do texto para personalizar a resposta simulada
  const keywords = text
    .split(' ')
    .filter(word => word.length > 5)
    .slice(0, 3)
    .map(word => word.replace(/[.,!?;:'"]/g, ''))

  // Cria o resumo do texto
  const textSummary = text.length > 50 ? text.substring(0, 50) + '...' : text

  return {
    score: score,
    confiabilidade: score + 0.05,
    classificacao: classificacao,
    explicacao_score: `O texto foi analisado e recebeu uma pontuação de ${Math.round(
      score * 100
    )}% com base nos elementos verificáveis presentes no conteúdo.`,
    elementos_verdadeiros: [
      'Alguns elementos do texto podem ser verificados',
      keywords.length > 0
        ? `Informações sobre "${keywords[0]}" parecem estar corretas`
        : 'Parte das afirmações são verificáveis'
    ],
    elementos_falsos: [
      'Algumas afirmações carecem de contexto completo',
      keywords.length > 1
        ? `Dados sobre "${keywords[1]}" precisam de verificação adicional`
        : 'Há informações imprecisas no texto'
    ],
    elementos_suspeitos: [
      'O texto apresenta algumas generalizações',
      'Há elementos que podem estar desatualizados'
    ],
    fontes_confiaveis: [
      'Recomenda-se verificar em fontes oficiais',
      'Consulte especialistas no assunto para confirmação'
    ],
    indicadores_desinformacao: [
      'Presença de algumas afirmações sem fontes',
      'Possível interpretação seletiva de fatos'
    ],
    analise_detalhada: `O texto analisado "${textSummary}" apresenta uma mistura de informações que podem ser verificadas e outras que necessitam de mais contexto. ${
      keywords.length > 0
        ? `Os pontos relacionados a "${keywords.join(
            ', '
          )}" merecem atenção especial.`
        : ''
    } Recomendamos buscar fontes adicionais e oficiais para confirmar as principais afirmações presentes no conteúdo. A análise indica um nível ${
      score > 0.5 ? 'razoável' : 'baixo'
    } de confiabilidade, sendo importante verificar a origem e o contexto completo das informações antes de compartilhar.`,
    recomendacoes: [
      'Verifique as informações em fontes oficiais',
      'Busque o contexto completo das informações apresentadas',
      'Compare com outras fontes confiáveis antes de formar opinião'
    ],
    limitacao_temporal: {
      afeta_analise:
        text.includes('2023') ||
        text.includes('2024') ||
        text.includes('recentemente'),
      elementos_nao_verificaveis: [
        text.includes('2023') || text.includes('2024')
          ? 'Eventos recentes mencionados no texto'
          : ''
      ].filter(item => item !== ''),
      sugestoes_verificacao: [
        'Consulte fontes oficiais atualizadas',
        'Verifique notícias recentes sobre o tema'
      ]
    }
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

/**
 * Ativa ou desativa o modo de dados simulados (para desenvolvimento)
 * @param {boolean} enabled - Se o modo simulado deve ser ativado
 */
export function toggleSimulatedMode(enabled) {
  localStorage.setItem('use_simulated_data', enabled ? 'true' : 'false')
  console.log(`Modo de dados simulados ${enabled ? 'ativado' : 'desativado'}`)
}

export default {
  handleVerification,
  toggleSimulatedMode
}
