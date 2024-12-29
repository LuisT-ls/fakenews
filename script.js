// Configuração das APIs
const GOOGLE_FACT_CHECK_API_KEY = 'AIzaSyD59PUUAWUxhDD1x-2maOAmdJCANoM06hQ'
const NEWS_API_KEY = 'dd9ac3ec04284a2eab2a972b11919579'

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
  notificationToast: document.getElementById('notificationToast')
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadVerificationHistory()
  initThemeSwitch()
  setupEventListeners()
})

// Configuração dos event listeners
function setupEventListeners() {
  elements.verifyButton.addEventListener('click', handleVerification)
  elements.userInput.addEventListener('input', handleInputChange)
  window.addEventListener('offline', () =>
    showNotification(
      'Você está offline. Algumas funcionalidades podem estar indisponíveis.'
    )
  )
  window.addEventListener('online', () =>
    showNotification('Conexão restabelecida!')
  )
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
      performContentAnalysis(text)
    ])

    const [factCheckResult, newsResult, contentAnalysis] = results
    const verification = createVerificationResult(
      text,
      factCheckResult,
      newsResult,
      contentAnalysis
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
  const query = encodeURIComponent(text)
  const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}&language=pt&sortBy=relevancy`

  try {
    const response = await fetch(url)
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
function createVerificationResult(text, factCheck, news, analysis) {
  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
    factCheckResults: factCheck,
    newsResults: news,
    contentAnalysis: analysis,
    overallScore: calculateOverallScore(factCheck, news, analysis)
  }
}

function calculateOverallScore(factCheck, news, analysis) {
  let score = 0.5 // Score inicial neutro

  // Ajuste baseado na análise de conteúdo
  score -= analysis.suspiciousScore * 0.3

  // Ajuste baseado nos fact checks encontrados
  if (factCheck?.claims?.length > 0) {
    const factCheckScore =
      factCheck.claims.reduce((acc, claim) => {
        return acc + (claim.ratingValue ? claim.ratingValue / 5 : 0)
      }, 0) / factCheck.claims.length
    score += factCheckScore * 0.4
  }

  // Ajuste baseado nas notícias relacionadas
  if (news?.articles?.length > 0) {
    score += 0.3 // Bonus por ter cobertura de mídia
  }

  return Math.max(0, Math.min(1, score)) // Normaliza entre 0 e 1
}

function displayResults(verification) {
  const scoreClass =
    verification.overallScore > 0.7
      ? 'text-success'
      : verification.overallScore > 0.4
      ? 'text-warning'
      : 'text-danger'

  const resultHTML = `
    <div class="result-card p-4 border rounded">
      <h3 class="h5 mb-3">Resultado da Análise</h3>
      <div class="d-flex align-items-center mb-4">
        <div class="progress flex-grow-1 me-3" style="height: 25px;">
          <div class="progress-bar ${scoreClass}" role="progressbar" 
               style="width: ${verification.overallScore * 100}%" 
               aria-valuenow="${verification.overallScore * 100}" 
               aria-valuemin="0" aria-valuemax="100">
            ${Math.round(verification.overallScore * 100)}%
          </div>
        </div>
        <span class="${scoreClass} fw-bold">
          ${getScoreLabel(verification.overallScore)}
        </span>
      </div>
      
      <div class="analysis-details">
        ${generateAnalysisDetails(verification)}
      </div>
    </div>
  `

  elements.result.innerHTML = resultHTML
  elements.resultSection.classList.remove('d-none')
}

function getScoreLabel(score) {
  if (score > 0.7) return 'Provavelmente Verdadeiro'
  if (score > 0.4) return 'Verificação Necessária'
  return 'Possível Fake News'
}

function generateAnalysisDetails(verification) {
  let details =
    '<h4 class="h6 mb-3">Detalhes da Análise:</h4><ul class="list-group">'

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
