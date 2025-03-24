/**
 * Módulo para gerenciar o armazenamento local de dados
 * Centraliza as operações de persistência com localStorage
 */

import {
  setVerificationHistory,
  getVerificationHistory
} from '../state/store.js'
import { updateHistoryDisplay } from '../ui/display.js'

/**
 * Carrega o histórico de verificações do localStorage
 */
export function loadVerificationHistory() {
  try {
    const history =
      JSON.parse(localStorage.getItem('verificationHistory')) || []
    setVerificationHistory(history)
    updateHistoryDisplay()
  } catch (error) {
    console.error('Erro ao carregar histórico:', error)
    setVerificationHistory([])
  }
}

/**
 * Salva uma verificação no histórico
 * @param {Object} verification - Objeto de verificação a ser salvo
 */
export function saveVerification(verification) {
  const history = getVerificationHistory()
  history.unshift(verification)

  // Limita o histórico a 10 itens
  if (history.length > 10) history.pop()

  // Salva no localStorage
  localStorage.setItem('verificationHistory', JSON.stringify(history))

  // Atualiza a exibição do histórico
  updateHistoryDisplay()
}

/**
 * Salva as configurações de acessibilidade no localStorage
 * @param {string} key - Chave para armazenamento
 * @param {string|number} value - Valor a ser armazenado
 */
export function saveAccessibilitySetting(key, value) {
  localStorage.setItem(key, value)
}

/**
 * Carrega uma configuração de acessibilidade do localStorage
 * @param {string} key - Chave para recuperação
 * @param {string|number} defaultValue - Valor padrão se a chave não existir
 * @returns {string|number} Valor recuperado ou valor padrão
 */
export function loadAccessibilitySetting(key, defaultValue) {
  const value = localStorage.getItem(key)
  return value !== null ? value : defaultValue
}

/**
 * Limpa o histórico de verificações
 */
export function clearHistory() {
  setVerificationHistory([])
  localStorage.removeItem('verificationHistory')
  updateHistoryDisplay()
}

/**
 * Verifica se o navegador suporta localStorage
 * @returns {boolean} true se o navegador suporta localStorage
 */
export function isStorageAvailable() {
  try {
    const storage = window.localStorage
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
}
