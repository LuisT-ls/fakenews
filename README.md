# Verificador de Fake News

Uma aplicação web simples que ajuda a identificar possíveis fake news com base em padrões suspeitos e consultas a APIs externas para análise factual e de notícias confiáveis.

## 🚀 Funcionalidades

- **Entrada de Texto**: Insira o texto ou notícia que deseja verificar.
- **Análise de Padrões Suspeitos**: Detecta palavras-chave e frases comuns em fake news.
- **Consulta a APIs**:
  - Google Fact Check API: Verifica afirmações utilizando bancos de dados de fact-check.
  - NewsAPI: Busca notícias relacionadas em fontes confiáveis.
- **Exibição de Resultados**:
  - Pontuação de risco de fake news.
  - Padrões suspeitos detectados.
  - Resultados de verificação factual.
  - Fontes confiáveis de notícias relacionadas.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML, CSS, Bootstrap 5
- **Linguagem de Programação**: JavaScript
- **APIs Externas**:
  - [Google Fact Check API](https://developers.google.com/fact-check/tools/api)
  - [NewsAPI](https://newsapi.org/)

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter o seguinte configurado:

1. **Chaves das APIs**:
   - Google Fact Check API Key
   - NewsAPI Key

2. Adicione as chaves diretamente no código ou em um arquivo `.env` se planejar uma configuração mais segura.

## 🛠️ Configuração do Projeto

1. Clone este repositório:
   ```bash
   git clone https://github.com/LuisT-ls/fakenews.git
   cd fakenews
   ```

2. Abra o arquivo `script.js` e configure as chaves das APIs:
   ```javascript
   const GOOGLE_FACT_CHECK_API_KEY = 'SUA_CHAVE_GOOGLE_FACT_CHECK'
   const NEWS_API_KEY = 'SUA_CHAVE_NEWSAPI'
   ```

3. Abra o arquivo `index.html` em um navegador para testar o projeto.

## 🖼️ Interface

A interface do aplicativo é simples e intuitiva. Aqui estão alguns recursos visuais:

- **Tela de Entrada**: Um campo para o usuário inserir texto e verificar.
- **Resultados**:
  - Mensagem de risco (baixo, moderado, alto).
  - Lista de padrões suspeitos encontrados.
  - Links para notícias em fontes confiáveis.

## 🐛 Problemas Conhecidos

- A precisão dos resultados depende dos dados fornecidos pelas APIs.
- Limitações do plano gratuito das APIs (limites de requisição).

## 🤝 Contribuições

Sinta-se à vontade para contribuir com melhorias ou abrir problemas (issues). Faça um fork deste repositório, implemente as alterações e envie um pull request.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

### 📢 Dica de Uso
Evite compartilhar informações sem verificar fontes confiáveis. Este verificador não é perfeito, mas pode ser uma ferramenta útil para conscientização sobre fake news.

Desenvolvido com ❤️ para ajudar a combater a desinformação.
```

### O que inclui:
1. **Descrição do Projeto**: Explica brevemente o objetivo do projeto.
2. **Funcionalidades**: Lista o que a aplicação faz.
3. **Tecnologias**: Indica as ferramentas e APIs utilizadas.
4. **Instruções de Uso**: Explica como configurar e rodar o projeto.
5. **Interface**: Explica o layout do sistema.
6. **Contribuições**: Orienta como outros podem ajudar a melhorar o projeto.
7. **Licença**: Inclui a licença MIT.

Se precisar de algum ajuste ou inclusão específica, avise! 😊