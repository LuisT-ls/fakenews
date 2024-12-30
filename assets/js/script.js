// Configuração das APIs
const GOOGLE_FACT_CHECK_API_KEY = 'AIzaSyD59PUUAWUxhDD1x-2maOAmdJCANoM06hQ'
const NEWS_API_KEY = 'dd9ac3ec04284a2eab2a972b11919579'
const GEMINI_API_KEY = 'AIzaSyBnXuyrcA1RsKDRDsPlllKi2FG1rcqLTzw'

// Estado global da aplicação
let currentVerification = null
let verificationHistory = []

// Elementos do DOM
const elements = {
  userInput: document.getElementById('userInput'),
  verifyButton: document.getElementById('verifyButton'),
  resultSection: document.getElementById('result-section'),
  result: document.getElementById('result'),
  verificationsHistory: document.getElementById('verificationsHistory'),
  themeSwitcher: document.getElementById('themeSwitcher'),
  spinner: document.querySelector('.spinner-border'),
  notificationToast: document.getElementById('notificationToast'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn')
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadVerificationHistory()
  initThemeSwitch()
  setupEventListeners()
})

async function checkWithGemini(text) {
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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 0.1,
            topK: 16,
            maxOutputTokens: 2048
          }
        })
      }
    )

    if (!response.ok) {
      console.error('API Error:', await response.text())
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inválida da API')
    }

    const analysisText = data.candidates[0].content.parts[0].text.trim()
    return JSON.parse(analysisText)
  } catch (error) {
    console.error('Erro detalhado:', error)
    throw new Error(`Falha na análise: ${error.message}`)
  }
}

// Configuração dos event listeners
function setupEventListeners() {
  elements.verifyButton.addEventListener('click', handleVerification)
  elements.userInput.addEventListener('input', handleInputChange)
  elements.clearHistoryBtn.addEventListener('click', handleClearHistory)
  window.addEventListener('offline', () =>
    showNotification(
      'Você está offline. Algumas funcionalidades podem estar indisponíveis.'
    )
  )
  window.addEventListener('online', () =>
    showNotification('Conexão restabelecida!')
  )
}

function handleClearHistory() {
  // Cria um modal de confirmação usando Bootstrap
  const confirmed = confirm(
    'Tem certeza que deseja apagar todo o histórico de verificações?'
  )

  if (confirmed) {
    verificationHistory = []
    localStorage.removeItem('verificationHistory')
    updateHistoryDisplay()
    showNotification('Histórico apagado com sucesso!', 'success')
  }
}

// Gerenciamento do tema
function initThemeSwitch() {
  const currentTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', currentTheme)
  updateThemeIcon(currentTheme)

  elements.themeSwitcher.addEventListener('click', () => {
    const newTheme =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light'
        : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    updateThemeIcon(newTheme)
  })
}

function updateThemeIcon(theme) {
  const icon = elements.themeSwitcher.querySelector('i')
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
}

// Manipulação do input
function handleInputChange() {
  elements.verifyButton.disabled = !elements.userInput.value.trim()
}

// Processo de verificação
async function handleVerification() {
  const text = elements.userInput.value.trim()
  if (!text) return

  showLoadingState(true)

  try {
    const results = await Promise.all([
      checkFactChecking(text),
      analyzeNews(text),
      performContentAnalysis(text),
      checkWithGemini(text)
    ])

    const [factCheckResult, newsResult, contentAnalysis, geminiResult] = results
    const verification = createVerificationResult(
      text,
      factCheckResult,
      newsResult,
      contentAnalysis,
      geminiResult
    )

    displayResults(verification)
    saveVerification(verification)
    showFeedbackModal()
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

// Chamadas às APIs
async function checkFactChecking(text) {
  const query = encodeURIComponent(text)
  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${GOOGLE_FACT_CHECK_API_KEY}&query=${query}`

  try {
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error('Erro na verificação de fatos:', error)
    return null
  }
}

async function analyzeNews(text) {
  // Resumo de texto para evitar URLs muito longas
  const shortenedText =
    text.length > 100 ? text.substring(0, 100) + '...' : text
  const query = encodeURIComponent(shortenedText)
  const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}&language=pt&sortBy=relevancy`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Erro na API NewsAPI: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Erro na análise de notícias:', error)
    return null
  }
}

async function performContentAnalysis(text) {
  // Implementação básica de análise de conteúdo
  const redFlags = [
    { pattern: /URGENTE|IMPORTANTE|ATENÇÃO/i, weight: 0.3 },
    { pattern: /\b(?:100%|GARANTIDO)\b/i, weight: 0.4 },
    { pattern: /(?:não divulgam|mídia esconde)/i, weight: 0.5 },
    { pattern: /\b(?:cura milagrosa|segredo revelado)\b/i, weight: 0.6 }
  ]

  let suspiciousScore = 0
  redFlags.forEach(flag => {
    if (flag.pattern.test(text)) {
      suspiciousScore += flag.weight
    }
  })

  return {
    suspiciousScore: Math.min(suspiciousScore, 1),
    textLength: text.length,
    hasLinks: /https?:\/\/[^\s]+/g.test(text),
    hasNumbers: /\d+/g.test(text)
  }
}

// Criação e exibição dos resultados
function createVerificationResult(
  text,
  factCheck,
  news,
  analysis,
  geminiResult
) {
  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
    factCheckResults: factCheck,
    newsResults: news,
    contentAnalysis: analysis,
    geminiAnalysis: geminiResult,
    overallScore: calculateOverallScore(factCheck, news, analysis, geminiResult)
  }
}

function calculateOverallScore(factCheck, news, analysis, geminiResult) {
  if (!geminiResult) return 0.5

  let score = geminiResult.score * 0.8 // Base score from Gemini

  // Adjust based on confidence
  score *= 0.5 + geminiResult.confiabilidade * 0.5

  // Additional factors
  if (factCheck?.claims?.length > 0) score += 0.1
  if (news?.articles?.length > 0) score += 0.1

  // Content analysis adjustments
  if (analysis) {
    score *= 1 - analysis.suspiciousScore * 0.2
  }

  return Math.max(0, Math.min(1, score))
}

function displayResults(verification) {
  if (!verification.geminiAnalysis) {
    elements.result.innerHTML =
      '<div class="alert alert-danger">Não foi possível realizar a análise. Tente novamente.</div>'
    elements.resultSection.classList.remove('d-none')
    return
  }

  const gemini = verification.geminiAnalysis
  const scorePercentage = Math.round(verification.overallScore * 100)

  const getScoreClass = score => {
    if (score >= 0.7) return 'success'
    if (score >= 0.4) return 'warning'
    return 'danger'
  }

  const resultHTML = `
    <div class="result-card p-4 border rounded shadow-sm">
      <div class="mb-4 text-center">
        <div class="display-4 text-${getScoreClass(
          verification.overallScore
        )}">${scorePercentage}%</div>
        <h3 class="h5">${gemini.classificacao}</h3>
      </div>

      <div class="progress mb-4" style="height: 25px;">
        <div class="progress-bar bg-${getScoreClass(verification.overallScore)}"
             role="progressbar"
             style="width: ${scorePercentage}%"
             aria-valuenow="${scorePercentage}"
             aria-valuemin="0"
             aria-valuemax="100">
        </div>
      </div>

      <div class="alert alert-secondary">
        <i class="fas fa-info-circle me-2"></i>
        ${gemini.explicacao_score}
      </div>

      ${generateAnalysisSection(
        'Elementos Verificados',
        gemini.elementos_verdadeiros,
        'success',
        'check-circle'
      )}
      ${generateAnalysisSection(
        'Elementos Falsos',
        gemini.elementos_falsos,
        'danger',
        'times-circle'
      )}
      ${generateAnalysisSection(
        'Pontos Suspeitos',
        gemini.elementos_suspeitos,
        'warning',
        'exclamation-triangle'
      )}
      
      <div class="card mb-3">
        <div class="card-body">
          <h4 class="h6 mb-3">Análise Detalhada</h4>
          <p class="mb-0">${gemini.analise_detalhada}</p>
        </div>
      </div>

      ${generateAnalysisSection(
        'Recomendações',
        gemini.recomendacoes,
        'info',
        'lightbulb'
      )}
    </div>
  `

  elements.result.innerHTML = resultHTML
  elements.resultSection.classList.remove('d-none')
}

function generateAnalysisSection(title, items, colorClass, icon) {
  if (!items?.length) return ''

  return `
    <div class="mb-3">
      <h4 class="h6 mb-2">${title}</h4>
      <div class="list-group">
        ${items
          .map(
            item => `
          <div class="list-group-item list-group-item-${colorClass}">
            <i class="fas fa-${icon} me-2"></i>
            ${item}
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
}

function getScoreLabel(score) {
  if (score > 0.7) return 'Provavelmente Verdadeiro'
  if (score > 0.4) return 'Verificação Necessária'
  return 'Possível Fake News'
}

function generateAnalysisDetails(verification) {
  let details =
    '<h4 class="h6 mb-3">Detalhes da Análise:</h4><ul class="list-group">'

  // Adiciona análise do Gemini
  if (verification.geminiAnalysis) {
    details += `
      <li class="list-group-item">
        <strong>Análise IA:</strong> ${verification.geminiAnalysis.summary}
        <ul class="mt-2">
          ${verification.geminiAnalysis.reasons
            .map(reason => `<li>${reason}</li>`)
            .join('')}
        </ul>
      </li>
    `
  }

  // Adiciona resultados do fact-checking
  if (verification.factCheckResults?.claims?.length > 0) {
    details += `
      <li class="list-group-item">
        <strong>Fact-Checks Encontrados:</strong> ${verification.factCheckResults.claims.length}
      </li>
    `
  }

  // Adiciona resultados da análise de conteúdo
  details += `
    <li class="list-group-item">
      <strong>Indicadores de Alerta:</strong>
      ${
        verification.contentAnalysis.suspiciousScore > 0
          ? `<span class="text-warning">Encontrados alguns padrões suspeitos</span>`
          : `<span class="text-success">Nenhum padrão suspeito significativo</span>`
      }
    </li>
  `

  // Adiciona cobertura de notícias
  if (verification.newsResults?.articles?.length > 0) {
    details += `
      <li class="list-group-item">
        <strong>Cobertura na Mídia:</strong> 
        Encontradas ${verification.newsResults.articles.length} notícias relacionadas
      </li>
    `
  }

  details += '</ul>'
  return details
}

// Gerenciamento do histórico
function saveVerification(verification) {
  verificationHistory.unshift(verification)
  if (verificationHistory.length > 10) {
    verificationHistory.pop()
  }
  localStorage.setItem(
    'verificationHistory',
    JSON.stringify(verificationHistory)
  )
  updateHistoryDisplay()
}

function loadVerificationHistory() {
  try {
    const saved = localStorage.getItem('verificationHistory')
    verificationHistory = saved ? JSON.parse(saved) : []
    updateHistoryDisplay()
  } catch (error) {
    console.error('Erro ao carregar histórico:', error)
    verificationHistory = []
  }
}

function updateHistoryDisplay() {
  const historyHTML = verificationHistory
    .map(
      verification => `
    <div class="list-group-item">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          ${new Date(verification.timestamp).toLocaleString()}
        </small>
        <span class="badge bg-${getScoreBadgeColor(verification.overallScore)}">
          ${Math.round(verification.overallScore * 100)}%
        </span>
      </div>
      <p class="mb-1 text-truncate">${verification.text}</p>
    </div>
  `
    )
    .join('')

  elements.verificationsHistory.innerHTML =
    historyHTML ||
    '<p class="text-center text-muted">Nenhuma verificação realizada</p>'
}

function getScoreBadgeColor(score) {
  if (score > 0.7) return 'success'
  if (score > 0.4) return 'warning'
  return 'danger'
}

// Funções de UI
function showLoadingState(loading) {
  elements.verifyButton.disabled = loading
  elements.spinner.classList.toggle('d-none', !loading)
  elements.verifyButton.querySelector('span').textContent = loading
    ? 'Verificando...'
    : 'Verificar Agora'
}

function showNotification(message, type = 'info') {
  const toast = new bootstrap.Toast(elements.notificationToast)
  elements.notificationToast.querySelector('.toast-body').textContent = message
  elements.notificationToast.classList.add(`bg-${type}`)
  toast.show()
}

// Compartilhamento
function shareOnTwitter() {
  const text = encodeURIComponent(
    'Verifiquei esta informação usando o Verificador de Fake News!'
  )
  const url = encodeURIComponent(window.location.href)
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    '_blank'
  )
}

function shareOnWhatsApp() {
  const text = encodeURIComponent(
    'Verifiquei esta informação usando o Verificador de Fake News!'
  )
  const url = encodeURIComponent(window.location.href)
  window.open(`https://wa.me/?text=${text} ${url}`, '_blank')
}

function shareOnTelegram() {
  const text = encodeURIComponent(
    'Verifiquei esta informação usando o Verificador de Fake News!'
  )
  const url = encodeURIComponent(window.location.href)
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
}

// Feedback
function showFeedbackModal() {
  const modal = new bootstrap.Modal(document.getElementById('feedbackModal'))
  modal.show()
}

function submitFeedback(type) {
  // Falta implementar a lógica para salvar o feedback
  showNotification('Obrigado pelo seu feedback!', 'success')
  bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide()
}
