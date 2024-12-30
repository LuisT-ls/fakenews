# Verificador de Fake News

Uma aplicação web interativa que utiliza análises avançadas e consultas a APIs externas para identificar possíveis fake news, promovendo uma comunicação mais consciente e confiável.

## 🚀 Funcionalidades Principais

- **Entrada de Texto**:  
  Permite que o usuário insira notícias ou afirmações para análise.
- **Análise Automatizada**:
  - Identificação de palavras-chave associadas a fake news.
  - Avaliação de padrões suspeitos no texto fornecido.
- **Consulta a Bancos de Dados e IA Avançada**:
  - **Google Fact Check API**: Busca e valida informações usando bases de dados verificadas.
  - **NewsAPI**: Retorna notícias relacionadas provenientes de fontes confiáveis.
  - **Google Gemini API**: Utiliza modelos de linguagem avançados para oferecer análises contextuais profundas e interpretações baseadas em IA.
- **Resultados Detalhados**:
  - Pontuação de risco (baixo, moderado, alto).
  - Relatórios com padrões suspeitos.
  - Lista de notícias relacionadas e verificadas.

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - HTML5 e CSS3 para estrutura e design.
  - Bootstrap 5 para um layout responsivo e moderno.
- **Linguagem de Programação**: JavaScript para lógica e interatividade.
- **APIs Externas**:
  - [Google Fact Check API](https://developers.google.com/fact-check/tools/api)
  - [NewsAPI](https://newsapi.org/)
  - [Google Gemini API](https://developers.google.com/gemini)

## 📋 Pré-requisitos

Antes de configurar o projeto, você precisará:

1. **Chaves de API Ativas**:
   - Google Fact Check API.
   - NewsAPI.
   - Google Gemini API.
2. **Navegador Moderno**: Compatível com as tecnologias mais recentes.

## 🛠️ Configuração do Projeto

Siga os passos abaixo para configurar e executar o projeto:

1. **Clone o Repositório**:

   ```bash
   git clone https://github.com/LuisT-ls/fakenews.git
   cd fakenews
   ```

2. **Configure as Chaves de API**:  
   Abra o arquivo `./assets/js/script.js` e insira suas chaves:

   ```javascript
   const GOOGLE_FACT_CHECK_API_KEY = 'SUA_CHAVE_GOOGLE_FACT_CHECK'
   const NEWS_API_KEY = 'SUA_CHAVE_NEWSAPI'
   const GOOGLE_GEMINI_API_KEY = 'SUA_CHAVE_GOOGLE_GEMINI'
   ```

3. **Execute o Projeto**:  
   Abra o arquivo `index.html` no navegador ou utilize um servidor local (ex.: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)).

## 🖼️ Interface do Usuário

A interface foi projetada para ser acessível e funcional:

- **Página Inicial**:
  - Campo para inserir o texto da notícia.
  - Botão de "Verificar".
- **Resultados**:
  - Exibição do nível de risco.
  - Relatório com padrões suspeitos.
  - Links para notícias verificadas.

## 🐛 Problemas Conhecidos

- **Limitações das APIs**:
  - Os planos gratuitos podem restringir o número de requisições.
- **Dependência de Contexto**:
  - A precisão depende da qualidade do texto e das informações disponíveis.

## 🤝 Como Contribuir

Quer ajudar a melhorar o projeto? Siga estas etapas:

1. Faça um fork do repositório.
2. Crie uma nova branch:
   ```bash
   git checkout -b minha-contribuicao
   ```
3. Realize as alterações e envie um pull request.

## 📄 Licença

Este projeto está licenciado sob os termos da [Licença MIT](LICENSE).

---

## 📢 Avisos Importantes

- A ferramenta é um auxílio e **não substitui uma análise humana cuidadosa**.
- Sempre verifique as fontes das informações antes de compartilhar.

---

Desenvolvido com paixão para combater a desinformação e promover uma comunicação responsável. 🌟
