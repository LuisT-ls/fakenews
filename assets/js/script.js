/**
 * Arquivo principal que inicializa a aplicação e carrega os módulos necessários
 * Este arquivo funciona como um ponto de entrada (entry point) para a aplicação
 */

// Importação dos módulos
import { initStore } from './modules/state/store.js'
import { setupEventListeners } from './modules/handlers/events.js'
import { loadVerificationHistory } from './modules/utils/storage.js'
import { initThemeSwitch } from './modules/ui/theme.js'
import { initAccessibilityFeatures } from './modules/ui/accessibility.js'

/**
 * Inicializa a aplicação quando o DOM é carregado
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o estado global da aplicação
  initStore()

  // Carrega dados do localStorage
  loadVerificationHistory()

  // Inicializa o sistema de tema
  initThemeSwitch()

  // Inicializa recursos de acessibilidade
  initAccessibilityFeatures()

  // Configura todos os event listeners
  setupEventListeners()

  // Inicializa a UI do campo de texto
  initializeUserInput()
})

/**
 * Configura o campo de entrada do texto inicial
 */
function initializeUserInput() {
  const userInput = document.getElementById('userInput')

  // Limpa o campo e define placeholder
  userInput.value = ''
  userInput.placeholder = 'Digite ou cole aqui o texto que deseja verificar...'

  // Adiciona estilos para o placeholder
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
}
