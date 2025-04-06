/**
 * dom.js - Centraliza as referências aos elementos DOM
 * Este módulo mantém referências aos elementos DOM frequentemente utilizados
 * para evitar repetição de seletores e melhorar a performance
 */

/**
 * Objeto que armazena referências aos elementos do DOM frequentemente utilizados
 * Centraliza o acesso aos elementos para facilitar manutenção e evitar repetição
 */
export const elements = {
  userInput: document.getElementById('userInput'),
  verifyButton: document.getElementById('verifyButton'),
  resultSection: document.getElementById('result-section'),
  result: document.getElementById('result'),
  verificationsHistory: document.getElementById('verificationsHistory'),
  themeSwitcher: document.getElementById('themeSwitcher'),
  spinner: document.querySelector('.spinner-border'),
  notificationToast: document.getElementById('notificationToast'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  expandTrigger: document.querySelector('.expand-trigger'),
  expandContent: document.querySelector('.expand-content')
}

/**
 * Inicializa elementos DOM dinâmicos
 * Adiciona conteúdo específico ao DOM quando necessário
 */
export function initializeDynamicElements() {
  // Adicionar CSS dinâmico (evita duplicação)
  if (!document.getElementById('dynamic-styles')) {
    const styles = `
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
      
      #userInput::placeholder {
        color: #6c757d;
      }
      
      #userInput:focus::placeholder {
        opacity: 0.5;
      }
    `

    const styleEl = document.createElement('style')
    styleEl.id = 'dynamic-styles'
    styleEl.textContent = styles
    document.head.appendChild(styleEl)
  }

  // Inicializar placeholder
  if (elements.userInput) {
    elements.userInput.value = ''
    elements.userInput.placeholder =
      'Digite ou cole aqui o texto que deseja verificar...'
  }
}

/**
 * Configura o comportamento das seções expansíveis
 */
export function setupExpandableSections() {
  const trigger = document.querySelector('.expand-trigger')
  const content = document.querySelector('.expand-content')

  if (trigger && content) {
    console.log('Configurando seção expansível')

    // Remover qualquer listener anterior para evitar duplicação
    trigger.removeEventListener('click', toggleExpandContent)

    // Adicionar o novo listener
    trigger.addEventListener('click', toggleExpandContent)
  } else {
    console.error('Elementos de expansão não encontrados')
  }
}

/**
 * Alterna a visibilidade do conteúdo expansível
 */
function toggleExpandContent(event) {
  console.log('Clique na seção expansível')
  const trigger = event.currentTarget
  const content = document.querySelector('.expand-content')

  if (!trigger || !content) {
    console.error('Elementos de expansão não encontrados dentro do handler')
    return
  }

  trigger.classList.toggle('active')
  content.classList.toggle('show')

  // Smooth scroll to content when expanding
  if (content.classList.contains('show')) {
    setTimeout(() => {
      content.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }
}

/**
 * Inicializa elementos de skeleton loading
 */
export function initializeSkeletonElements() {
  const skeletons = document.querySelectorAll('.skeleton-text')
  skeletons.forEach(skeleton => {
    const content = skeleton.dataset.content
    if (content) {
      skeleton.outerHTML = content
    }
  })
}

export default {
  elements,
  initializeDynamicElements,
  setupExpandableSections,
  initializeSkeletonElements
}
