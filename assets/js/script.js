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
  const resultElement = document.getElementById('result')
  if (!resultElement) return

  // Extrair informações relevantes do resultado
  const scoreElement = resultElement.querySelector('.display-4')
  const classificacaoElement = resultElement.querySelector('.h5')
  const analiseElement = resultElement.querySelector('.card p')

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
function updateLinguisticIndicators(indicators = {}) {
  // Definir valores padrão caso indicators seja undefined
  const { sensationalism = 0, emotional_appeal = 0, urgency = 0 } = indicators

  // Função auxiliar para atualizar cada indicador com verificação de elementos
  const updateIndicator = (name, value) => {
    const normalizedValue =
      typeof value === 'number' ? Math.min(Math.max(value, 0), 1) : 0
    const percentage = Math.round(normalizedValue * 100)

    const valueElement = document.querySelector(`.${name}-value`)
    const barElement = document.querySelector(`.${name}-bar`)

    if (valueElement) valueElement.textContent = `${percentage}%`
    if (barElement) barElement.style.width = `${percentage}%`
  }

  try {
    // Atualizar cada indicador individualmente
    updateIndicator('sensationalism', sensationalism)
    updateIndicator('emotional', emotional_appeal)
    updateIndicator('urgency', urgency)
  } catch (error) {
    console.warn('Erro ao atualizar indicadores:', error)
  }
}

// Função para atualizar credibilidade da fonte
function updateCredibility(credibility) {
  // Valores padrão para credibilidade
  const defaultCredibility = {
    level: 0,
    analysis: 'Informação não disponível',
    recommendations: []
  }

  // Uso de valores fornecidos ou os padrões
  const {
    level = 0,
    analysis = 'Informação não disponível',
    recommendations = []
  } = credibility || defaultCredibility

  // Atualizar elementos da UI com verificação de existência
  const credValue = Math.round(level * 100)

  const credBar = document.querySelector('.credibility-bar')
  const credValueElement = document.querySelector('.credibility-value')
  const analysisElement = document.querySelector('.credibility-analysis')

  if (credBar) {
    credBar.style.width = `${credValue}%`

    // Atualizar classe de cor
    const colorClass =
      credValue >= 80
        ? 'bg-success'
        : credValue >= 60
        ? 'bg-info'
        : credValue >= 40
        ? 'bg-warning'
        : credValue >= 20
        ? 'bg-orange'
        : 'bg-danger'

    // Remover classes antigas e adicionar a nova
    credBar.className = `progress-bar ${colorClass}`
  }

  if (credValueElement) {
    credValueElement.textContent = `${credValue}%`
  }

  if (analysisElement) {
    analysisElement.textContent = analysis
  }
}

// Funções de UI
function displayResults(verification) {
  if (!verification || !verification.geminiAnalysis) {
    console.error('Dados de verificação inválidos')
    return
  }
  try {
    const currentLang = document.documentElement.lang
    const gemini = verification.geminiAnalysis
    const langData = currentLang === 'en' ? gemini.en : gemini.pt
    const scorePercentage = Math.round(gemini.score * 100)
    const scoreClass = getScoreClass(gemini.score)

    if (!langData) {
      console.error('Dados de linguagem não encontrados')
      return
    }

    // Atualizar score e indicadores com verificações de segurança
    updateScoreCircle(gemini.score || 0)
    updateLinguisticIndicators(langData?.linguistic_indicators)
    updateCredibility(langData?.source_credibility)

    // Atualizar classificação
    const classificationElement = document.querySelector('.classification-text')
    if (classificationElement) {
      classificationElement.textContent =
        currentLang === 'en'
          ? langData?.classification
          : langData?.classificacao
    }

    // Atualizar explicação do score
    const explanationElement = document.querySelector('.score-explanation')
    if (explanationElement) {
      explanationElement.textContent =
        currentLang === 'en'
          ? langData?.score_explanation
          : langData?.explicacao_score
    }

    // Mostrar seção de resultados
    const resultSection = document.getElementById('result-section')
    if (resultSection) {
      resultSection.classList.remove('d-none')
    }

    // Verificar se elements.result existe antes de tentar definir innerHTML
    const resultElement = document.getElementById('result')
    if (!resultElement) {
      console.error('Elemento de resultado não encontrado')
      return
    }

    // Função auxiliar para criar cards de indicadores
    const createIndicatorCard = (title, value, maxValue = 1) => {
      const percentage = Math.round((value / maxValue) * 100)
      return `
      <div class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-title">${title}</h6>
            <div class="progress mb-2" style="height: 10px;">
              <div class="progress-bar bg-${getIndicatorClass(value)}"
                   role="progressbar"
                   style="width: ${percentage}%"
                   aria-valuenow="${percentage}"
                   aria-valuemin="0"
                   aria-valuemax="100">
              </div>
            </div>
            <small class="text-muted">${percentage}%</small>
          </div>
        </div>
      </div>
    `
    }

    elements.resultSection.innerHTML = `
    <div class="container my-4">
      <div class="result-card bg-white p-4 border rounded shadow-sm">
        <!-- Cabeçalho com Score -->
        <div class="text-center mb-4">
          <div class="score-circle ${scoreClass}">
            <span class="display-4">${scorePercentage}%</span>
          </div>
          <h3 class="h5 mt-3 text-${scoreClass}">${
      currentLang === 'en' ? langData.classification : langData.classificacao
    }</h3>
        </div>

        <!-- Análise Linguística -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h4 class="h6 mb-0">
              <i class="fas fa-language me-2"></i>
              ${
                currentLang === 'en'
                  ? 'Linguistic Analysis'
                  : 'Análise Linguística'
              }
            </h4>
          </div>
          <div class="card-body">
            <div class="row">
              ${createIndicatorCard(
                currentLang === 'en' ? 'Sensationalism' : 'Sensacionalismo',
                langData.linguistic_indicators?.sensationalism || 0
              )}
              ${createIndicatorCard(
                currentLang === 'en' ? 'Emotional Appeal' : 'Apelo Emocional',
                langData.linguistic_indicators?.emotional_appeal || 0
              )}
              ${createIndicatorCard(
                currentLang === 'en' ? 'Urgency' : 'Urgência',
                langData.linguistic_indicators?.urgency || 0
              )}
            </div>
            <p class="mt-3 mb-0 text-muted">
              ${
                currentLang === 'en'
                  ? langData.linguistic_indicators?.explanation
                  : langData.indicadores_linguisticos?.explicacao
              }
            </p>
          </div>
        </div>

        <!-- Credibilidade da Fonte -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h4 class="h6 mb-0">
              <i class="fas fa-shield-alt me-2"></i>
              ${
                currentLang === 'en'
                  ? 'Source Credibility'
                  : 'Credibilidade da Fonte'
              }
            </h4>
          </div>
          <div class="card-body">
            <div class="credibility-meter mb-3">
              <div class="progress" style="height: 1.5rem;">
                <div class="progress-bar bg-${getCredibilityClass(
                  langData.source_credibility?.level || 0
                )}"
                     role="progressbar"
                     style="width: ${Math.round(
                       (langData.source_credibility?.level || 0) * 100
                     )}%">
                  ${Math.round(
                    (langData.source_credibility?.level || 0) * 100
                  )}%
                </div>
              </div>
            </div>
            <p class="mb-3">
              ${
                currentLang === 'en'
                  ? langData.source_credibility?.analysis
                  : langData.credibilidade_fonte?.analise
              }
            </p>
            <ul class="list-group list-group-flush">
              ${(currentLang === 'en'
                ? langData.source_credibility?.recommendations
                : langData.credibilidade_fonte?.recomendacoes
              )
                .map(
                  rec =>
                    `<li class="list-group-item"><i class="fas fa-check-circle text-success me-2"></i>${rec}</li>`
                )
                .join('')}
            </ul>
          </div>
        </div>

        <!-- Contexto Temporal -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h4 class="h6 mb-0">
              <i class="fas fa-clock me-2"></i>
              ${currentLang === 'en' ? 'Temporal Context' : 'Contexto Temporal'}
            </h4>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>${currentLang === 'en' ? 'Currentness' : 'Atualidade'}</h6>
                <p class="text-muted">
                  ${
                    currentLang === 'en'
                      ? langData.temporal_context?.currentness
                      : langData.contexto_temporal?.atualidade
                  }
                </p>
              </div>
              <div class="col-md-6">
                <h6>${currentLang === 'en' ? 'Relevance' : 'Relevância'}</h6>
                <p class="text-muted">
                  ${
                    currentLang === 'en'
                      ? langData.temporal_context?.relevance
                      : langData.contexto_temporal?.relevancia
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Análise Detalhada -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h4 class="h6 mb-0">
              <i class="fas fa-search-plus me-2"></i>
              ${
                currentLang === 'en' ? 'Detailed Analysis' : 'Análise Detalhada'
              }
            </h4>
          </div>
          <div class="card-body">
            <p class="mb-4">
              ${
                currentLang === 'en'
                  ? langData.detailed_analysis
                  : langData.analise_detalhada
              }
            </p>

            <!-- Elementos Verificados -->
            <div class="mb-3">
              <h6 class="text-success">
                <i class="fas fa-check me-2"></i>
                ${
                  currentLang === 'en'
                    ? 'Verified Elements'
                    : 'Elementos Verificados'
                }
              </h6>
              <ul class="list-unstyled">
                ${(currentLang === 'en'
                  ? langData.true_elements
                  : langData.elementos_verdadeiros
                )
                  .map(
                    item =>
                      `<li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>${item}</li>`
                  )
                  .join('')}
              </ul>
            </div>

            <!-- Elementos Falsos -->
            <div class="mb-3">
              <h6 class="text-danger">
                <i class="fas fa-times me-2"></i>
                ${currentLang === 'en' ? 'False Elements' : 'Elementos Falsos'}
              </h6>
              <ul class="list-unstyled">
                ${(currentLang === 'en'
                  ? langData.false_elements
                  : langData.elementos_falsos
                )
                  .map(
                    item =>
                      `<li class="mb-2"><i class="fas fa-times-circle text-danger me-2"></i>${item}</li>`
                  )
                  .join('')}
              </ul>
            </div>

            <!-- Pontos Suspeitos -->
            <div class="mb-3">
              <h6 class="text-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${
                  currentLang === 'en'
                    ? 'Suspicious Points'
                    : 'Pontos Suspeitos'
                }
              </h6>
              <ul class="list-unstyled">
                ${(currentLang === 'en'
                  ? langData.suspicious_points
                  : langData.elementos_suspeitos
                )
                  .map(
                    item =>
                      `<li class="mb-2"><i class="fas fa-exclamation-circle text-warning me-2"></i>${item}</li>`
                  )
                  .join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Recomendações e Considerações Adicionais -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h4 class="h6 mb-0">
<i class="fas fa-lightbulb me-2"></i>
              ${
                currentLang === 'en'
                  ? 'Recommendations & Additional Considerations'
                  : 'Recomendações e Considerações Adicionais'
              }
            </h4>
          </div>
          <div class="card-body">
            <!-- Recomendações -->
            <div class="mb-4">
              <h6>${
                currentLang === 'en' ? 'Recommendations' : 'Recomendações'
              }</h6>
              <ul class="list-group list-group-flush">
                ${(currentLang === 'en'
                  ? langData.recommendations
                  : langData.recomendacoes
                )
                  .map(
                    rec => `
                    <li class="list-group-item">
                      <i class="fas fa-check-circle text-success me-2"></i>${rec}
                    </li>
                  `
                  )
                  .join('')}
              </ul>
            </div>

            <!-- Considerações Adicionais -->
            <div class="mb-4">
              <h6>${
                currentLang === 'en'
                  ? 'Additional Considerations'
                  : 'Considerações Adicionais'
              }</h6>
              <ul class="list-group list-group-flush">
                ${(currentLang === 'en'
                  ? langData.additional_considerations
                  : langData.consideracoes_adicionais
                )
                  .map(
                    consideration => `
                    <li class="list-group-item">
                      <i class="fas fa-info-circle text-info me-2"></i>${consideration}
                    </li>
                  `
                  )
                  .join('')}
              </ul>
            </div>

            <!-- Referências Relacionadas -->
            <div>
              <h6>${
                currentLang === 'en'
                  ? 'Related References'
                  : 'Referências Relacionadas'
              }</h6>
              <ul class="list-group list-group-flush">
                ${(currentLang === 'en'
                  ? langData.related_references
                  : langData.referencias_relacionadas
                )
                  .map(
                    ref => `
                    <li class="list-group-item">
                      <i class="fas fa-link text-primary me-2"></i>${ref}
                    </li>
                  `
                  )
                  .join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Seção de Feedback -->
        <div class="feedback-section mt-4" data-verification-id="${
          verification.id
        }">
        </div>
      </div>
    </div>
  `

    // Adicionar a seção de feedback com verificações
    const feedbackSection = resultElement.querySelector('.feedback-section')
    if (feedbackSection) {
      feedbackSection.innerHTML = displayFeedbackSection(verification)
      feedbackSection.querySelectorAll('.btn-feedback').forEach(button => {
        button.addEventListener('click', function () {
          handleFeedback(this, feedbackSection)
        })
      })
    }

    // Mostrar a seção de resultados
    const resultSectionElement = document.getElementById('result-section')
    if (resultSectionElement) {
      resultSectionElement.classList.remove('d-none')
    }
  } catch (error) {
    console.error('Erro ao exibir resultados:', error)
  }
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
