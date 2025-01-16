// Estado global da aplicação
let verificationHistory = []

// Elementos do DOM
const elements = {
  userInput: document.getElementById('userInput'),
  verifyButton: document.getElementById('verifyButton'),
  resultSection: document.getElementById('result-section'),
  verificationsHistory: document.getElementById('verificationsHistory'),
  themeSwitcher: document.getElementById('themeSwitcher'),
  spinner: document.querySelector('.spinner-border'),
  notificationToast: document.getElementById('notificationToast'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  charCount: document.getElementById('charCount')
}

const currentLang = document.documentElement.lang || 'pt'

// Inicialização com Event Delegation
document.addEventListener('DOMContentLoaded', () => {
  loadVerificationHistory()
  initThemeSwitch()

  // Event Delegation
  document.addEventListener('click', handleGlobalClicks)

  // Listener para o botão de verificação
  elements.userInput?.addEventListener('input', () => {
    updateCharCount()
    elements.verifyButton.disabled = !elements.userInput.value.trim()
  })

  // Listener para limpar histórico
  document
    .getElementById('confirmClearHistory')
    ?.addEventListener('click', () => {
      verificationHistory = []
      localStorage.removeItem('verificationHistory')
      updateHistoryDisplay()

      const modal = bootstrap.Modal.getInstance(
        document.getElementById('clearHistoryModal')
      )
      modal?.hide()

      showNotification('Histórico apagado com sucesso!', 'success')
    })

  // Listeners de conectividade
  window.addEventListener('offline', () =>
    showNotification(
      'Você está offline. Algumas funcionalidades podem estar indisponíveis.'
    )
  )
  window.addEventListener('online', () =>
    showNotification('Conexão restabelecida!')
  )

  // Expand/Collapse functionality
  const trigger = document.querySelector('.expand-trigger')
  const content = document.querySelector('.expand-content')

  trigger?.addEventListener('click', function () {
    this.classList.toggle('active')
    content?.classList.toggle('show')

    if (content?.classList.contains('show')) {
      setTimeout(() => {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  })

  // Handle skeletons
  const skeletons = document.querySelectorAll('.skeleton-text')
  skeletons.forEach(skeleton => {
    const content = skeleton.dataset.content
    if (content) {
      skeleton.outerHTML = content
    }
  })

  // Inicializar contagem de caracteres
  updateCharCount()
})

function updateCharCount() {
  if (!elements.userInput || !elements.charCount) return

  const count = elements.userInput.value.length
  elements.charCount.textContent = count.toLocaleString()
}

// Handler global de clicks
function shareContent(platform) {
  // Pegar o texto da análise do elemento de resultado
  const resultSectionElement = document.getElementById('result-section')
  if (!resultSectionElement) return

  // Extrair informações relevantes do resultado
  const scoreElement = resultSectionElement.querySelector('.display-4')
  const classificacaoElement = resultSectionElement.querySelector('.h5')
  const analiseElement = resultSectionElement.querySelector('.card p')

  if (!scoreElement || !classificacaoElement || !analiseElement) return

  // Construir a mensagem de compartilhamento
  const score = scoreElement.textContent
  const classificacao = classificacaoElement.textContent
  const analise = analiseElement.textContent

  const mensagem =
    `🔍 Verifiquei essa informação no Verificador de Fake News!\n\n` +
    `📊 Resultado: ${score} de confiabilidade\n` +
    `📋 Classificação: ${classificacao}\n` +
    `📝 Análise: ${analise.substring(0, 1500)}...\n\n` +
    `Verifique você também:`

  // Codificar a mensagem para URL
  const textoCodificado = encodeURIComponent(mensagem)
  const url = encodeURIComponent(window.location.href)

  // URLs para cada plataforma
  const platformUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${textoCodificado}&url=${url}`,
    whatsapp: `https://wa.me/?text=${textoCodificado} ${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${textoCodificado}`
  }

  // Abrir janela de compartilhamento
  window.open(platformUrls[platform], '_blank')
}

function handleGlobalClicks(e) {
  const target = e.target
  const shareButton = target.closest('[data-share]')

  if (target === elements.verifyButton) {
    handleVerification()
  } else if (target === elements.clearHistoryBtn) {
    handleClearHistory()
  } else if (shareButton) {
    const platform = shareButton.getAttribute('data-share')
    shareContent(platform)
  }
}

async function checkWithGemini(text) {
  try {
    const keyResponse = await fetch(
      'https://fakenews-sigma.vercel.app/api/getApiKey',
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!keyResponse.ok) {
      console.error('Erro ao obter chave:', await keyResponse.text())
      throw new Error('Não foi possível obter a chave API')
    }

    const { apiKey } = await keyResponse.json()

    const prompt = `Analyze the following text for truthfulness and provide a comprehensive bilingual response (Portuguese and English). Consider linguistic patterns, source credibility, emotional manipulation, and fact verification:

"${text}"

Return only a valid JSON object with this exact structure (no markdown formatting):
{
  "score": [0-1],
  "pt": {
    "classificacao": ["Comprovadamente Verdadeiro", "Parcialmente Verdadeiro", "Não Verificável", "Provavelmente Falso", "Comprovadamente Falso"],
    "explicacao_score": "string",
    "elementos_verdadeiros": ["array"],
    "elementos_falsos": ["array"],
    "elementos_suspeitos": ["array"],
    "indicadores_linguisticos": {
      "sensacionalismo": [0-1],
      "apelo_emocional": [0-1],
      "urgencia": [0-1],
      "explicacao": "string"
    },
    "credibilidade_fonte": {
      "nivel": [0-1],
      "analise": "string",
      "recomendacoes": ["array"]
    },
    "contexto_temporal": {
      "atualidade": "string",
      "relevancia": "string"
    },
    "recomendacoes": ["array"],
    "analise_detalhada": "string",
    "consideracoes_adicionais": ["array"],
    "referencias_relacionadas": ["array"]
  },
  "en": {
    "classification": ["Proven True", "Partially True", "Not Verifiable", "Probably False", "Proven False"],
    "score_explanation": "string",
    "true_elements": ["array"],
    "false_elements": ["array"],
    "suspicious_points": ["array"],
    "linguistic_indicators": {
      "sensationalism": [0-1],
      "emotional_appeal": [0-1],
      "urgency": [0-1],
      "explanation": "string"
    },
    "source_credibility": {
      "level": [0-1],
      "analysis": "string",
      "recommendations": ["array"]
    },
    "temporal_context": {
      "currentness": "string",
      "relevance": "string"
    },
    "recommendations": ["array"],
    "detailed_analysis": "string",
    "additional_considerations": ["array"],
    "related_references": ["array"]
  }
}`

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
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      }
    )

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inválida da API')
    }

    // Clean up the response text
    let responseText = data.candidates[0].content.parts[0].text.trim()
    responseText = responseText.replace(/```json\s*/, '')
    responseText = responseText.replace(/```\s*$/, '')
    responseText = responseText.trim()

    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error('Response text that failed to parse:', responseText)
      throw new Error(`Failed to parse JSON response: ${parseError.message}`)
    }
  } catch (error) {
    console.error('Erro na análise:', error)
    throw error
  }
}

// Gerenciamento do tema
function initThemeSwitch() {
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', theme)
  elements.themeSwitcher.querySelector('i').className =
    theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'

  elements.themeSwitcher.addEventListener('click', () => {
    const newTheme =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light'
        : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    elements.themeSwitcher.querySelector('i').className =
      newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
  })
}

// Processo de verificação
async function handleVerification() {
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

// Função para atualizar o círculo de score
function updateScoreCircle(score) {
  if (typeof score !== 'number' || score < 0 || score > 1) {
    console.warn('Score inválido:', score)
    score = 0
  }

  const circle = document.getElementById('score-circle')
  if (!circle) return

  const circumference = 2 * Math.PI * 54
  const offset = circumference - score * circumference
  circle.style.strokeDasharray = `${circumference} ${circumference}`
  circle.style.strokeDashoffset = offset

  let color
  if (score >= 0.8) color = '#28a745'
  else if (score >= 0.6) color = '#17a2b8'
  else if (score >= 0.4) color = '#ffc107'
  else if (score >= 0.2) color = '#fd7e14'
  else color = '#dc3545'

  circle.style.stroke = color

  const scoreElement = document.querySelector('.score-percentage')
  if (scoreElement) {
    scoreElement.textContent = `${Math.round(score * 100)}%`
  }
}

// Função para atualizar indicadores linguísticos
function updateLinguisticIndicators(indicators) {
  // Atualizar Sensacionalismo
  const sensationalismValue = document.querySelector('.sensationalism-value')
  const sensationalismBar = document.querySelector('.sensationalism-bar')
  if (sensationalismValue && sensationalismBar) {
    const sensationalismPercent = Math.round(
      (indicators.sensationalism || 0) * 100
    )
    sensationalismValue.textContent = `${sensationalismPercent}%`
    sensationalismBar.style.width = `${sensationalismPercent}%`
  }

  // Atualizar Apelo Emocional
  const emotionalValue = document.querySelector('.emotional-value')
  const emotionalBar = document.querySelector('.emotional-bar')
  if (emotionalValue && emotionalBar) {
    const emotionalPercent = Math.round(
      (indicators.emotional_appeal || 0) * 100
    )
    emotionalValue.textContent = `${emotionalPercent}%`
    emotionalBar.style.width = `${emotionalPercent}%`
  }

  // Atualizar Urgência
  const urgencyValue = document.querySelector('.urgency-value')
  const urgencyBar = document.querySelector('.urgency-bar')
  if (urgencyValue && urgencyBar) {
    const urgencyPercent = Math.round((indicators.urgency || 0) * 100)
    urgencyValue.textContent = `${urgencyPercent}%`
    urgencyBar.style.width = `${urgencyPercent}%`
  }
}

// Função para atualizar credibilidade da fonte
function updateCredibility(credibility) {
  const credibilityBar = document.querySelector('.credibility-bar')
  const credibilityValue = document.querySelector('.credibility-value')
  const credibilityAnalysis = document.querySelector('.credibility-analysis')

  if (credibilityBar && credibilityValue) {
    const credibilityPercent = Math.round((credibility.level || 0) * 100)
    credibilityBar.style.width = `${credibilityPercent}%`
    credibilityValue.textContent = `${credibilityPercent}%`

    // Definir a cor baseada no nível de credibilidade
    if (credibilityPercent >= 70) {
      credibilityBar.classList.add('bg-success')
    } else if (credibilityPercent >= 40) {
      credibilityBar.classList.add('bg-warning')
    } else {
      credibilityBar.classList.add('bg-danger')
    }
  }

  // Atualizar a análise de credibilidade
  if (credibilityAnalysis && credibility.analysis) {
    credibilityAnalysis.textContent = credibility.analysis
  }
}

// Funções de UI// Funções auxiliares necessárias
function calculateConfidenceLevel(langData) {
  const { source_credibility, linguistic_indicators } = langData
  const sourceWeight = 0.6
  const linguisticWeight = 0.4

  const sourceScore = source_credibility?.level || 0
  const linguisticScore =
    ((linguistic_indicators?.sensationalism || 0) +
      (linguistic_indicators?.emotional_appeal || 0) +
      (linguistic_indicators?.urgency || 0)) /
    3

  return Math.round(
    (sourceScore * sourceWeight + linguisticScore * linguisticWeight) * 100
  )
}

function createRadialProgress(score, color) {
  const circumference = 2 * Math.PI * 54 // r=54
  const offset = circumference - (score / 100) * circumference

  return `
    <svg class="radial-progress" width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="54" fill="none" stroke="#e9ecef" stroke-width="12"/>
      <circle
        class="progress-circle"
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="${color}"
        stroke-width="12"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="60" text-anchor="middle" dominant-baseline="middle" class="score-text">
        ${score}%
      </text>
    </svg>
  `
}

function calculateSourceCredibility(langData) {
  const source = langData.source_credibility || {}
  return Math.round((source.level || 0) * 100)
}

function calculateTemporalRelevance(langData) {
  const temporal = langData.temporal_context || {}
  const currentness = temporal.currentness_score || 0.5
  const relevance = temporal.relevance_score || 0.5
  return Math.round(((currentness + relevance) / 2) * 100)
}

function calculatePropagationRisk(langData) {
  const viral = langData.viral_potential || 0.5
  const reach = langData.reach_score || 0.5
  return Math.round(((viral + reach) / 2) * 100)
}

function calculateFactualAccuracy(langData) {
  const trueElements = (langData.true_elements || []).length
  const falseElements = (langData.false_elements || []).length
  const total = trueElements + falseElements
  return total ? Math.round((trueElements / total) * 100) : 50
}

function calculateBiasLevel(langData) {
  const indicators = langData.linguistic_indicators || {}
  return Math.round(
    ((indicators.bias || 0) * 0.7 + (indicators.emotional_appeal || 0) * 0.3) *
      100
  )
}

function formatMetricName(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function getMetricClass(value) {
  if (value >= 80) return 'metric-high'
  if (value >= 60) return 'metric-medium-high'
  if (value >= 40) return 'metric-medium'
  if (value >= 20) return 'metric-medium-low'
  return 'metric-low'
}

function getItemIcon(type) {
  const icons = {
    verified: 'fa-check-circle',
    suspicious: 'fa-exclamation-triangle',
    false: 'fa-times-circle',
    info: 'fa-info-circle'
  }
  return icons[type] || 'fa-circle'
}

function generateDetailedAnalysis(langData, metrics) {
  return {
    'Content Reliability': [
      {
        type: 'info',
        text: `Overall content reliability score: ${metrics.factualAccuracy}%`,
        evidence: langData.analysis_summary
      },
      {
        type: metrics.factualAccuracy >= 70 ? 'verified' : 'suspicious',
        text: `Factual accuracy assessment based on ${
          (langData.true_elements || []).length +
          (langData.false_elements || []).length
        } verified claims`
      }
    ],
    'Source Assessment': [
      {
        type: metrics.sourceCredibility >= 70 ? 'verified' : 'suspicious',
        text: `Source credibility: ${metrics.sourceCredibility}%`,
        evidence: langData.source_credibility?.analysis
      }
    ],
    'Risk Factors': [
      {
        type: metrics.contentRisk >= 70 ? 'false' : 'info',
        text: `Content risk level: ${metrics.contentRisk}%`,
        evidence:
          'Based on sensationalism, emotional appeal, and urgency factors'
      },
      {
        type: metrics.propagationRisk >= 70 ? 'false' : 'info',
        text: `Propagation risk: ${metrics.propagationRisk}%`,
        evidence: 'Assessment of potential viral spread and reach'
      }
    ]
  }
}

function analyzeSource(langData) {
  return {
    credibilityScore: langData.source_credibility?.level || 0,
    verificationStatus:
      langData.source_credibility?.verification_status || 'unknown',
    domainAge: langData.source_credibility?.domain_age,
    previousReliability:
      langData.source_credibility?.historical_reliability || 0,
    transparencyScore: langData.source_credibility?.transparency || 0
  }
}

function renderSourceMetrics(sourceData) {
  const metrics = [
    { label: 'Domain Trust', value: sourceData.credibilityScore },
    { label: 'Historical Reliability', value: sourceData.previousReliability },
    { label: 'Transparency', value: sourceData.transparencyScore }
  ]

  return `
    <div class="source-metrics-grid">
      ${metrics
        .map(
          metric => `
        <div class="source-metric-card">
          <h6>${metric.label}</h6>
          <div class="progress">
            <div class="progress-bar" style="width: ${
              metric.value * 100
            }%"></div>
          </div>
          <span class="metric-value">${Math.round(metric.value * 100)}%</span>
        </div>
      `
        )
        .join('')}
    </div>
  `
}

function renderSourceVerification(sourceData) {
  const status = sourceData.verificationStatus
  const statusClasses = {
    verified: 'text-success',
    unverified: 'text-warning',
    unknown: 'text-secondary',
    suspicious: 'text-danger'
  }

  return `
    <div class="source-verification-status ${statusClasses[status]}">
      <i class="fas fa-${
        status === 'verified' ? 'check-circle' : 'question-circle'
      } me-2"></i>
      <span>Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</span>
      ${
        sourceData.domainAge
          ? `<small class="ms-3">Domain Age: ${sourceData.domainAge}</small>`
          : ''
      }
    </div>
  `
}

function renderFactChecking(langData) {
  return `
    <div class="fact-checking-section">
      <h4>Fact Checking Results</h4>
      <div class="fact-grid">
        <div class="verified-facts">
          <h5><i class="fas fa-check-circle text-success me-2"></i>Verified Facts</h5>
          <ul class="fact-list">
            ${(langData.true_elements || [])
              .map(
                fact => `
              <li class="fact-item verified">${fact}</li>
            `
              )
              .join('')}
          </ul>
        </div>
        <div class="disputed-facts">
          <h5><i class="fas fa-times-circle text-danger me-2"></i>Disputed Claims</h5>
          <ul class="fact-list">
            ${(langData.false_elements || [])
              .map(
                fact => `
              <li class="fact-item disputed">${fact}</li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>
    </div>
  `
}

function renderRecommendations(langData) {
  const recommendations = langData.recommendations || []
  return `
    <div class="recommendations-section">
      <h4>Recommendations</h4>
      <div class="recommendations-grid">
        ${recommendations
          .map(
            rec => `
          <div class="recommendation-card">
            <i class="fas fa-lightbulb text-warning me-2"></i>
            <p>${rec}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
}

function initializeInteractiveFeatures(container, verificationId) {
  // Adiciona listeners para elementos interativos
  container.querySelectorAll('.evidence').forEach(evidence => {
    evidence.addEventListener('click', () => {
      evidence.classList.toggle('expanded')
    })
  })

  // Inicializa tooltips
  const tooltips = container.querySelectorAll('[data-toggle="tooltip"]')
  tooltips.forEach(tooltip => {
    new bootstrap.Tooltip(tooltip)
  })
}

function updateAnimations(metrics) {
  // Atualiza animações baseadas nos valores métricos
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.style.setProperty(
      '--target-width',
      `${bar.parentElement.dataset.value}%`
    )
  })
}

// Estilos adicionais necessários
const additionalStyles = `
  .radial-progress {
    transform: rotate(-90deg);
  }

  .progress-circle {
    transition: stroke-dashoffset 1s ease-out;
  }

  .score-text {
    transform: rotate(90deg);
    font-size: 24px;
    font-weight: bold;
  }

  .source-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .fact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 1rem 0;
  }

  .fact-item {
    padding: 0.5rem;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .fact-item.verified {
    background-color: rgba(40, 167, 69, 0.1);
  }

  .fact-item.disputed {
    background-color: rgba(220, 53, 69, 0.1);
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .recommendation-card {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .expanded {
    max-height: none;
    opacity: 1;
  }
`

document.head.insertAdjacentHTML(
  'beforeend',
  `<style>${additionalStyles}</style>`
)

function updateVerifiedElements(langData) {
  if (!langData) return

  const trueElements =
    currentLang === 'en'
      ? langData.true_elements
      : langData.elementos_verdadeiros
  const falseElements =
    currentLang === 'en' ? langData.false_elements : langData.elementos_falsos
  const suspiciousElements =
    currentLang === 'en'
      ? langData.suspicious_points
      : langData.elementos_suspeitos

  // Função auxiliar para atualizar listas
  const updateList = (elements, containerId) => {
    const container = document.getElementById(containerId)
    if (container && Array.isArray(elements)) {
      container.innerHTML = elements
        .map(
          item =>
            `<li class="mb-2"><i class="fas fa-check-circle me-2"></i>${item}</li>`
        )
        .join('')
    }
  }

  updateList(trueElements, 'true-elements-list')
  updateList(falseElements, 'false-elements-list')
  updateList(suspiciousElements, 'suspicious-elements-list')
}

// Funções auxiliares para classificação visual
function getIndicatorClass(value) {
  if (value <= 0.3) return 'success'
  if (value <= 0.7) return 'warning'
  return 'danger'
}

function getCredibilityClass(value) {
  if (value >= 0.7) return 'success'
  if (value >= 0.4) return 'warning'
  return 'danger'
}

// Adicionar estilos CSS necessários
document.head.insertAdjacentHTML(
  'beforeend',
  `
  <style>
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 4px solid;
      transition: all 0.3s ease;
    }

    .score-circle.success {
      border-color: #198754;
      color: #198754;
      background-color: rgba(25, 135, 84, 0.1);
    }

    .score-circle.warning {
      border-color: #ffc107;
      color: #ffc107;
      background-color: rgba(255, 193, 7, 0.1);
    }

    .score-circle.danger {
      border-color: #dc3545;
      color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
    }

    .credibility-meter {
      border-radius: 1rem;
      overflow: hidden;
    }

    .progress {
      border-radius: 0.5rem;
    }

    .card {
      transition: transform 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    .list-group-item {
      border-left: none;
      border-right: none;
      padding: 1rem;
      transition: background-color 0.2s ease;
    }

    .list-group-item:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .indicator-card {
      border: none;
      border-radius: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }

    .result-card {
      max-width: 900px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .score-circle {
        width: 100px;
        height: 100px;
      }
    }
  </style>
`
)

// Sistema de Feedback
function handleFeedback(button, feedbackSection) {
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

  // Substituir os botões por uma mensagem de agradecimento com animação suave
  feedbackSection.style.opacity = '0'
  setTimeout(() => {
    feedbackSection.innerHTML = `
      <div class="text-muted small">
        <i class="fas fa-check-circle text-success"></i>
        ${
          document.documentElement.lang === 'en'
            ? 'Thank you for your feedback!'
            : 'Obrigado pelo seu feedback!'
        }
      </div>
    `
    feedbackSection.style.opacity = '1'
  }, 300)

  // Salvar o feedback
  saveFeedback(verificationId, feedbackType)
}

function saveFeedback(verificationId, feedbackType) {
  // Log do feedback (para desenvolvimento)
  console.log('Feedback registrado:', {
    verificationId,
    type: feedbackType,
    timestamp: new Date().toISOString()
  })

  // Mostrar notificação de agradecimento
  const message =
    document.documentElement.lang === 'en'
      ? 'Thank you for your feedback!'
      : 'Obrigado pelo seu feedback!'
  showNotification(message, 'success')

  // Atualizar o histórico local se necessário
  const verification = verificationHistory.find(v => v.id === verificationId)
  if (verification) {
    verification.feedback = feedbackType
    localStorage.setItem(
      'verificationHistory',
      JSON.stringify(verificationHistory)
    )
  }
}

// Atualização da função displayResults para incluir a seção de feedback
function displayFeedbackSection(verification) {
  const currentLang = document.documentElement.lang
  return `
    <div class="feedback-section mt-4 text-center" data-verification-id="${
      verification.id
    }">
      <div class="small text-muted mb-2">
        ${
          currentLang === 'en'
            ? 'Was this analysis helpful?'
            : 'Esta análise foi útil?'
        }
      </div>
      <div class="btn-group btn-group-sm" role="group" aria-label="Feedback">
        <button class="btn btn-outline-success btn-feedback" data-feedback="positive">
          <i class="fas fa-thumbs-up"></i>
        </button>
        <button class="btn btn-outline-danger btn-feedback" data-feedback="negative">
          <i class="fas fa-thumbs-down"></i>
        </button>
      </div>
    </div>
  `
}

// Adicionar estilos CSS para animações suaves
document.head.insertAdjacentHTML(
  'beforeend',
  `
  <style>
    .feedback-section {
      transition: opacity 0.3s ease-in-out;
    }
    
    .btn-feedback {
      transition: all 0.2s ease-in-out;
    }
    
    .btn-feedback:hover {
      transform: scale(1.1);
    }
    
    .feedback-section .text-muted {
      transition: opacity 0.3s ease-in-out;
    }
  </style>
`
)

function submitFeedback(verificationId, feedbackType) {
  showNotification('Obrigado pelo seu feedback!', 'success')

  console.log('Feedback submetido:', {
    verificationId,
    type: feedbackType,
    timestamp: new Date().toISOString()
  })
}

// Função para gerar seções de análise
function generateAnalysisSections(langData, currentLang) {
  const sections = [
    {
      title:
        currentLang === 'en' ? 'Verified Elements' : 'Elementos Verificados',
      content:
        currentLang === 'en'
          ? langData.true_elements
          : langData.elementos_verdadeiros
    },
    {
      title: currentLang === 'en' ? 'False Elements' : 'Elementos Falsos',
      content:
        currentLang === 'en'
          ? langData.false_elements
          : langData.elementos_falsos
    },
    {
      title: currentLang === 'en' ? 'Suspicious Points' : 'Pontos Suspeitos',
      content:
        currentLang === 'en'
          ? langData.suspicious_points
          : langData.elementos_suspeitos
    },
    {
      title: currentLang === 'en' ? 'Recommendations' : 'Recomendações',
      content:
        currentLang === 'en' ? langData.recommendations : langData.recomendacoes
    }
  ]

  return sections
    .map(
      section => `
      <div class="card mb-3">
        <div class="card-body">
          <h4 class="h6 mb-3">${section.title}</h4>
          <ul class="mb-0">
            ${section.content.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `
    )
    .join('')
}

// Utilitários
function getScoreClass(score) {
  return score >= 0.7 ? 'success' : score >= 0.4 ? 'warning' : 'danger'
}

function showLoadingState(loading) {
  elements.verifyButton.disabled = loading
  elements.spinner.classList.toggle('d-none', !loading)
  elements.verifyButton.querySelector('span').textContent = loading
    ? 'Verificando...'
    : 'Verificar Agora'
}

function showNotification(message, type = 'info') {
  const currentLang = document.documentElement.lang
  const translatedMessage = translateDynamicContent(message, currentLang)
  const toast = new bootstrap.Toast(elements.notificationToast)
  elements.notificationToast.querySelector('.toast-body').textContent =
    translatedMessage
  elements.notificationToast.className = `toast bg-${type}`
  toast.show()
}

// Gerenciamento do histórico
function saveVerification(verification) {
  verificationHistory.unshift(verification)
  if (verificationHistory.length > 10) verificationHistory.pop()
  localStorage.setItem(
    'verificationHistory',
    JSON.stringify(verificationHistory)
  )
  updateHistoryDisplay()
}

function loadVerificationHistory() {
  try {
    verificationHistory =
      JSON.parse(localStorage.getItem('verificationHistory')) || []
    updateHistoryDisplay()
  } catch (error) {
    console.error('Erro ao carregar histórico:', error)
    verificationHistory = []
  }
}

function updateHistoryDisplay() {
  elements.verificationsHistory.innerHTML = verificationHistory.length
    ? verificationHistory
        .map(
          verification => `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">${new Date(
            verification.timestamp
          ).toLocaleString()}</small>
          <span class="badge bg-${getScoreClass(verification.overallScore)}">
            ${Math.round(verification.overallScore * 100)}%
          </span>
        </div>
        <p class="mb-1 text-truncate">${verification.text}</p>
      </div>
    `
        )
        .join('')
    : '<p class="text-center text-muted">Nenhuma verificação realizada</p>'
}

function handleClearHistory() {
  // Verifica se há itens no histórico
  if (verificationHistory.length === 0) {
    // Se não houver histórico, mostra um modal diferente
    const modalContent = `
      <div class="modal fade" id="emptyHistoryModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title">
                <i class="fas fa-info-circle text-info me-2"></i>
                Histórico Vazio
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="mb-4">
                <span class="fa-stack fa-2x">
                  <i class="fas fa-circle fa-stack-2x text-info"></i>
                  <i class="fas fa-inbox fa-stack-1x fa-inverse"></i>
                </span>
              </div>
              <h6 class="mb-3">Não há histórico para apagar</h6>
              <p class="text-muted mb-0">Realize algumas verificações primeiro para construir seu histórico.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">
                <i class="fas fa-check me-2"></i>
                Entendi
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Remove qualquer instância anterior do modal
    const existingModal = document.getElementById('emptyHistoryModal')
    if (existingModal) {
      existingModal.remove()
    }

    // Adiciona o novo modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalContent)

    // Mostra o modal
    const modal = new bootstrap.Modal(
      document.getElementById('emptyHistoryModal')
    )
    modal.show()

    // Remove o modal do DOM após ser fechado
    document
      .getElementById('emptyHistoryModal')
      .addEventListener('hidden.bs.modal', function () {
        this.remove()
      })

    return
  }

  // Se houver histórico, mostra o modal de confirmação normal
  const modal = new bootstrap.Modal(
    document.getElementById('clearHistoryModal')
  )
  modal.show()
}

function updateHistoryDisplay() {
  if (verificationHistory.length === 0) {
    elements.verificationsHistory.style.opacity = '0'
    setTimeout(() => {
      elements.verificationsHistory.innerHTML =
        '<p class="text-center text-muted">Nenhuma verificação realizada</p>'
      elements.verificationsHistory.style.opacity = '1'
    }, 300)
  } else {
    elements.verificationsHistory.innerHTML = verificationHistory
      .map(
        verification => `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${new Date(
              verification.timestamp
            ).toLocaleString()}</small>
            <span class="badge bg-${getScoreClass(verification.overallScore)}">
              ${Math.round(verification.overallScore * 100)}%
            </span>
          </div>
          <p class="mb-1 text-truncate">${verification.text}</p>
        </div>
      `
      )
      .join('')
  }
}

// Adicionar este CSS ao seu arquivo de estilos
document.head.insertAdjacentHTML(
  'beforeend',
  `
  <style>
    #verificationsHistory {
      transition: opacity 0.3s ease-in-out;
    }
    
    .modal.fade .modal-dialog {
      transition: transform 0.3s ease-out;
    }
    
    .modal.fade.show .modal-dialog {
      transform: none;
    }
    
    .fa-stack {
      transition: transform 0.3s ease;
    }
    
    #clearHistoryModal:hover .fa-stack,
    #emptyHistoryModal:hover .fa-stack {
      transform: scale(1.1);
    }
  </style>
`
)

// Feedback
function submitFeedback(type) {
  showNotification('Obrigado pelo seu feedback!', 'success')
  bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide()
  console.log(`Feedback ${type} recebido e processado`)
}

const userInput = document.getElementById('userInput')

userInput.value = ''

userInput.placeholder = 'Digite ou cole aqui o texto que deseja verificar...'

document.head.insertAdjacentHTML(
  'beforeend',
  `
  <style>
    #userInput::placeholder {
      color: #6c757d;
    }
    
    #userInput:focus::placeholder {
      opacity: 0.5;
    }
  </style>
`
)
