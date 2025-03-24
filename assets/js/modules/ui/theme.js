/**
 * Módulo para gerenciamento do tema (claro/escuro) da aplicação
 */

import { getElements, setTheme, getTheme } from '../state/store.js'

/**
 * Inicializa e configura o switch de tema (claro/escuro)
 */
export function initThemeSwitch() {
  const elements = getElements()

  // Carrega o tema salvo no localStorage ou usa 'light' como padrão
  const theme = localStorage.getItem('theme') || 'light'
  setTheme(theme)

  // Aplica o tema ao documento
  document.documentElement.setAttribute('data-theme', theme)

  // Atualiza o ícone do botão de acordo com o tema
  elements.themeSwitcher.querySelector('i').className =
    theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'

  // Adiciona o event listener para alternar o tema
  elements.themeSwitcher.addEventListener('click', toggleTheme)
}

/**
 * Alterna entre os temas claro e escuro
 */
export function toggleTheme() {
  const elements = getElements()
  const currentTheme = getTheme()

  // Define o novo tema (oposto do atual)
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  // Atualiza o tema no documento
  document.documentElement.setAttribute('data-theme', newTheme)

  // Salva o tema no localStorage
  localStorage.setItem('theme', newTheme)

  // Atualiza o ícone do botão
  elements.themeSwitcher.querySelector('i').className =
    newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'

  // Atualiza o estado global
  setTheme(newTheme)
}

/**
 * Define explicitamente um tema específico
 * @param {string} theme - Tema a ser definido ('light' ou 'dark')
 */
export function setSpecificTheme(theme) {
  const elements = getElements()

  // Garante que o valor do tema seja válido
  const validTheme = theme === 'dark' ? 'dark' : 'light'

  // Atualiza o tema no documento
  document.documentElement.setAttribute('data-theme', validTheme)

  // Salva o tema no localStorage
  localStorage.setItem('theme', validTheme)

  // Atualiza o ícone do botão
  elements.themeSwitcher.querySelector('i').className =
    validTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'

  // Atualiza o estado global
  setTheme(validTheme)
}
