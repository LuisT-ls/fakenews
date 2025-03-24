/**
 * Módulo com funções auxiliares gerais para a aplicação
 */

/**
 * Formata uma data para exibição localizada
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatDate(date) {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  return dateObj.toLocaleString()
}

/**
 * Trunca um texto para um tamanho máximo e adiciona reticências se necessário
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo permitido
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}

/**
 * Traduz conteúdo dinâmico baseado no idioma atual
 * @param {string} content - Conteúdo a ser traduzido
 * @param {string} lang - Código do idioma (pt, en, etc)
 * @returns {string} Conteúdo traduzido
 */
export function translateDynamicContent(content, lang) {
  // Implementação simplificada - em uma aplicação real,
  // este módulo utilizaria um sistema mais completo de tradução
  if (lang === 'pt' || !content) {
    return content
  }

  const translations = {
    // Classificações
    'Comprovadamente Verdadeiro': 'Verifiably True',
    'Parcialmente Verdadeiro': 'Partially True',
    'Não Verificável': 'Not Verifiable',
    'Provavelmente Falso': 'Probably False',
    'Comprovadamente Falso': 'Verifiably False',

    // Mensagens de feedback
    'Esta análise foi útil?': 'Was this analysis helpful?',
    'Obrigado pelo seu feedback!': 'Thank you for your feedback!',

    // Seções de análise
    'Elementos Verificados': 'Verified Elements',
    'Elementos Falsos': 'False Elements',
    'Pontos Suspeitos': 'Suspicious Points',
    Recomendações: 'Recommendations',
    'Análise Detalhada': 'Detailed Analysis',

    // Notificações
    'Verificando...': 'Verifying...',
    'Verificar Agora': 'Verify Now',
    'Nenhuma verificação realizada': 'No verifications performed',
    'Histórico apagado com sucesso!': 'History successfully cleared!',

    // Alertas
    'Aviso de Limitação Temporal': 'Temporal Limitation Warning',
    'Esta análise possui elementos posteriores a 2022 que não podem ser completamente verificados.':
      'This analysis contains elements after 2022 that cannot be fully verified.',
    'Elementos não verificáveis': 'Non-verifiable elements',
    'Sugestões para verificação': 'Verification suggestions'
  }

  return translations[content] || content
}

/**
 * Verifica se a conexão está online
 * @returns {boolean} true se online, false caso contrário
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Gera um ID único para elementos
 * @returns {string} ID único
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Converte um timestamp para uma string legível de "tempo atrás"
 * @param {string|Date} timestamp - Data a converter
 * @returns {string} Texto formatado (ex: "2 minutos atrás")
 */
export function timeAgo(timestamp) {
  if (!timestamp) return ''

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const secondsAgo = Math.floor((now - date) / 1000)

  if (secondsAgo < 60) {
    return 'agora mesmo'
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minuto' : 'minutos'} atrás`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hora' : 'horas'} atrás`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 30) {
    return `${daysAgo} ${daysAgo === 1 ? 'dia' : 'dias'} atrás`
  }

  return formatDate(date)
}

/**
 * Formata um número com separadores de milhar
 * @param {number} number - Número a ser formatado
 * @returns {string} Número formatado
 */
export function formatNumber(number) {
  return number.toLocaleString()
}

/**
 * Remove caracteres especiais e acentos de uma string
 * @param {string} text - Texto a ser normalizado
 * @returns {string} Texto normalizado
 */
export function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
