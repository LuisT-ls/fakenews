document.addEventListener('DOMContentLoaded', function () {
  const userInput = document.getElementById('userInput')
  const verifyButton = document.getElementById('verifyButton')
  const resultSection = document.getElementById('result-section')
  const resultDiv = document.getElementById('result')

  // Configuração das APIs
  const GOOGLE_FACT_CHECK_API_KEY = 'AIzaSyD59PUUAWUxhDD1x-2maOAmdJCANoM06hQ'
  const NEWS_API_KEY = 'dd9ac3ec04284a2eab2a972b11919579'

  async function checkFactualAccuracy(text) {
    try {
      // 1. Google Fact Check API
      const googleFactCheckUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${GOOGLE_FACT_CHECK_API_KEY}&query=${encodeURIComponent(
        text
      )}`
      const factCheckResponse = await fetch(googleFactCheckUrl)
      const factCheckData = await factCheckResponse.json()

      // 2. NewsAPI para verificar fontes confiáveis
      const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        text
      )}&apiKey=${NEWS_API_KEY}&language=pt`
      const newsResponse = await fetch(newsApiUrl)
      const newsData = await newsResponse.json()

      return {
        factCheckResults: factCheckData,
        newsResults: newsData
      }
    } catch (error) {
      console.error('Error during fact checking:', error)
      return null
    }
  }

  async function analyzeContent(text) {
    // Análise básica de padrões suspeitos
    const basicAnalysis = analyzeBasicPatterns(text)

    // Análise factual usando APIs
    const factualAnalysis = await checkFactualAccuracy(text)

    return combineAnalysis(basicAnalysis, factualAnalysis)
  }

  function analyzeBasicPatterns(text) {
    const textLower = text.toLowerCase()
    let suspectPatterns = 0
    const patterns = {
      clickbait: [
        'você não vai acreditar',
        'impressionante',
        'chocante',
        'inacreditável',
        'surreal'
      ],
      urgency: [
        'urgente',
        'compartilhe agora',
        'precisa ver isso',
        'antes que apaguem'
      ],
      vagueSources: [
        'dizem que',
        'estudos dizem',
        'cientistas descobriram',
        'médicos afirmam',
        'fonte confiável'
      ],
      exaggeration: [
        'revolucionário',
        'milagroso',
        'cura tudo',
        '100% garantido',
        'segredo revelado'
      ]
    }

    let matchedPatterns = []
    Object.entries(patterns).forEach(([category, patternList]) => {
      patternList.forEach(pattern => {
        if (textLower.includes(pattern)) {
          suspectPatterns++
          matchedPatterns.push({ category, pattern })
        }
      })
    })

    return {
      patternScore: suspectPatterns / 15, // Ajustado para novo peso
      matchedPatterns
    }
  }

  function combineAnalysis(basicAnalysis, factualAnalysis) {
    if (!factualAnalysis) {
      return {
        riskLevel: 'Indeterminado',
        confidence: 0,
        explanation:
          'Não foi possível realizar uma verificação completa. Por favor, tente novamente.'
      }
    }

    // Análise de fact-checking
    const factCheckScore = calculateFactCheckScore(
      factualAnalysis.factCheckResults
    )

    // Análise de notícias
    const newsScore = calculateNewsScore(factualAnalysis.newsResults)

    // Pesos ajustados sem OpenAI
    const finalScore =
      factCheckScore * 0.5 +
      newsScore * 0.3 +
      (1 - basicAnalysis.patternScore) * 0.2

    return generateResult(finalScore, {
      factualAnalysis,
      basicAnalysis
    })
  }

  function calculateFactCheckScore(factCheckResults) {
    if (!factCheckResults || !factCheckResults.claims) return 0.5

    // Implementa lógica de pontuação baseada nos resultados do fact-check
    let score = 0.5 // Pontuação neutra padrão
    const claims = factCheckResults.claims

    if (claims.length > 0) {
      const ratings = claims.map(claim => {
        // Converte o rating textual em valor numérico
        switch (claim.rating?.toLowerCase()) {
          case 'true':
            return 1
          case 'mostly true':
            return 0.75
          case 'mixed':
            return 0.5
          case 'mostly false':
            return 0.25
          case 'false':
            return 0
          default:
            return 0.5
        }
      })

      score = ratings.reduce((a, b) => a + b, 0) / ratings.length
    }

    return score
  }

  function calculateNewsScore(newsResults) {
    if (!newsResults || !newsResults.articles) return 0.5

    const articles = newsResults.articles
    if (articles.length === 0) return 0.5

    // Lista de fontes confiáveis
    const trustedSources = [
      'g1.globo.com',
      'bbc',
      'reuters',
      'folha.uol.com.br',
      'estadao.com.br',
      'oglobo.globo.com'
    ]

    // Calcula pontuação baseada em fontes confiáveis
    const trustedArticles = articles.filter(article =>
      trustedSources.some(source => article.url.toLowerCase().includes(source))
    )

    return 0.5 + (trustedArticles.length / articles.length) * 0.5
  }

  function generateResult(score, analysisData) {
    let riskLevel, confidence

    if (score >= 0.8) {
      riskLevel = 'Baixo risco de Fake News'
      confidence = 'Alta'
    } else if (score >= 0.6) {
      riskLevel = 'Risco moderado - Verificação adicional recomendada'
      confidence = 'Média'
    } else {
      riskLevel = 'Alto risco de Fake News'
      confidence = 'Alta'
    }

    return {
      riskLevel,
      confidence,
      score,
      analysis: analysisData
    }
  }

  function generateFactCheckList(factCheckResults) {
    if (
      !factCheckResults ||
      !factCheckResults.claims ||
      factCheckResults.claims.length === 0
    ) {
      return '<li class="list-group-item">Nenhuma verificação de fatos encontrada para esta informação específica.</li>'
    }

    return factCheckResults.claims
      .map(
        claim => `
          <li class="list-group-item">
              <strong>Verificado por:</strong> ${claim.claimReview[0].publisher.name}<br>
              <strong>Conclusão:</strong> ${claim.claimReview[0].textualRating}
          </li>
      `
      )
      .join('')
  }

  function generateNewsSourcesList(newsResults) {
    if (
      !newsResults ||
      !newsResults.articles ||
      newsResults.articles.length === 0
    ) {
      return '<li class="list-group-item">Nenhuma fonte de notícia relacionada encontrada.</li>'
    }

    return newsResults.articles
      .slice(0, 5)
      .map(
        article => `
          <li class="list-group-item">
              <strong>${article.source.name}</strong><br>
              <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                  ${article.title}
              </a>
          </li>
      `
      )
      .join('')
  }

  function displayResults(analysis) {
    const {
      riskLevel,
      confidence,
      score,
      analysis: { factualAnalysis, basicAnalysis }
    } = analysis

    resultDiv.innerHTML = `
      <h4 class="text-${
        riskLevel === 'Alto'
          ? 'danger'
          : riskLevel === 'Moderado'
          ? 'warning'
          : 'success'
      }">
        ${riskLevel}
      </h4>
      <p><strong>Confiança:</strong> ${confidence}</p>
      <p><strong>Score de veracidade:</strong> ${(score * 100).toFixed(2)}%</p>
      <h5>Análise de padrões suspeitos:</h5>
      <ul class="list-group">
        ${
          basicAnalysis.matchedPatterns.length > 0
            ? basicAnalysis.matchedPatterns
                .map(
                  pattern => `
            <li class="list-group-item">
                <strong>Categoria:</strong> ${pattern.category}<br>
                <strong>Padrão encontrado:</strong> ${pattern.pattern}
            </li>`
                )
                .join('')
            : '<li class="list-group-item">Nenhum padrão suspeito identificado.</li>'
        }
      </ul>
      <h5>Verificações de fatos:</h5>
      <ul class="list-group">
        ${generateFactCheckList(factualAnalysis.factCheckResults)}
      </ul>
      <h5>Fontes de notícias confiáveis:</h5>
      <ul class="list-group">
        ${generateNewsSourcesList(factualAnalysis.newsResults)}
      </ul>
    `
  }

  // Event Listeners
  verifyButton.addEventListener('click', async function () {
    const text = userInput.value.trim()

    if (text.length < 10) {
      alert('Por favor, insira um texto mais longo para análise.')
      return
    }

    // Mostra loading
    resultDiv.innerHTML = `
          <div class="text-center">
              <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Analisando...</span>
              </div>
              <p class="mt-2">Verificando a veracidade da informação...</p>
          </div>
      `
    resultSection.classList.remove('d-none')

    try {
      const analysis = await analyzeContent(text)
      displayResults(analysis)
    } catch (error) {
      console.error('Error:', error)
      resultDiv.innerHTML = `
              <div class="alert alert-danger">
                  Ocorreu um erro durante a análise. Por favor, tente novamente.
              </div>
          `
    }
  })
})
