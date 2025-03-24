/**
 * Módulo para comunicação com a API do Gemini
 * Centraliza todas as operações de chamadas à API
 */

/**
 * Realiza a verificação do texto usando a API do Gemini
 * @param {string} text - Texto a ser verificado
 * @returns {Promise<Object>} Resultado da análise
 */
export async function checkWithGemini(text) {
  try {
    // Obter chave API
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

    // Linguagem atual
    const currentLang = document.documentElement.lang || 'pt'
    const promptLang = currentLang === 'pt' ? 'em português' : 'in English'

    // Data atual para comparação
    const currentDate = new Date()
    const analysisDate = new Date(2022, 11, 31) // Fim de 2022

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

    // Fazer requisição para a API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.1,
            topK: 16,
            maxOutputTokens: 2048
          }
        })
      }
    )

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!rawText) {
      throw new Error('Resposta inválida da API')
    }

    const cleanText = rawText.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleanText)

    // Ajustar score e classificação baseado na limitação temporal
    if (result.limitacao_temporal?.afeta_analise) {
      // Se houver limitação temporal significativa, ajustar para "Não Verificável"
      // apenas se a limitação for o fator principal
      if (
        result.elementos_nao_verificaveis?.length >
        result.elementos_verdadeiros?.length
      ) {
        result.classificacao = 'Não Verificável'
        result.score = 0.5
        result.confiabilidade = 0.5
      }
    }

    return result
  } catch (error) {
    console.error('Erro na análise:', error)
    throw error
  }
}
