// translations.js
const translations = {
  en: {
    // Navigation
    'Verificador de Fake News': 'Fake News Detector',
    'Como Funciona': 'How It Works',
    Dicas: 'Tips',
    Sobre: 'About',
    'Alternar modo escuro': 'Toggle dark mode',

    // Header
    'Detecte Fake News com IA': 'Detect Fake News with AI',
    'Verifique a credibilidade de notícias em segundos':
      'Check news credibility in seconds',

    // How It Works Section
    'Descubra como funciona nossa análise': 'Discover how our analysis works',
    'Nossa tecnologia de IA analisa o conteúdo em três etapas simples':
      'Our AI technology analyzes content in three simple steps',
    'Cole o Texto': 'Paste Text',
    'Insira o conteúdo que deseja verificar no campo abaixo':
      'Insert the content you want to verify in the field below',
    'Quanto mais completo o texto, mais precisa será a análise.':
      'The more complete the text, the more accurate the analysis will be.',
    'Análise Automática': 'Automatic Analysis',
    'Nossa IA analisa o conteúdo em busca de sinais de desinformação':
      'Our AI analyzes content looking for signs of misinformation',
    'Receba o Resultado': 'Get Results',
    'Obtenha uma análise detalhada sobre a credibilidade do conteúdo':
      "Get a detailed analysis of the content's credibility",

    // Verification Section
    'Verificar Conteúdo': 'Verify Content',
    'Digite ou cole aqui o texto que deseja verificar:':
      'Type or paste here the text you want to verify:',
    'Verificar Agora': 'Verify Now',
    'Verificando...': 'Verifying...',

    // Results Section
    'Resultado da Análise': 'Analysis Result',
    'Compartilhe esta verificação:': 'Share this verification:',

    // History Section
    'Histórico de Verificações': 'Verification History',
    'Limpar Histórico': 'Clear History',
    'Tem certeza que deseja apagar todo o histórico?':
      'Are you sure you want to clear all history?',
    'Esta ação não poderá ser desfeita e você perderá todas as verificações anteriores.':
      'This action cannot be undone and you will lose all previous verifications.',
    Cancelar: 'Cancel',

    // Tips Section
    'Dicas para Identificar Fake News': 'Tips to Identify Fake News',
    'Verifique a Fonte': 'Check the Source',
    'Antes de compartilhar uma notícia, considere:':
      'Before sharing news, consider:',
    'Verifique se o site é conhecido e confiável':
      'Check if the website is known and reliable',
    'Procure informações sobre o autor da notícia':
      'Look for information about the news author',
    'Confira se outros veículos respeitados também publicaram o mesmo conteúdo':
      'Check if other respected outlets have also published the same content',
    'Desconfie de sites com nomes muito similares a portais conhecidos':
      'Be suspicious of sites with names very similar to known portals',

    'Analise a Data': 'Check the Date',
    'A data de publicação é crucial:': 'The publication date is crucial:',
    'Verifique quando a notícia foi publicada originalmente':
      'Check when the news was originally published',
    'Fique atento a conteúdos antigos sendo repostados como novos':
      'Be aware of old content being reposted as new',
    'Considere se o contexto temporal faz sentido':
      'Consider if the temporal context makes sense',
    'Busque atualizações mais recentes sobre o assunto':
      'Look for more recent updates on the subject',

    'Pesquise em Outras Fontes': 'Research Other Sources',
    'Compare as informações:': 'Compare the information:',
    'Procure a mesma notícia em diferentes veículos de comunicação':
      'Look for the same news in different media outlets',
    'Consulte agências de fact-checking': 'Consult fact-checking agencies',
    'Verifique se há consenso entre fontes confiáveis':
      'Check if there is consensus among reliable sources',
    'Desconfie quando apenas um site está noticiando algo "bombástico"':
      'Be suspicious when only one site is reporting something "explosive"',

    'Identifique Sinais de Alerta': 'Identify Warning Signs',
    'Fique atento a estes sinais:': 'Watch out for these signs:',
    'Títulos muito chamativos ou alarmistas': 'Very flashy or alarmist titles',
    'Erros de português e formatação': 'Grammar and formatting errors',
    'Pedidos urgentes de compartilhamento': 'Urgent sharing requests',
    'Uso excessivo de pontuação (!!! ???)':
      'Excessive use of punctuation (!!! ???)',
    'Afirmações muito extremas ou improváveis':
      'Very extreme or unlikely claims',

    'Verifique Imagens e Vídeos': 'Check Images and Videos',
    'Ao analisar conteúdo visual:': 'When analyzing visual content:',
    'Faça uma busca reversa da imagem no Google':
      'Do a reverse image search on Google',
    'Verifique se a imagem foi manipulada ou tirada de contexto':
      'Check if the image was manipulated or taken out of context',
    'Procure a fonte original do vídeo': 'Look for the original video source',
    'Observe detalhes como data, local e elementos visuais que possam indicar manipulação':
      'Look for details like date, location, and visual elements that might indicate manipulation',

    // Footer
    'Sobre o Projeto': 'About the Project',
    'Links Úteis': 'Useful Links',
    Contato: 'Contact',
    'Este projeto foi desenvolvido com a missão de combater a desinformação e estimular o pensamento crítico. Ele é fruto do trabalho final na disciplina "Algoritmo, Política e Sociedade", ministrada pelo professor Dr. Paulo Fonseca na Universidade Federal da Bahia.':
      'This project was developed with the mission of combating misinformation and stimulating critical thinking. It is the result of the final work in the "Algorithm, Politics and Society" course, taught by Professor Dr. Paulo Fonseca at the Federal University of Bahia.',
    'Todos os direitos reservados.': 'All rights reserved.',
    'Política de Privacidade': 'Privacy Policy',
    'Termos de Uso': 'Terms of Service',
    '© 2025 Verificador de Fake News.': '© 2025 Fake News Detector.',

    // Notifications
    Notificação: 'Notification',
    Fechar: 'Close',

    // Modal
    'Limpar Histórico': 'Clear History',
    'Tem certeza que deseja apagar todo o histórico?':
      'Are you sure you want to clear all history?',
    'Esta ação não poderá ser desfeita': 'This action cannot be undone',

    // Social Media
    'Perfil no Facebook de Luis Teixeira': "Luis Teixeira's Facebook Profile",
    'Perfil no X (Twitter) de Luis Teixeira':
      "Luis Teixeira's X (Twitter) Profile",
    'Perfil no Instagram de Luis Teixeira': "Luis Teixeira's Instagram Profile",
    'Perfil no LinkedIn de Luis Teixeira': "Luis Teixeira's LinkedIn Profile"
  }
}

// Rest of the file remains the same as it handles the translation functionality
function addLanguageSwitcher() {
  const navbarNav = document.querySelector('#navbarNav .navbar-nav')
  const langSwitcher = document.createElement('li')
  langSwitcher.className = 'nav-item'
  langSwitcher.innerHTML = `
    <button class="nav-link btn btn-link" id="languageSwitcher">
      <i class="fas fa-globe me-1"></i>
      <span class="language-text">EN</span>
    </button>
  `
  navbarNav.appendChild(langSwitcher)
}

function initializeLanguageSwitcher() {
  const currentLang = localStorage.getItem('language') || 'pt'
  document.documentElement.lang = currentLang

  const switcher = document.getElementById('languageSwitcher')
  if (switcher) {
    switcher.addEventListener('click', toggleLanguage)
    updateLanguageButton(currentLang)
  }

  if (currentLang === 'en') {
    translatePage('en')
  }
}

function toggleLanguage() {
  const currentLang = document.documentElement.lang
  const newLang = currentLang === 'pt' ? 'en' : 'pt'

  document.documentElement.lang = newLang
  localStorage.setItem('language', newLang)

  if (newLang === 'en') {
    translatePage('en')
  } else {
    location.reload()
  }

  updateLanguageButton(newLang)
}

function updateLanguageButton(lang) {
  const langText = document.querySelector('.language-text')
  if (langText) {
    langText.textContent = lang === 'pt' ? 'EN' : 'PT'
  }
}

function translatePage(targetLang) {
  if (elements.length === 0) {
    addTranslateAttributes(document.body)
  }

  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate')
    if (translations[targetLang] && translations[targetLang][key]) {
      element.textContent = translations[targetLang][key]
    }
  })

  if (targetLang === 'en') {
    updateMetaTags()
  }
}

function addTranslateAttributes(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  let node
  while ((node = walker.nextNode())) {
    const parent = node.parentElement
    const text = node.textContent.trim()

    if (
      text &&
      !parent.hasAttribute('data-translate') &&
      translations.en[text]
    ) {
      parent.setAttribute('data-translate', text)
    }
  }
}

function updateMetaTags() {
  const metaDescription = document.querySelector('meta[name="description"]')
  const ogTitle = document.querySelector('meta[property="og:title"]')
  const ogDescription = document.querySelector(
    'meta[property="og:description"]'
  )

  if (metaDescription) {
    metaDescription.content =
      'Free fake news verification tool using Artificial Intelligence. Analyze news, messages, and suspicious content in seconds with accuracy and reliability. Fight misinformation with technology.'
  }

  if (ogTitle) {
    ogTitle.content = 'Fake News Detector'
  }

  if (ogDescription) {
    ogDescription.content =
      'Online tool to help identify fake news and misinformation. Verify news credibility quickly.'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  addLanguageSwitcher()
  initializeLanguageSwitcher()
})
