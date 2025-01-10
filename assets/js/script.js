// Estado global da aplicação
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

// Inicialização com Event Delegation
document.addEventListener('DOMContentLoaded', () => {
  loadVerificationHistory()
  initThemeSwitch()

  // Event Delegation
  document.addEventListener('click', handleGlobalClicks)
  elements.userInput.addEventListener('input', () => {
    elements.verifyButton.disabled = !elements.userInput.value.trim()
  })

  document
    .getElementById('confirmClearHistory')
    ?.addEventListener('click', () => {
      // Limpa o histórico
      verificationHistory = []
      localStorage.removeItem('verificationHistory')
      updateHistoryDisplay()

      // Fecha o modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('clearHistoryModal')
      )
      modal.hide()

      // Mostra notificação de sucesso
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

  const trigger = document.querySelector('.expand-trigger')
  const content = document.querySelector('.expand-content')

  trigger.addEventListener('click', function () {
    this.classList.toggle('active')
    content.classList.toggle('show')

    // Smooth scroll to content when expanding
    if (content.classList.contains('show')) {
      setTimeout(() => {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  })

  const skeletons = document.querySelectorAll('.skeleton-text')
  skeletons.forEach(skeleton => {
    const content = skeleton.dataset.content
    if (content) {
      skeleton.outerHTML = content
    }
  })
})

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
    // Primeiro, buscar a chave API do endpoint seguro
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
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inválida da API')
    }

    return JSON.parse(data.candidates[0].content.parts[0].text.trim())
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

// Funções de UI
function displayResults(verification) {
  if (!verification.geminiAnalysis) {
    elements.result.innerHTML =
      '<div class="alert alert-danger">Não foi possível realizar a análise. Tente novamente.</div>'
    elements.resultSection.classList.remove('d-none')
    return
  }

  const gemini = verification.geminiAnalysis
  const scorePercentage = Math.round(verification.overallScore * 100)
  const scoreClass = getScoreClass(verification.overallScore)

  elements.result.innerHTML = `
    <div class="result-card p-4 border rounded shadow-sm">
      <div class="mb-4 text-center">
        <div class="display-4 text-${scoreClass}">${scorePercentage}%</div>
        <h3 class="h5">${gemini.classificacao}</h3>
      </div>

      <div class="progress mb-4" style="height: 25px;">
        <div class="progress-bar bg-${scoreClass}"
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

      ${generateAnalysisSections(gemini)}
      
      <div class="card mb-3">
        <div class="card-body">
          <h4 class="h6 mb-3">Análise Detalhada</h4>
          <p class="mb-0">${gemini.analise_detalhada}</p>
        </div>
      </div>

      <div class="feedback-section mt-4 text-center" data-verification-id="${
        verification.id
      }">
        <div class="small text-muted mb-2">Esta análise foi útil?</div>
        <div class="btn-group btn-group-sm" role="group" aria-label="Feedback">
          <button class="btn btn-outline-success btn-feedback" data-feedback="positive">
            <i class="fas fa-thumbs-up"></i>
          </button>
          <button class="btn btn-outline-danger btn-feedback" data-feedback="negative">
            <i class="fas fa-thumbs-down"></i>
          </button>
        </div>
      </div>
    </div>
  `

  const feedbackSection = elements.result.querySelector('.feedback-section')
  feedbackSection.querySelectorAll('.btn-feedback').forEach(button => {
    button.addEventListener('click', function () {
      handleFeedback(this, feedbackSection)
    })
  })

  elements.resultSection.classList.remove('d-none')
}

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

  // Substituir os botões por uma mensagem de agradecimento
  setTimeout(() => {
    feedbackSection.innerHTML = `
      <div class="text-muted small">
        <i class="fas fa-check-circle text-success"></i>
        Obrigado pelo seu feedback!
      </div>
    `
  }, 1000)

  // Salvar o feedback
  submitFeedback(feedbackType)
}

// Função para gerar seções de análise
function generateAnalysisSections(gemini) {
  const sections = [
    {
      title: 'Elementos Verificados',
      items: gemini.elementos_verdadeiros,
      colorClass: 'success',
      icon: 'check-circle'
    },
    {
      title: 'Elementos Falsos',
      items: gemini.elementos_falsos,
      colorClass: 'danger',
      icon: 'times-circle'
    },
    {
      title: 'Pontos Suspeitos',
      items: gemini.elementos_suspeitos,
      colorClass: 'warning',
      icon: 'exclamation-triangle'
    },
    {
      title: 'Recomendações',
      items: gemini.recomendacoes,
      colorClass: 'info',
      icon: 'lightbulb'
    }
  ]

  return sections
    .map(({ title, items, colorClass, icon }) =>
      items?.length
        ? `
        <div class="mb-3">
          <h4 class="h6 mb-2">${title}</h4>
          <div class="list-group">
            ${items
              .map(
                item => `
              <div class="list-group-item list-group-item-${colorClass}">
                <i class="fas fa-${icon} me-2"></i>${item}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        : ''
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
  const toast = new bootstrap.Toast(elements.notificationToast)
  elements.notificationToast.querySelector('.toast-body').textContent = message
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
const defaultText = 'Digite ou cole aqui o texto que deseja verificar...'

userInput.addEventListener('focus', () => {
  if (userInput.value === defaultText) {
    userInput.value = ''
    userInput.style.color = '#000'
  }
})

userInput.addEventListener('blur', () => {
  if (userInput.value.trim() === '') {
    userInput.value = defaultText
    userInput.style.color = '#6c757d'
  }
})
