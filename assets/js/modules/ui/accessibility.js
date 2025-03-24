/**
 * Módulo para gerenciar recursos de acessibilidade
 */

import {
  loadAccessibilitySetting,
  saveAccessibilitySetting
} from '../utils/storage.js'
import { getFontSize, setFontSize } from '../state/store.js'

/**
 * Inicializa os recursos de acessibilidade
 */
export function initAccessibilityFeatures() {
  // Carregar preferências salvas

  // Carregar contraste
  const savedContrast = loadAccessibilitySetting('contrast', 'normal')
  if (savedContrast === 'high') {
    setContrast('high')
  }

  // Carregar tamanho da fonte
  const savedFontSize = loadAccessibilitySetting('fontSize', '100')
  if (savedFontSize) {
    const fontSize = parseInt(savedFontSize)
    setFontSize(fontSize)
    document.body.style.fontSize = `${fontSize}%`
  }

  // Carregar espaçamento
  const savedLineSpacing = loadAccessibilitySetting('lineSpacing', 'normal')
  if (savedLineSpacing === 'large') {
    changeLineSpacing('large')
  }

  // Carregar destaque de links
  const savedHighlightLinks = loadAccessibilitySetting(
    'highlightLinks',
    'false'
  )
  if (savedHighlightLinks === 'true') {
    const highlightToggle = document.getElementById('highlightLinksToggle')
    if (highlightToggle) {
      highlightToggle.checked = true
    }
    toggleHighlightLinks(true)
  }

  // Configurar listeners para controles de acessibilidade
  setupAccessibilityControls()
}

/**
 * Configura os listeners para os controles de acessibilidade
 */
function setupAccessibilityControls() {
  // Controle de contraste
  const contrastControls = document.querySelectorAll('[data-contrast]')
  contrastControls.forEach(control => {
    control.addEventListener('click', () => {
      const contrastType = control.getAttribute('data-contrast')
      setContrast(contrastType)
    })
  })

  // Controle de tamanho de fonte
  const fontSizeControls = document.querySelectorAll('[data-font-size]')
  fontSizeControls.forEach(control => {
    control.addEventListener('click', () => {
      const action = control.getAttribute('data-font-size')
      changeFontSize(action)
    })
  })

  // Controle de espaçamento
  const spacingControls = document.querySelectorAll('[data-spacing]')
  spacingControls.forEach(control => {
    control.addEventListener('click', () => {
      const spacingType = control.getAttribute('data-spacing')
      changeLineSpacing(spacingType)
    })
  })

  // Controle de destaque de links
  const highlightLinksToggle = document.getElementById('highlightLinksToggle')
  if (highlightLinksToggle) {
    highlightLinksToggle.addEventListener('change', e => {
      toggleHighlightLinks(e.target.checked)
    })
  }
}

/**
 * Define o nível de contraste da interface
 * @param {string} type - Tipo de contraste (high/normal)
 */
export function setContrast(type) {
  if (type === 'high') {
    document.body.classList.add('high-contrast')
    saveAccessibilitySetting('contrast', 'high')
  } else {
    document.body.classList.remove('high-contrast')
    saveAccessibilitySetting('contrast', 'normal')
  }
}

/**
 * Altera o tamanho da fonte
 * @param {string} action - Ação a ser executada (increase/decrease/reset)
 */
export function changeFontSize(action) {
  let currentFontSize = getFontSize()

  if (action === 'increase' && currentFontSize < 140) {
    currentFontSize += 20
  } else if (action === 'decrease' && currentFontSize > 60) {
    // Limite mínimo de 60%
    currentFontSize -= 20
  } else if (action === 'reset') {
    currentFontSize = 100
  }

  document.body.style.fontSize = `${currentFontSize}%`
  saveAccessibilitySetting('fontSize', currentFontSize)
  setFontSize(currentFontSize)
}

/**
 * Altera o espaçamento entre linhas
 * @param {string} type - Tipo de espaçamento (large/normal)
 */
export function changeLineSpacing(type) {
  if (type === 'large') {
    document.body.classList.add('large-spacing')
    saveAccessibilitySetting('lineSpacing', 'large')
  } else {
    document.body.classList.remove('large-spacing')
    saveAccessibilitySetting('lineSpacing', 'normal')
  }
}

/**
 * Ativa/desativa o destaque de links
 * @param {boolean} enabled - Estado do destaque de links
 */
export function toggleHighlightLinks(enabled) {
  if (enabled) {
    document.body.classList.add('highlight-links')
    saveAccessibilitySetting('highlightLinks', 'true')
  } else {
    document.body.classList.remove('highlight-links')
    saveAccessibilitySetting('highlightLinks', 'false')
  }
}
