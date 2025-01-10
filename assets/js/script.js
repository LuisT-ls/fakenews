// Estado e elementos globais
const state = { verificationHistory: [] }
const el = {
  ui: document.getElementById('userInput'),
  vb: document.getElementById('verifyButton'),
  rs: document.getElementById('result-section'),
  r: document.getElementById('result'),
  vh: document.getElementById('verificationsHistory'),
  ts: document.getElementById('themeSwitcher'),
  sp: document.querySelector('.spinner-border'),
  nt: document.getElementById('notificationToast'),
  ch: document.getElementById('clearHistoryBtn')
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadHistory()
  initTheme()
  document.addEventListener('click', handleGlobalClick)
  el.ui.addEventListener('input', () => (el.vb.disabled = !el.ui.value.trim()))
  document
    .getElementById('confirmClearHistory')
    ?.addEventListener('click', () => {
      state.verificationHistory = []
      localStorage.removeItem('verificationHistory')
      updateHistory()
      bootstrap.Modal.getInstance(
        document.getElementById('clearHistoryModal')
      ).hide()
      showNotif('Histórico apagado com sucesso!', 'success')
    })

  ;['offline', 'online'].forEach(evt =>
    window.addEventListener(evt, () =>
      showNotif(
        evt === 'online'
          ? 'Conexão restabelecida!'
          : 'Você está offline. Algumas funcionalidades podem estar indisponíveis.'
      )
    )
  )

  const trig = document.querySelector('.expand-trigger'),
    cont = document.querySelector('.expand-content')
  trig?.addEventListener('click', function () {
    this.classList.toggle('active')
    cont.classList.toggle('show')
    cont.classList.contains('show') &&
      setTimeout(
        () => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      )
  })

  document.querySelectorAll('.skeleton-text').forEach(s => {
    const c = s.dataset.content
    c && (s.outerHTML = c)
  })
})

// Compartilhamento
const share = p => {
  const r = document.getElementById('result')
  if (!r) return
  const [s, c, a] = ['.display-4', '.h5', '.card p'].map(s =>
    r.querySelector(s)
  )
  if (!s || !c || !a) return
  const m = `🔍 Verifiquei essa informação no Verificador de Fake News!\n\n📊 Resultado: ${
    s.textContent
  } de confiabilidade\n📋 Classificação: ${
    c.textContent
  }\n📝 Análise: ${a.textContent.substring(
    0,
    1500
  )}...\n\nVerifique você também:`
  const u = encodeURIComponent(window.location.href),
    t = encodeURIComponent(m),
    urls = {
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      whatsapp: `https://wa.me/?text=${t} ${u}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`
    }
  window.open(urls[p], '_blank')
}

// Handlers globais
const handleGlobalClick = e => {
  const t = e.target,
    s = t.closest('[data-share]')
  t === el.vb
    ? handleVerify()
    : t === el.ch
    ? handleClearHistory()
    : s && share(s.getAttribute('data-share'))
}

// Verificação com API
async function checkGemini(text) {
  try {
    const kr = await fetch('https://fakenews-sigma.vercel.app/api/getApiKey', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!kr.ok) throw new Error('Falha ao obter API key')
    const { apiKey } = await kr.json()
    const prompt = `Análise detalhada do seguinte texto para verificar sua veracidade:"${text}"...`
    const r = await fetch(
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
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
    const d = await r.json()
    return JSON.parse(d.candidates[0].content.parts[0].text.trim())
  } catch (e) {
    console.error('Erro na análise:', e)
    throw e
  }
}

// Tema
const initTheme = () => {
  const t = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', t)
  updateThemeIcon(t)
  el.ts.addEventListener('click', () => {
    const nt =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light'
        : 'dark'
    document.documentElement.setAttribute('data-theme', nt)
    localStorage.setItem('theme', nt)
    updateThemeIcon(nt)
  })
}

const updateThemeIcon = t =>
  (el.ts.querySelector('i').className =
    t === 'dark' ? 'fas fa-sun' : 'fas fa-moon')

// Verificação
async function handleVerify() {
  const t = el.ui.value.trim()
  if (!t) return
  showLoading(true)
  try {
    const gr = await checkGemini(t)
    const v = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text: t.substring(0, 200) + (t.length > 200 ? '...' : ''),
      geminiAnalysis: gr,
      overallScore: gr.score
    }
    displayResults(v)
    saveVerification(v)
  } catch (e) {
    console.error('Erro:', e)
    showNotif('Erro na verificação. Tente novamente.', 'danger')
  } finally {
    showLoading(false)
  }
}

// UI Helpers
const showLoading = l => {
  el.vb.disabled = l
  el.sp.classList.toggle('d-none', !l)
  el.vb.querySelector('span').textContent = l
    ? 'Verificando...'
    : 'Verificar Agora'
}

const showNotif = (m, t = 'info') => {
  const toast = new bootstrap.Toast(el.nt)
  el.nt.querySelector('.toast-body').textContent = m
  el.nt.className = `toast bg-${t}`
  toast.show()
}

// Histórico
const saveVerification = v => {
  state.verificationHistory.unshift(v)
  if (state.verificationHistory.length > 10) state.verificationHistory.pop()
  localStorage.setItem(
    'verificationHistory',
    JSON.stringify(state.verificationHistory)
  )
  updateHistory()
}

const loadHistory = () => {
  try {
    state.verificationHistory =
      JSON.parse(localStorage.getItem('verificationHistory')) || []
    updateHistory()
  } catch (e) {
    console.error('Erro ao carregar histórico:', e)
    state.verificationHistory = []
  }
}

// Inicialização de elementos UI
const defaultText = 'Digite ou cole aqui o texto que deseja verificar...'
el.ui.addEventListener('focus', () => {
  if (el.ui.value === defaultText) {
    el.ui.value = ''
    el.ui.style.color = '#000'
  }
})

el.ui.addEventListener('blur', () => {
  if (el.ui.value.trim() === '') {
    el.ui.value = defaultText
    el.ui.style.color = '#6c757d'
  }
})
