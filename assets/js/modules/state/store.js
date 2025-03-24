/**
 * Módulo para gerenciamento do estado global da aplicação
 * Implementa um padrão simples de store centralizado para os dados da aplicação
 */

// Estado global da aplicação
let state = {
  verificationHistory: [],
  elements: {}, // Referências para elementos do DOM
  currentFontSize: 100,
  theme: 'light'
}

/**
 * Inicializa o store com referências aos elementos DOM e valores padrão
 */
export function initStore() {
  state.elements = {
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
}

/**
 * Obtém o estado global da aplicação
 * @returns {Object} Estado atual da aplicação
 */
export function getState() {
  return state
}

/**
 * Obtém as referências aos elementos do DOM
 * @returns {Object} Referências aos elementos
 */
export function getElements() {
  return state.elements
}

/**
 * Atualiza o histórico de verificações
 * @param {Array} history - Novo histórico de verificações
 */
export function setVerificationHistory(history) {
  state.verificationHistory = history
}

/**
 * Obtém o histórico de verificações atual
 * @returns {Array} Histórico de verificações
 */
export function getVerificationHistory() {
  return state.verificationHistory
}

/**
 * Adiciona uma nova verificação ao histórico
 * @param {Object} verification - Verificação a ser adicionada
 */
export function addVerification(verification) {
  state.verificationHistory.unshift(verification)

  // Limite de 10 itens no histórico
  if (state.verificationHistory.length > 10) {
    state.verificationHistory.pop()
  }
}

/**
 * Limpa todo o histórico de verificações
 */
export function clearVerificationHistory() {
  state.verificationHistory = []
}

/**
 * Atualiza o tema da aplicação
 * @param {string} theme - Tema a ser definido ('light' ou 'dark')
 */
export function setTheme(theme) {
  state.theme = theme
}

/**
 * Obtém o tema atual da aplicação
 * @returns {string} Tema atual ('light' ou 'dark')
 */
export function getTheme() {
  return state.theme
}

/**
 * Define o tamanho da fonte atual
 * @param {number} size - Tamanho da fonte em porcentagem
 */
export function setFontSize(size) {
  state.currentFontSize = size
}

/**
 * Obtém o tamanho da fonte atual
 * @returns {number} Tamanho da fonte em porcentagem
 */
export function getFontSize() {
  return state.currentFontSize
}
