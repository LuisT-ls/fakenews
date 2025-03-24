// Estado global da aplicação
let verificationHistory = []

/**
 * Objeto que armazena referências aos elementos do DOM frequentemente utilizados
 * Centraliza o acesso aos elementos para facilitar manutenção e evitar repetição
 */
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

/**
 * Inicializa a aplicação quando o DOM é carregado
 * Configura event listeners, carrega histórico e inicializa componentes
 */
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

/**
 * Compartilha o conteúdo da análise em diferentes plataformas sociais
 * @param {string} platform - Plataforma de compartilhamento (twitter, whatsapp, telegram)
 */
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

/**
 * Gerencia clicks globais da aplicação usando event delegation
 * @param {Event} e - Evento de click
 */
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

/**
 * Realiza uma análise local do texto em busca de sinais de fake news
 * @param {string} text - Texto a ser verificado
 * @returns {Promise<Object>} Resultado da análise
 */
async function checkWithGemini(text) {
  try {
    // Em vez de chamar a API externa, vamos fazer análise local
    const lowercaseText = text.toLowerCase()

    // Identificar sinais de fake news no texto
    const redFlags = [
      {
        pattern: /urgente[!]+/i,
        weight: 0.15,
        description: "Uso de 'URGENTE' com múltiplas exclamações"
      },
      {
        pattern: /compartilhe (antes|agora|já|imediatamente)/i,
        weight: 0.1,
        description: 'Pedido urgente de compartilhamento'
      },
      {
        pattern:
          /(médicos|cientistas|especialistas) (escondem|não querem que você saiba)/i,
        weight: 0.12,
        description: 'Alegação de conspiração por autoridades'
      },
      {
        pattern:
          /(cura|tratamento|remédio) (milagroso|secreto|censurado|que não querem que você saiba)/i,
        weight: 0.13,
        description: 'Alegação de cura milagrosa'
      },
      {
        pattern:
          /isso (a mídia|a imprensa|os jornais|a globo|os jornalistas) não mostra[m]?/i,
        weight: 0.1,
        description: 'Desconfiança generalizada da mídia'
      },
      {
        pattern: /[!]{3,}/g,
        weight: 0.08,
        description: 'Excesso de pontuação de exclamação'
      },
      {
        pattern: /[?]{3,}/g,
        weight: 0.05,
        description: 'Excesso de pontuação interrogativa'
      },
      {
        pattern: /fonte: (whatsapp|telegram|amigo meu|grupo do)/i,
        weight: 0.15,
        description: 'Fontes não verificáveis'
      },
      {
        pattern: /100% (comprovado|verificado|garantido)/i,
        weight: 0.1,
        description: 'Alegações absolutas de veracidade'
      },
      {
        pattern:
          /(governo|autoridades) (querem|estão|vão) (esconder|censurar|proibir)/i,
        weight: 0.1,
        description: 'Narrativa de conspiração governamental'
      }
    ]

    // Elementos positivos de credibilidade
    const credibilitySignals = [
      {
        pattern:
          /(segundo|de acordo com|conforme) (pesquisa|estudo|levantamento|dados)/i,
        weight: 0.12,
        description: 'Referência a estudos ou pesquisas'
      },
      {
        pattern: /publicado (n[ao]|pel[ao]) (revista|jornal|portal|site)/i,
        weight: 0.1,
        description: 'Cita publicação em veículos de mídia'
      },
      {
        pattern: /(em entrevista|declarou|afirmou|disse) ([aà]|para)/i,
        weight: 0.08,
        description: 'Atribuição clara de declarações'
      },
      {
        pattern: /(segundo|conforme) dados (d[aoe]|fornecidos por)/i,
        weight: 0.1,
        description: 'Uso de dados com fonte'
      },
      {
        pattern: /(universidade|instituto|centro de pesquisa)/i,
        weight: 0.1,
        description: 'Menção a instituições de pesquisa'
      }
    ]

    // Calcular pontuação de fake news
    let fakeProbability = 0.5 // Começa neutro
    let detectedRedFlags = []
    let detectedCredibility = []

    // Verifica sinais de alerta
    for (const flag of redFlags) {
      const matches = (lowercaseText.match(flag.pattern) || []).length
      if (matches > 0) {
        fakeProbability += (flag.weight * Math.min(matches, 3)) / 3
        detectedRedFlags.push(flag.description)
      }
    }

    // Verifica sinais de credibilidade
    for (const signal of credibilitySignals) {
      const matches = (lowercaseText.match(signal.pattern) || []).length
      if (matches > 0) {
        fakeProbability -= (signal.weight * Math.min(matches, 3)) / 3
        detectedCredibility.push(signal.description)
      }
    }

    // Garantir que a probabilidade esteja entre 0 e 1
    fakeProbability = Math.max(0, Math.min(1, fakeProbability))

    // Inverter o valor para obter o score de confiabilidade (1 - probabilidade de fake)
    const reliabilityScore = 1 - fakeProbability

    // Determinar classificação baseada no score
    let classification
    if (reliabilityScore >= 0.8) {
      classification = 'Comprovadamente Verdadeiro'
    } else if (reliabilityScore >= 0.6) {
      classification = 'Parcialmente Verdadeiro'
    } else if (reliabilityScore >= 0.4) {
      classification = 'Não Verificável'
    } else if (reliabilityScore >= 0.2) {
      classification = 'Provavelmente Falso'
    } else {
      classification = 'Comprovadamente Falso'
    }

    // Preparar resultado da análise
    return {
      score: reliabilityScore,
      confiabilidade: reliabilityScore,
      classificacao: classification,
      explicacao_score: getScoreExplanation(reliabilityScore),
      elementos_verdadeiros: detectedCredibility,
      elementos_falsos: [],
      elementos_suspeitos: detectedRedFlags,
      fontes_confiaveis: [],
      indicadores_desinformacao: detectedRedFlags,
      analise_detalhada: generateDetailedAnalysis(
        text,
        reliabilityScore,
        detectedRedFlags,
        detectedCredibility
      ),
      recomendacoes: generateRecommendations(
        reliabilityScore,
        detectedRedFlags
      ),
      limitacao_temporal: {
        afeta_analise: false,
        elementos_nao_verificaveis: [],
        sugestoes_verificacao: [
          'Busque o conteúdo em sites de fact-checking',
          'Verifique em mais de uma fonte confiável',
          'Pesquise a origem da informação'
        ]
      }
    }
  } catch (error) {
    console.error('Erro na análise:', error)
    throw error
  }
}

/**
 * Gera explicação para o score obtido
 * @param {number} score - Score de confiabilidade
 * @returns {string} Explicação do score
 */
function getScoreExplanation(score) {
  if (score >= 0.8) {
    return 'O conteúdo apresenta alto grau de confiabilidade, com elementos que indicam informação verificável e fontes confiáveis.'
  } else if (score >= 0.6) {
    return 'O conteúdo apresenta boa confiabilidade, mas contém alguns elementos que merecem verificação adicional.'
  } else if (score >= 0.4) {
    return 'O conteúdo possui elementos tanto de confiabilidade quanto de suspeita, sendo recomendável verificação em outras fontes.'
  } else if (score >= 0.2) {
    return 'O conteúdo apresenta vários sinais de alerta típicos de desinformação, sendo pouco confiável.'
  } else {
    return 'O conteúdo apresenta múltiplos indicadores de desinformação e características comuns de fake news.'
  }
}

/**
 * Gera análise detalhada do texto
 * @param {string} text - Texto analisado
 * @param {number} score - Score de confiabilidade
 * @param {Array} redFlags - Indicadores de fake news encontrados
 * @param {Array} credibility - Indicadores de credibilidade encontrados
 * @returns {string} Análise detalhada
 */
function generateDetailedAnalysis(text, score, redFlags, credibility) {
  let analysis = `O texto apresenta um nível de confiabilidade ${Math.round(
    score * 100
  )}%. `

  if (redFlags.length > 0) {
    analysis += `Foram identificados ${
      redFlags.length
    } elementos que podem indicar desinformação, como: ${redFlags.join(', ')}. `
  } else {
    analysis += 'Não foram identificados sinais claros de desinformação. '
  }

  if (credibility.length > 0) {
    analysis += `Por outro lado, foram encontrados ${
      credibility.length
    } elementos que sugerem credibilidade: ${credibility.join(', ')}. `
  } else {
    analysis +=
      'Porém, não foram encontrados elementos que reforcem claramente a credibilidade do conteúdo. '
  }

  analysis += `É importante ressaltar que esta é uma análise automatizada e preliminar, baseada em padrões textuais comuns. Para uma verificação completa, recomenda-se conferir a informação em múltiplas fontes confiáveis.`

  return analysis
}

/**
 * Gera recomendações baseadas no score e indicadores
 * @param {number} score - Score de confiabilidade
 * @param {Array} redFlags - Indicadores de fake news encontrados
 * @returns {Array} Lista de recomendações
 */
function generateRecommendations(score, redFlags) {
  const recommendations = [
    "Verifique a informação em sites de fact-checking como 'Aos Fatos' e 'Lupa'",
    'Busque a notícia em veículos de imprensa reconhecidos',
    'Verifique a data de publicação da informação'
  ]

  if (score < 0.5) {
    recommendations.push('Tenha cautela antes de compartilhar este conteúdo')
    recommendations.push('Pesquise sobre o tema em múltiplas fontes')
  }

  if (
    redFlags.some(
      flag => flag.includes('conspiração') || flag.includes('esconder')
    )
  ) {
    recommendations.push(
      'Desconfie de teorias conspiracionistas sem evidências sólidas'
    )
  }

  if (
    redFlags.some(
      flag => flag.includes('URGENTE') || flag.includes('compartilhamento')
    )
  ) {
    recommendations.push(
      'Mensagens que pedem compartilhamento urgente geralmente são suspeitas'
    )
  }

  return recommendations
}

/**
 * Inicializa e configura o switch de tema (claro/escuro)
 */
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

/**
 * Gerencia o processo de verificação do texto
 * Coordena a interação com a API e atualização da UI
 */
async function handleVerification() {
  const text = elements.userInput.value.trim()
  if (!text) return

  showLoadingState(true)

  try {
    const analysisResult = await checkWithGemini(text)
    const verification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      geminiAnalysis: analysisResult,
      overallScore: analysisResult.score
    }

    displayResults(verification)
    saveVerification(verification)
  } catch (error) {
    console.error('Erro durante a verificação:', error)
    showNotification(
      'Ocorreu um erro durante a verificação. Usando análise de emergência.',
      'warning'
    )

    // Análise de emergência em caso de falha total
    const fallbackAnalysis = {
      score: 0.5,
      confiabilidade: 0.5,
      classificacao: 'Não Verificável',
      explicacao_score:
        'Não foi possível realizar a análise completa. Esta é uma avaliação de emergência.',
      elementos_verdadeiros: [],
      elementos_falsos: [],
      elementos_suspeitos: [
        'Sistema não conseguiu analisar o conteúdo completamente'
      ],
      fontes_confiaveis: [],
      indicadores_desinformacao: [],
      analise_detalhada:
        'O sistema não conseguiu completar a análise. Recomendamos verificar a informação em sites de fact-checking confiáveis e fontes oficiais.',
      recomendacoes: [
        'Verifique a informação em sites de fact-checking',
        'Consulte fontes oficiais sobre o assunto',
        'Busque a notícia em veículos de imprensa reconhecidos'
      ],
      limitacao_temporal: {
        afeta_analise: true,
        elementos_nao_verificaveis: ['Conteúdo completo'],
        sugestoes_verificacao: ['Busque fontes alternativas']
      }
    }

    const verification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      geminiAnalysis: fallbackAnalysis,
      overallScore: 0.5
    }

    displayResults(verification)
    saveVerification(verification)
  } finally {
    showLoadingState(false)
  }
}

/**
 * Exibe os resultados da verificação na interface
 * @param {Object} verification - Objeto contendo os resultados da verificação
 */
function displayResults(verification) {
  const currentLang = document.documentElement.lang

  if (!verification.geminiAnalysis) {
    const errorMessage = translateDynamicContent(
      'Não foi possível realizar a análise. Tente novamente.',
      currentLang
    )
    elements.result.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`
    elements.resultSection.classList.remove('d-none')
    return
  }

  const gemini = verification.geminiAnalysis
  const scorePercentage = Math.round(verification.overallScore * 100)
  const scoreClass = getScoreClass(verification.overallScore)

  // Translate classification
  const translatedClassification = translateDynamicContent(
    gemini.classificacao,
    currentLang
  )

  // Componente de alerta temporal
  const temporalAlert = gemini.limitacao_temporal?.afeta_analise
    ? `
    <div class="alert alert-warning mb-4">
      <i class="fas fa-clock me-2"></i>
      <strong>Aviso de Limitação Temporal:</strong>
      <p class="mb-2">Esta análise possui elementos posteriores a 2022 que não podem ser completamente verificados.</p>
      ${
        gemini.limitacao_temporal.elementos_nao_verificaveis?.length
          ? `<div class="mb-2">
            <strong>Elementos não verificáveis:</strong>
            <ul class="mb-0">
              ${gemini.limitacao_temporal.elementos_nao_verificaveis
                .map(elem => `<li>${elem}</li>`)
                .join('')}
            </ul>
          </div>`
          : ''
      }
      ${
        gemini.limitacao_temporal.sugestoes_verificacao?.length
          ? `<div>
            <strong>Sugestões para verificação:</strong>
            <ul class="mb-0">
              ${gemini.limitacao_temporal.sugestoes_verificacao
                .map(sug => `<li>${sug}</li>`)
                .join('')}
            </ul>
          </div>`
          : ''
      }
    </div>`
    : ''

  elements.result.innerHTML = `
    <div class="result-card p-4 border rounded shadow-sm">
      ${temporalAlert}
      <div class="mb-4 text-center">
        <div class="display-4 text-${scoreClass}">${scorePercentage}%</div>
        <h3 class="h5">${translatedClassification}</h3>
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

  elements.result.innerHTML = `
    <div class="result-card p-4 border rounded shadow-sm">
      <div class="mb-4 text-center">
        <div class="display-4 text-${scoreClass}">${scorePercentage}%</div>
        <h3 class="h5">${translatedClassification}</h3>
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

/**
 * Gerencia o feedback do usuário sobre a análise
 * @param {HTMLElement} button - Botão de feedback clicado
 * @param {HTMLElement} feedbackSection - Seção de feedback no DOM
 */
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

/**
 * Gera as seções HTML para cada parte da análise
 * @param {Object} gemini - Resultado da análise do Gemini
 * @returns {string} HTML das seções de análise
 */
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

/**
 * Determina a classe CSS baseada no score
 * @param {number} score - Score da verificação (0-1)
 * @returns {string} Classe CSS correspondente
 */
function getScoreClass(score) {
  return score >= 0.7 ? 'success' : score >= 0.4 ? 'warning' : 'danger'
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
 * Exibe notificações toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success, info, warning, danger)
 */
function showNotification(message, type = 'info') {
  const currentLang = document.documentElement.lang
  const translatedMessage = translateDynamicContent(message, currentLang)
  const toast = new bootstrap.Toast(elements.notificationToast)
  elements.notificationToast.querySelector('.toast-body').textContent =
    translatedMessage
  elements.notificationToast.className = `toast bg-${type}`
  toast.show()
}

/**
 * Salva uma verificação no histórico
 * @param {Object} verification - Objeto de verificação a ser salvo
 */
function saveVerification(verification) {
  verificationHistory.unshift(verification)
  if (verificationHistory.length > 10) verificationHistory.pop()
  localStorage.setItem(
    'verificationHistory',
    JSON.stringify(verificationHistory)
  )
  updateHistoryDisplay()
}

/**
 * Carrega o histórico de verificações do localStorage
 */
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

/**
 * Atualiza a exibição do histórico na interface
 */
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

/**
 * Gerencia a limpeza do histórico
 */
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

/**
 * Envia feedback do usuário
 * @param {string} type - Tipo de feedback (positive/negative)
 */
function submitFeedback(type) {
  showNotification('Obrigado pelo seu feedback!', 'success')
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

/**
 * Define o nível de contraste da interface
 * @param {string} type - Tipo de contraste (high/normal)
 */
function setContrast(type) {
  if (type === 'high') {
    document.body.classList.add('high-contrast')
    localStorage.setItem('contrast', 'high')
  } else {
    document.body.classList.remove('high-contrast')
    localStorage.setItem('contrast', 'normal')
  }
}

// Tamanho da Fonte
let currentFontSize = 100

/**
 * Altera o tamanho da fonte
 * @param {string} action - Ação a ser executada (increase/decrease/reset)
 */
function changeFontSize(action) {
  if (action === 'increase' && currentFontSize < 140) {
    currentFontSize += 20
  } else if (action === 'decrease' && currentFontSize > 60) {
    // Limite mínimo de 60%
    currentFontSize -= 20
  } else if (action === 'reset') {
    currentFontSize = 100
  }

  document.body.style.fontSize = `${currentFontSize}%`
  localStorage.setItem('fontSize', currentFontSize)
}

/**
 * Altera o espaçamento entre linhas
 * @param {string} type - Tipo de espaçamento (large/normal)
 */
function changeLineSpacing(type) {
  if (type === 'large') {
    document.body.classList.add('large-spacing')
    localStorage.setItem('lineSpacing', 'large')
  } else {
    document.body.classList.remove('large-spacing')
    localStorage.setItem('lineSpacing', 'normal')
  }
}

/**
 * Ativa/desativa o destaque de links
 * @param {boolean} enabled - Estado do destaque de links
 */
function toggleHighlightLinks(enabled) {
  if (enabled) {
    document.body.classList.add('highlight-links')
    localStorage.setItem('highlightLinks', 'true')
  } else {
    document.body.classList.remove('highlight-links')
    localStorage.setItem('highlightLinks', 'false')
  }
}

// Carregar preferências salvas
document.addEventListener('DOMContentLoaded', () => {
  // Carregar contraste
  const savedContrast = localStorage.getItem('contrast')
  if (savedContrast === 'high') {
    setContrast('high')
  }

  // Carregar tamanho da fonte
  const savedFontSize = localStorage.getItem('fontSize')
  if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize)
    document.body.style.fontSize = `${currentFontSize}%`
  }

  // Carregar espaçamento
  const savedLineSpacing = localStorage.getItem('lineSpacing')
  if (savedLineSpacing === 'large') {
    changeLineSpacing('large')
  }

  // Carregar destaque de links
  const savedHighlightLinks = localStorage.getItem('highlightLinks')
  if (savedHighlightLinks === 'true') {
    document.getElementById('highlightLinksToggle').checked = true
    toggleHighlightLinks(true)
  }
})
