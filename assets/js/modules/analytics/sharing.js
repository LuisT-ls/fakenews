/**
 * Módulo para funcionalidades de compartilhamento de conteúdo
 * Permite compartilhar o resultado da análise em redes sociais
 */

/**
 * Compartilha o conteúdo da análise em diferentes plataformas sociais
 * @param {string} platform - Plataforma de compartilhamento (twitter, whatsapp, telegram)
 */
export function shareContent(platform) {
  // Pegar o texto da análise do elemento de resultado
  const resultElement = document.getElementById('result')
  if (!resultElement) return

  // Extrair informações relevantes do resultado
  const scoreElement = resultElement.querySelector('.display-4')
  const classificacaoElement = resultElement.querySelector('.h5')
  const analiseElement = resultElement.querySelector('.card p')

  if (!scoreElement || !classificacaoElement || !analiseElement) return

  // Construir a mensagem de compartilhamento
  const score = scoreElement.textContent
  const classificacao = classificacaoElement.textContent
  const analise = analiseElement.textContent

  const mensagem =
    `🔍 Verifiquei essa informação no Verificador de Fake News!\n\n` +
    `📊 Resultado: ${score} de confiabilidade\n` +
    `📋 Classificação: ${classificacao}\n` +
    `📝 Análise: ${analise.substring(0, 150)}...\n\n` +
    `Verifique você também:`

  // Codificar a mensagem para URL
  const textoCodificado = encodeURIComponent(mensagem)
  const url = encodeURIComponent(window.location.href)

  // URLs para cada plataforma
  const platformUrls = getPlatformUrls(textoCodificado, url)

  // Abrir janela de compartilhamento
  if (platformUrls[platform]) {
    openShareWindow(platformUrls[platform])
  } else {
    console.error(`Plataforma de compartilhamento inválida: ${platform}`)
  }
}

/**
 * Obtém as URLs de compartilhamento para as diferentes plataformas
 * @param {string} text - Texto codificado para compartilhamento
 * @param {string} url - URL codificada para compartilhamento
 * @returns {Object} Objeto com URLs para cada plataforma
 */
function getPlatformUrls(text, url) {
  return {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    whatsapp: `https://wa.me/?text=${text} ${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
  }
}

/**
 * Abre uma janela de compartilhamento
 * @param {string} url - URL para compartilhamento
 */
function openShareWindow(url) {
  // Definir dimensões e posição da janela
  const width = 550
  const height = 420
  const left = (window.innerWidth - width) / 2
  const top = (window.innerHeight - height) / 2

  // Abrir a janela de compartilhamento
  window.open(
    url,
    'share',
    `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,directories=0,scrollbars=0`
  )
}

/**
 * Gera o URL para compartilhar diretamente no WhatsApp
 * @param {string} text - Texto para compartilhar
 * @returns {string} URL para compartilhamento no WhatsApp
 */
export function getWhatsAppShareLink(text) {
  const url = encodeURIComponent(window.location.href)
  const message = encodeURIComponent(text)
  return `https://wa.me/?text=${message} ${url}`
}

/**
 * Copia o resultado da análise para a área de transferência
 * @returns {boolean} true se copiado com sucesso, false caso contrário
 */
export function copyResultToClipboard() {
  const resultElement = document.getElementById('result')
  if (!resultElement) return false

  try {
    // Cria um elemento temporário
    const tempElement = document.createElement('div')

    // Prepara o conteúdo para copiar sem formatações
    const scoreElement = resultElement.querySelector('.display-4')
    const classificacaoElement = resultElement.querySelector('.h5')
    const analiseElement = resultElement.querySelector('.card p')

    if (!scoreElement || !classificacaoElement || !analiseElement) return false

    // Formata o texto
    tempElement.innerText =
      `Verificador de Fake News - Resultado da Análise\n\n` +
      `Resultado: ${scoreElement.textContent}\n` +
      `Classificação: ${classificacaoElement.textContent}\n` +
      `Análise: ${analiseElement.textContent}\n\n` +
      `URL: ${window.location.href}`

    // Adiciona o elemento ao DOM
    document.body.appendChild(tempElement)

    // Seleciona o texto
    const range = document.createRange()
    range.selectNode(tempElement)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)

    // Copia para a área de transferência
    const success = document.execCommand('copy')

    // Remove o elemento temporário
    window.getSelection().removeAllRanges()
    document.body.removeChild(tempElement)

    return success
  } catch (err) {
    console.error('Erro ao copiar resultado:', err)
    return false
  }
}
