/**
 * accessibility.js - Recursos de acessibilidade aprimorados
 * Este módulo gerencia os recursos de acessibilidade da aplicação
 */

// Tamanho da Fonte
let currentFontSize = 100
let currentDyslexicMode = false

/**
 * Define o nível de contraste da interface
 * @param {string} type - Tipo de contraste (high/black-yellow/yellow-black/normal)
 */
export function setContrast(type) {
  console.log(`Definindo contraste: ${type}`)

  // Remove todas as classes de contraste
  document.body.classList.remove(
    'high-contrast',
    'black-yellow-contrast',
    'yellow-black-contrast'
  )

  // Aplica a classe apropriada
  if (type === 'high') {
    document.body.classList.add('high-contrast')
    localStorage.setItem('contrast', 'high')
  } else if (type === 'black-yellow') {
    document.body.classList.add('black-yellow-contrast')
    localStorage.setItem('contrast', 'black-yellow')
  } else if (type === 'yellow-black') {
    document.body.classList.add('yellow-black-contrast')
    localStorage.setItem('contrast', 'yellow-black')
  } else {
    localStorage.setItem('contrast', 'normal')
  }

  // Dispara evento para notificar mudança de contraste
  document.dispatchEvent(new CustomEvent('contrastChange', { detail: type }))
}

/**
 * Altera o tamanho da fonte
 * @param {string} action - Ação a ser executada (increase/decrease/reset)
 */
export function changeFontSize(action) {
  console.log(`Alterando tamanho da fonte: ${action}`)
  const prevSize = currentFontSize

  if (action === 'increase' && currentFontSize < 200) {
    // Aumenta em incrementos de 10% para controle mais fino
    currentFontSize += 10
  } else if (action === 'decrease' && currentFontSize > 70) {
    // Limite mínimo de 70%
    currentFontSize -= 10
  } else if (action === 'reset') {
    currentFontSize = 100
  }

  // Aplica o tamanho da fonte no documento
  document.body.style.fontSize = `${currentFontSize}%`
  localStorage.setItem('fontSize', currentFontSize)

  // Dispara evento para notificar mudança de tamanho
  document.dispatchEvent(
    new CustomEvent('fontSizeChange', {
      detail: {
        currentSize: currentFontSize,
        previousSize: prevSize
      }
    })
  )
}

/**
 * Altera o espaçamento entre linhas
 * @param {string} type - Tipo de espaçamento (large/larger/normal)
 */
export function changeLineSpacing(type) {
  console.log(`Alterando espaçamento: ${type}`)

  // Remove todas as classes de espaçamento
  document.body.classList.remove('large-spacing', 'larger-spacing')

  // Aplica a classe apropriada
  if (type === 'large') {
    document.body.classList.add('large-spacing')
    localStorage.setItem('lineSpacing', 'large')
  } else if (type === 'larger') {
    document.body.classList.add('larger-spacing')
    localStorage.setItem('lineSpacing', 'larger')
  } else {
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
 * Ativa/desativa a fonte para dislexia
 * @param {boolean} enabled - Estado da fonte para dislexia
 */
export function toggleDyslexicFont(enabled) {
  console.log(`Alterando fonte para dislexia: ${enabled}`)
  currentDyslexicMode = enabled

  if (enabled) {
    document.body.classList.add('dyslexic-font')
    localStorage.setItem('dyslexicFont', 'true')
  } else {
    document.body.classList.remove('dyslexic-font')
    localStorage.setItem('dyslexicFont', 'false')
  }
}

/**
 * Ativa/desativa animações reduzidas
 * @param {boolean} enabled - Estado de animações reduzidas
 */
export function toggleReducedMotion(enabled) {
  console.log(`Alterando animações: ${enabled ? 'reduzidas' : 'normais'}`)

  if (enabled) {
    document.body.classList.add('reduced-motion')
    localStorage.setItem('reducedMotion', 'true')
  } else {
    document.body.classList.remove('reduced-motion')
    localStorage.setItem('reducedMotion', 'false')
  }
}

/**
 * Ativa/desativa o cursor ampliado
 * @param {boolean} enabled - Estado do cursor ampliado
 */
export function toggleLargeCursor(enabled) {
  console.log(`Alterando cursor: ${enabled ? 'ampliado' : 'normal'}`)

  if (enabled) {
    document.body.classList.add('large-cursor')
    localStorage.setItem('largeCursor', 'true')
  } else {
    document.body.classList.remove('large-cursor')
    localStorage.setItem('largeCursor', 'false')
  }
}

/**
 * Carrega as preferências de acessibilidade salvas
 */
export function loadAccessibilityPreferences() {
  console.log('Carregando preferências de acessibilidade')

  // Carregar contraste
  const savedContrast = localStorage.getItem('contrast')
  if (savedContrast) {
    setContrast(savedContrast)
  }

  // Carregar tamanho da fonte
  const savedFontSize = localStorage.getItem('fontSize')
  if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize)
    document.body.style.fontSize = `${currentFontSize}%`
  }

  // Carregar espaçamento
  const savedLineSpacing = localStorage.getItem('lineSpacing')
  if (savedLineSpacing) {
    changeLineSpacing(savedLineSpacing)
  }

  // Carregar destaque de links
  const savedHighlightLinks = localStorage.getItem('highlightLinks')
  if (savedHighlightLinks === 'true') {
    const toggle = document.getElementById('highlightLinksToggle')
    if (toggle) toggle.checked = true
    toggleHighlightLinks(true)
  }

  // Carregar fonte para dislexia
  const savedDyslexicFont = localStorage.getItem('dyslexicFont')
  if (savedDyslexicFont === 'true') {
    const toggle = document.getElementById('dyslexicFontToggle')
    if (toggle) toggle.checked = true
    toggleDyslexicFont(true)
  }

  // Carregar preferência de animações reduzidas
  const savedReducedMotion = localStorage.getItem('reducedMotion')
  if (savedReducedMotion === 'true') {
    const toggle = document.getElementById('reducedMotionToggle')
    if (toggle) toggle.checked = true
    toggleReducedMotion(true)
  }

  // Carregar preferência de cursor ampliado
  const savedLargeCursor = localStorage.getItem('largeCursor')
  if (savedLargeCursor === 'true') {
    const toggle = document.getElementById('largeCursorToggle')
    if (toggle) toggle.checked = true
    toggleLargeCursor(true)
  }

  // Respeitar configurações do sistema para redução de movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    toggleReducedMotion(true)
    const toggle = document.getElementById('reducedMotionToggle')
    if (toggle) toggle.checked = true
  }

  // Detectar configuração de alto contraste do sistema
  if (window.matchMedia('(prefers-contrast: more)').matches) {
    setContrast('high')
    const contrastButtons = document.querySelectorAll('button[data-contrast]')
    contrastButtons.forEach(button => {
      if (button.getAttribute('data-contrast') === 'high') {
        button.classList.add('active')
      }
    })
  }

  // Verificar o suporte a prefers-reduced-motion
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    console.log('Preferência do sistema por redução de movimento detectada')
    toggleReducedMotion(true)
    const toggle = document.getElementById('reducedMotionToggle')
    if (toggle) toggle.checked = true
  }

  // Verificar o suporte a prefers-contrast
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-contrast: more)').matches
  ) {
    console.log('Preferência do sistema por alto contraste detectada')
    setContrast('high')
    const contrastButtons = document.querySelectorAll('button[data-contrast]')
    contrastButtons.forEach(button => {
      if (button.getAttribute('data-contrast') === 'high') {
        button.classList.add('active')
      }
    })
  }
}

/**
 * Configura os event listeners de acessibilidade
 */
export function setupAccessibilityListeners() {
  console.log('Configurando listeners de acessibilidade')

  // Botões de contraste
  const contrastButtons = document.querySelectorAll('[data-contrast]')
  contrastButtons.forEach(button => {
    const type = button.getAttribute('data-contrast')
    button.addEventListener('click', () => {
      // Remover classe 'active' de todos os botões
      contrastButtons.forEach(btn => btn.classList.remove('active'))
      // Adicionar classe 'active' ao botão clicado
      button.classList.add('active')
      setContrast(type)
    })
    console.log(`Botão de contraste configurado: ${type}`)
  })

  // Botões de tamanho de fonte
  const fontSizeButtons = document.querySelectorAll('[data-font-action]')
  fontSizeButtons.forEach(button => {
    const action = button.getAttribute('data-font-action')
    button.addEventListener('click', () => changeFontSize(action))
    console.log(`Botão de tamanho de fonte configurado: ${action}`)
  })

  // Botões de espaçamento
  const lineSpacingButtons = document.querySelectorAll('[data-spacing]')
  lineSpacingButtons.forEach(button => {
    const type = button.getAttribute('data-spacing')
    button.addEventListener('click', () => {
      // Remover classe 'active' de todos os botões
      lineSpacingButtons.forEach(btn => btn.classList.remove('active'))
      // Adicionar classe 'active' ao botão clicado
      button.classList.add('active')
      changeLineSpacing(type)
    })
    console.log(`Botão de espaçamento configurado: ${type}`)
  })

  // Toggle de destaque de links
  const highlightLinksToggle = document.getElementById('highlightLinksToggle')
  if (highlightLinksToggle) {
    highlightLinksToggle.addEventListener('change', e =>
      toggleHighlightLinks(e.target.checked)
    )
    console.log('Toggle de destaque de links configurado')
  }

  // Toggle de fonte para dislexia
  const dyslexicFontToggle = document.getElementById('dyslexicFontToggle')
  if (dyslexicFontToggle) {
    dyslexicFontToggle.addEventListener('change', e =>
      toggleDyslexicFont(e.target.checked)
    )
    console.log('Toggle de fonte para dislexia configurado')
  }

  // Toggle de animações reduzidas
  const reducedMotionToggle = document.getElementById('reducedMotionToggle')
  if (reducedMotionToggle) {
    reducedMotionToggle.addEventListener('change', e =>
      toggleReducedMotion(e.target.checked)
    )
    console.log('Toggle de animações reduzidas configurado')
  }

  // Toggle de cursor ampliado
  const largeCursorToggle = document.getElementById('largeCursorToggle')
  if (largeCursorToggle) {
    largeCursorToggle.addEventListener('change', e =>
      toggleLargeCursor(e.target.checked)
    )
    console.log('Toggle de cursor ampliado configurado')
  }

  // Botão de reset
  const resetButton = document.getElementById('resetAccessibilityBtn')
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetAllAccessibilitySettings()

      // Mostrar confirmação de reset para o usuário
      const toast = document.getElementById('notificationToast')
      const toastBody = toast.querySelector('.toast-body')

      if (toast && toastBody) {
        toastBody.textContent =
          'Configurações de acessibilidade restauradas com sucesso.'
        const bsToast = new bootstrap.Toast(toast)
        bsToast.show()
      }
    })
  }

  // Teclas de atalho para acessibilidade
  document.addEventListener('keydown', e => {
    // Verifica se Ctrl (ou Command no Mac) está pressionado
    const ctrlKey = e.ctrlKey || e.metaKey

    if (ctrlKey && e.altKey) {
      // Ctrl+Alt+C: Alternar contraste
      if (e.key === 'c') {
        const currentContrast = localStorage.getItem('contrast') || 'normal'
        const newContrast = currentContrast === 'normal' ? 'high' : 'normal'
        setContrast(newContrast)
        e.preventDefault()
      }

      // Ctrl+Alt+F: Alternar fonte para dislexia
      if (e.key === 'f') {
        toggleDyslexicFont(!currentDyslexicMode)
        const toggle = document.getElementById('dyslexicFontToggle')
        if (toggle) toggle.checked = !toggle.checked
        e.preventDefault()
      }

      // Ctrl+Alt++: Aumentar fonte
      if (e.key === '+' || e.key === '=') {
        changeFontSize('increase')
        e.preventDefault()
      }

      // Ctrl+Alt+-: Diminuir fonte
      if (e.key === '-') {
        changeFontSize('decrease')
        e.preventDefault()
      }

      // Ctrl+Alt+0: Resetar fonte
      if (e.key === '0') {
        changeFontSize('reset')
        e.preventDefault()
      }
    }
  })

  // Observar mudanças nas preferências do sistema
  if (window.matchMedia) {
    // Monitorar preferência por redução de movimento
    window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', e => {
        toggleReducedMotion(e.matches)
        const toggle = document.getElementById('reducedMotionToggle')
        if (toggle) toggle.checked = e.matches
      })

    // Monitorar preferência por alto contraste
    window
      .matchMedia('(prefers-contrast: more)')
      .addEventListener('change', e => {
        if (e.matches) {
          setContrast('high')
        } else {
          // Verificar se o usuário já tinha uma preferência salva
          const savedContrast = localStorage.getItem('contrast')
          if (savedContrast === 'high') {
            // Manter a preferência do usuário
          } else {
            setContrast('normal')
          }
        }
      })
  }
}

/**
 * Redefine todas as configurações de acessibilidade para os valores padrão
 */
export function resetAllAccessibilitySettings() {
  console.log('Redefinindo todas as configurações de acessibilidade')

  // Redefine contraste
  setContrast('normal')

  // Redefine tamanho da fonte
  changeFontSize('reset')

  // Redefine espaçamento
  changeLineSpacing('normal')

  // Redefine destaque de links
  toggleHighlightLinks(false)
  const linksToggle = document.getElementById('highlightLinksToggle')
  if (linksToggle) linksToggle.checked = false

  // Redefine fonte para dislexia
  toggleDyslexicFont(false)
  const dyslexicToggle = document.getElementById('dyslexicFontToggle')
  if (dyslexicToggle) dyslexicToggle.checked = false

  // Redefine animações reduzidas
  toggleReducedMotion(false)
  const motionToggle = document.getElementById('reducedMotionToggle')
  if (motionToggle) motionToggle.checked = false

  // Redefine cursor ampliado
  toggleLargeCursor(false)
  const cursorToggle = document.getElementById('largeCursorToggle')
  if (cursorToggle) cursorToggle.checked = false

  // Atualiza os botões de contraste
  const contrastButtons = document.querySelectorAll('[data-contrast]')
  contrastButtons.forEach(button => {
    button.classList.remove('active')
    if (button.getAttribute('data-contrast') === 'normal') {
      button.classList.add('active')
    }
  })

  // Atualiza os botões de espaçamento
  const spacingButtons = document.querySelectorAll('[data-spacing]')
  spacingButtons.forEach(button => {
    button.classList.remove('active')
    if (button.getAttribute('data-spacing') === 'normal') {
      button.classList.add('active')
    }
  })
}

export default {
  setContrast,
  changeFontSize,
  changeLineSpacing,
  toggleHighlightLinks,
  toggleDyslexicFont,
  toggleReducedMotion,
  toggleLargeCursor,
  loadAccessibilityPreferences,
  setupAccessibilityListeners,
  resetAllAccessibilitySettings
}
