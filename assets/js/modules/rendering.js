/**
 * rendering.js - Renderização de resultados
 * Este módulo gerencia a renderização dos resultados da verificação na interface
 */

import { elements } from './dom.js'
import { getScoreClass } from './history.js'
import { handleFeedback } from './events.js'
import { translateDynamicContent } from '../translations.js'

/**
 * Exibe os resultados da verificação na interface
 * @param {Object} verification - Objeto contendo os resultados da verificação
 */
export function displayResults(verification) {
  const currentLang = document.documentElement.lang

  if (!verification.geminiAnalysis) {
    const errorMessage = translateDynamicContent(
      'Não foi possível realizar a análise. Tente novamente.',
      currentLang
    )
    elements.result.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`
    elements.resultSection.classList.remove('d-none')
    return
  }

  const gemini = verification.geminiAnalysis
  const scorePercentage = Math.round(verification.overallScore * 100)
  const scoreClass = getScoreClass(verification.overallScore)

  // Translate classification
  const translatedClassification = translateDynamicContent(
    gemini.classificacao,
    currentLang
  )

  // Componente de alerta temporal
  const temporalAlert = gemini.limitacao_temporal?.afeta_analise
    ? `
    <div class="alert alert-warning mb-4">
      <i class="fas fa-clock me-2"></i>
      <strong>${translateDynamicContent(
        'Aviso de Limitação Temporal:',
        currentLang
      )}</strong>
      <p class="mb-2">${translateDynamicContent(
        'Esta análise possui elementos posteriores a 2022 que não podem ser completamente verificados.',
        currentLang
      )}</p>
      ${
        gemini.limitacao_temporal.elementos_nao_verificaveis?.length
          ? `<div class="mb-2">
            <strong>${translateDynamicContent(
              'Elementos não verificáveis:',
              currentLang
            )}</strong>
            <ul class="mb-0">
              ${gemini.limitacao_temporal.elementos_nao_verificaveis
                .map(elem => `<li>${elem}</li>`)
                .join('')}
            </ul>
          </div>`
          : ''
      }
      ${
        gemini.limitacao_temporal.sugestoes_verificacao?.length
          ? `<div>
            <strong>${translateDynamicContent(
              'Sugestões para verificação:',
              currentLang
            )}</strong>
            <ul class="mb-0">
              ${gemini.limitacao_temporal.sugestoes_verificacao
                .map(sug => `<li>${sug}</li>`)
                .join('')}
            </ul>
          </div>`
          : ''
      }
    </div>`
    : ''

  elements.result.innerHTML = `
    <div class="result-card p-4 border rounded shadow-sm">
      ${temporalAlert}
      <div class="mb-4 text-center">
        <div class="display-4 text-${scoreClass}">${scorePercentage}%</div>
        <h3 class="h5">${translatedClassification}</h3>
      </div>

      <div class="progress mb-4" style="height: 25px;">
        <div class="progress-bar bg-${scoreClass}"
             role="progressbar"
             style="width: ${scorePercentage}%"
             aria-valuenow="${scorePercentage}"
             aria-valuemin="0"
             aria-valuemax="100">
        </div>
      </div>

      <div class="alert alert-secondary">
        <i class="fas fa-info-circle me-2"></i>
        ${gemini.explicacao_score}
      </div>

      ${generateAnalysisSections(gemini, currentLang)}
      
      <div class="card mb-3">
        <div class="card-body">
          <h4 class="h6 mb-3">${translateDynamicContent(
            'Análise Detalhada',
            currentLang
          )}</h4>
          <p class="mb-0">${gemini.analise_detalhada}</p>
        </div>
      </div>

      <div class="feedback-section mt-4 text-center" data-verification-id="${
        verification.id
      }">
        <div class="small text-muted mb-2">${translateDynamicContent(
          'Esta análise foi útil?',
          currentLang
        )}</div>
        <div class="btn-group btn-group-sm" role="group" aria-label="Feedback">
          <button class="btn btn-outline-success btn-feedback" data-feedback="positive">
            <i class="fas fa-thumbs-up"></i>
          </button>
          <button class="btn btn-outline-danger btn-feedback" data-feedback="negative">
            <i class="fas fa-thumbs-down"></i>
          </button>
        </div>
      </div>
    </div>
  `

  const feedbackSection = elements.result.querySelector('.feedback-section')
  feedbackSection.querySelectorAll('.btn-feedback').forEach(button => {
    button.addEventListener('click', function () {
      handleFeedback(this, feedbackSection)
    })
  })

  elements.resultSection.classList.remove('d-none')
}

/**
 * Gera as seções HTML para cada parte da análise
 * @param {Object} gemini - Resultado da análise do Gemini
 * @param {string} currentLang - Idioma atual
 * @returns {string} HTML das seções de análise
 */
function generateAnalysisSections(gemini, currentLang) {
  const sections = [
    {
      title: translateDynamicContent('Elementos Verificados', currentLang),
      items: gemini.elementos_verdadeiros,
      colorClass: 'success',
      icon: 'check-circle'
    },
    {
      title: translateDynamicContent('Elementos Falsos', currentLang),
      items: gemini.elementos_falsos,
      colorClass: 'danger',
      icon: 'times-circle'
    },
    {
      title: translateDynamicContent('Pontos Suspeitos', currentLang),
      items: gemini.elementos_suspeitos,
      colorClass: 'warning',
      icon: 'exclamation-triangle'
    },
    {
      title: translateDynamicContent('Recomendações', currentLang),
      items: gemini.recomendacoes,
      colorClass: 'info',
      icon: 'lightbulb'
    }
  ]

  return sections
    .map(({ title, items, colorClass, icon }) =>
      items?.length
        ? `
        <div class="mb-3">
          <h4 class="h6 mb-2">${title}</h4>
          <div class="list-group">
            ${items
              .map(
                item => `
              <div class="list-group-item list-group-item-${colorClass}">
                <i class="fas fa-${icon} me-2"></i>${item}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        : ''
    )
    .join('')
}

export default {
  displayResults
}
