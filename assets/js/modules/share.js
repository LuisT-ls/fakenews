/**
 * share.js - Funcionalidades de compartilhamento
 * Este módulo gerencia o compartilhamento de conteúdo em redes sociais
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
    `📝 Análise: ${analise.substring(0, 1500)}...\n\n` +
    `Verifique você também:`

  // Codificar a mensagem para URL
  const textoCodificado = encodeURIComponent(mensagem)
  const url = encodeURIComponent(window.location.href)

  // URLs para cada plataforma
  const platformUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${textoCodificado}&url=${url}`,
    whatsapp: `https://wa.me/?text=${textoCodificado} ${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${textoCodificado}`
  }

  // Abrir janela de compartilhamento
  window.open(platformUrls[platform], '_blank')
}

export default {
  shareContent
}
