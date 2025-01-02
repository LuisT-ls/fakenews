const fetch = require('node-fetch')

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Debug inicial
  console.log('=== Debug Info ===')
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY)
  console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0)

  // Tratar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Verificar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Texto não fornecido' })
    }

    console.log('Verificando chave da API:', !!process.env.GEMINI_API_KEY)

    const prompt = `Análise detalhada do seguinte texto para verificar sua veracidade:
    "${text}"
    
    Retorne apenas um objeto JSON válido com esta estrutura exata, sem texto adicional:
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
      "recomendacoes": ["array"]
    }`

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GEMINI_API_KEY}`
    }
    console.log('Request headers:', {
      ...headers,
      Authorization: headers.Authorization
        ? 'Bearer [PRIMEIROS_5_CHARS]' + headers.Authorization.slice(5, 10)
        : 'undefined'
    })

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      {
        method: 'POST',
        headers,
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

    console.log('Gemini API Response Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error Response:', errorText)
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inválida da API Gemini')
    }

    const result = JSON.parse(data.candidates[0].content.parts[0].text.trim())
    res.status(200).json(result)
  } catch (error) {
    console.error('Erro completo:', error)
    res.status(500).json({
      error: 'Erro ao processar a solicitação',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
