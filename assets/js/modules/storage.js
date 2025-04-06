/**
 * storage.js - Gerenciamento de armazenamento local
 * Este módulo gerencia o armazenamento persistente de dados na aplicação
 */

/**
 * Salva dados no localStorage
 * @param {string} key - Chave para armazenamento
 * @param {any} data - Dados a serem armazenados
 * @returns {boolean} - Sucesso da operação
 */
export function saveToStorage(key, data) {
  try {
    const serializedData =
      typeof data === 'object' ? JSON.stringify(data) : String(data)

    localStorage.setItem(key, serializedData)
    return true
  } catch (error) {
    console.error(`Erro ao salvar dados para ${key}:`, error)
    return false
  }
}

/**
 * Recupera dados do localStorage
 * @param {string} key - Chave para recuperação
 * @param {any} defaultValue - Valor padrão caso a chave não exista
 * @returns {any} - Dados recuperados ou valor padrão
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)

    if (item === null) {
      return defaultValue
    }

    // Tenta fazer parse como JSON, se falhar retorna o valor como string
    try {
      return JSON.parse(item)
    } catch (e) {
      return item
    }
  } catch (error) {
    console.error(`Erro ao recuperar dados para ${key}:`, error)
    return defaultValue
  }
}

/**
 * Remove dados do localStorage
 * @param {string} key - Chave a ser removida
 * @returns {boolean} - Sucesso da operação
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Erro ao remover dados para ${key}:`, error)
    return false
  }
}

/**
 * Verifica se uma chave existe no localStorage
 * @param {string} key - Chave a ser verificada
 * @returns {boolean} - Se a chave existe
 */
export function hasStorageItem(key) {
  return localStorage.getItem(key) !== null
}

/**
 * Limpa todos os dados do localStorage
 * @returns {boolean} - Sucesso da operação
 */
export function clearStorage() {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Erro ao limpar storage:', error)
    return false
  }
}

/**
 * Verifica se o localStorage está disponível
 * @returns {boolean} - Se o localStorage está disponível
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    const result = localStorage.getItem(testKey) === testKey
    localStorage.removeItem(testKey)
    return result
  } catch (e) {
    return false
  }
}

/**
 * Obtém o tamanho total usado no localStorage (em bytes)
 * @returns {number} - Tamanho em bytes
 */
export function getStorageUsage() {
  try {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2 // Caracteres * 2 para aproximar bytes em UTF-16
      }
    }
    return total
  } catch (e) {
    console.error('Erro ao calcular uso de storage:', e)
    return 0
  }
}

export default {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  hasStorageItem,
  clearStorage,
  isStorageAvailable,
  getStorageUsage
}
