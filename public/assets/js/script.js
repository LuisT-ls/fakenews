/**
 * script.js - Ponto de entrada principal da aplicação
 * Inicializa todos os módulos e coordena os componentes da aplicação.
 */

// Importação de módulos
import {
  elements,
  initializeDynamicElements,
  setupExpandableSections,
  initializeSkeletonElements
} from './modules/dom.js'

import { setupEventListeners } from './modules/events.js'
import { initThemeSwitch } from './modules/ui.js'
import {
  loadVerificationHistory,
  setupHistoryEvents
} from './modules/history.js'
import {
  loadAccessibilityPreferences,
  setupAccessibilityListeners,
  setContrast,
  changeFontSize,
  changeLineSpacing,
  toggleHighlightLinks,
  toggleDyslexicFont,
  toggleReducedMotion,
  toggleLargeCursor,
  resetAllAccessibilitySettings
} from './modules/accessibility.js'

/**
 * Inicializa a aplicação quando o DOM é carregado
 * Configura event listeners, carrega histórico e inicializa componentes
 */
document.addEventListener('DOMContentLoaded', initializeApp)

/**
 * Função principal de inicialização da aplicação
 */
function initializeApp() {
  // Verificar se já inicializamos antes (previne inicialização duplicada)
  if (window.appInitialized) return
  window.appInitialized = true

  console.log('Inicializando aplicação...')

  // Expor funções globalmente para acesso via HTML inline antes de qualquer outro setup
  exposeGlobalFunctions()

  // Inicializar elementos do DOM
  initializeDynamicElements()
  initializeSkeletonElements()

  // Configurar temas e preferências
  initThemeSwitch()
  loadAccessibilityPreferences()

  // Inicializar expandable sections
  setupExpandableSections()

  // Carregar histórico
  loadVerificationHistory()

  // Configurar event listeners
  setupEventListeners()
  setupHistoryEvents()
  setupAccessibilityListeners()

  // Registrar o Service Worker
  registerServiceWorker()
}

/**
 * Registra o Service Worker para funcionalidades offline
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registrado com sucesso')
        })
        .catch(error => {
          console.error('Erro no registro do ServiceWorker:', error)
        })
    })
  }
}

/**
 * Inicializa observadores de performance
 */
function initPerformanceObservers() {
  // Registra um paint timing observer
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
      }
    })
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }
}

/**
 * Expõe funções para acesso global para uso no HTML
 * IMPORTANTE: Essa função deve ser chamada antes de qualquer outro setup
 */
function exposeGlobalFunctions() {
  console.log('Exposing global functions')

  // Expõe as funções de acessibilidade globalmente para uso em atributos HTML
  window.setContrast = setContrast
  window.changeFontSize = changeFontSize
  window.changeLineSpacing = changeLineSpacing
  window.toggleHighlightLinks = toggleHighlightLinks
  window.toggleDyslexicFont = toggleDyslexicFont
  window.toggleReducedMotion = toggleReducedMotion
  window.toggleLargeCursor = toggleLargeCursor
  window.resetAllAccessibilitySettings = resetAllAccessibilitySettings
}

// Iniciar observadores de performance
initPerformanceObservers()

// Expor funções imediatamente para que onclick, etc. funcionem
exposeGlobalFunctions()
