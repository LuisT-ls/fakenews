/**
 * accessibility.js - Recursos de acessibilidade
 * Este módulo gerencia os recursos de acessibilidade da aplicação
 */

// Tamanho da Fonte
let currentFontSize = 100

/**
 * Define o nível de contraste da interface
 * @param {string} type - Tipo de contraste (high/normal)
 */
export function setContrast(type) {
  console.log(`Definindo contraste: ${type}`)
  if (type === 'high') {
    document.body.classList.add('high-contrast')
    localStorage.setItem('contrast', 'high')
  } else {
    document.body.classList.remove('high-contrast')
    localStorage.setItem('contrast', 'normal')
  }
}

/**
 * Altera o tamanho da fonte
 * @param {string} action - Ação a ser executada (increase/decrease/reset)
 */
export function changeFontSize(action) {
  console.log(`Alterando tamanho da fonte: ${action}`)
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
export function changeLineSpacing(type) {
  console.log(`Alterando espaçamento: ${type}`)
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
export function toggleHighlightLinks(enabled) {
  console.log(`Alterando destaque de links: ${enabled}`)
  if (enabled) {
    document.body.classList.add('highlight-links')
    localStorage.setItem('highlightLinks', 'true')
  } else {
    document.body.classList.remove('highlight-links')
    localStorage.setItem('highlightLinks', 'false')
  }
}

/**
 * Carrega as preferências de acessibilidade salvas
 */
export function loadAccessibilityPreferences() {
  console.log('Carregando preferências de acessibilidade')

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
    const toggle = document.getElementById('highlightLinksToggle')
    if (toggle) toggle.checked = true
    toggleHighlightLinks(true)
  }
}

/**
 * Configura os event listeners de acessibilidade
 */
export function setupAccessibilityListeners() {
  console.log('Configurando listeners de acessibilidade')

  const contrastButtons = document.querySelectorAll(
    'button[onclick*="setContrast"]'
  )
  contrastButtons.forEach(button => {
    const type = button.getAttribute('onclick').includes('high')
      ? 'high'
      : 'normal'
    button.removeAttribute('onclick')
    button.addEventListener('click', () => setContrast(type))
    console.log(`Botão de contraste configurado: ${type}`)
  })

  const fontSizeButtons = document.querySelectorAll(
    'button[onclick*="changeFontSize"]'
  )
  fontSizeButtons.forEach(button => {
    const attr = button.getAttribute('onclick')
    let action = 'reset'
    if (attr.includes('increase')) action = 'increase'
    else if (attr.includes('decrease')) action = 'decrease'

    button.removeAttribute('onclick')
    button.addEventListener('click', () => changeFontSize(action))
    console.log(`Botão de tamanho de fonte configurado: ${action}`)
  })

  const lineSpacingButtons = document.querySelectorAll(
    'button[onclick*="changeLineSpacing"]'
  )
  lineSpacingButtons.forEach(button => {
    const type = button.getAttribute('onclick').includes('large')
      ? 'large'
      : 'normal'
    button.removeAttribute('onclick')
    button.addEventListener('click', () => changeLineSpacing(type))
    console.log(`Botão de espaçamento configurado: ${type}`)
  })

  const highlightLinksToggle = document.getElementById('highlightLinksToggle')
  if (highlightLinksToggle) {
    highlightLinksToggle.removeAttribute('onchange')
    highlightLinksToggle.addEventListener('change', e =>
      toggleHighlightLinks(e.target.checked)
    )
    console.log('Toggle de destaque de links configurado')
  }
}

export default {
  setContrast,
  changeFontSize,
  changeLineSpacing,
  toggleHighlightLinks,
  loadAccessibilityPreferences,
  setupAccessibilityListeners
}
