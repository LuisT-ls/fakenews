# 🔍 Verificador de Fake News | Fake News Detector

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)

[English Version](#english-version)

Uma aplicação web moderna que utiliza Inteligência Artificial e a API do Google Gemini para detectar e analisar possíveis fake news em tempo real, promovendo uma comunicação mais consciente e baseada em fatos.

## 🎯 Principais Destaques

- ⚡ Análise em tempo real com IA avançada
- 🌍 Interface bilíngue (Português/Inglês)
- 📱 Progressive Web App (PWA) instalável
- 🎨 Interface moderna e responsiva
- 🌓 Suporte a tema claro/escuro
- ☁️ Integração serverless com Vercel

## 🚀 Começando

### Pré-requisitos

- Um servidor web local (como Live Server do VS Code)
- Uma chave de API do Google Gemini
- Conta no Vercel (para deploy)

### Instalação Local

1. Clone o repositório:

```bash
git clone https://github.com/LuisT-ls/fakenews.git
cd fakenews
```

2. Configure o ambiente no Vercel:

   - Crie uma variável de ambiente `GEMINI_API_KEY` com sua chave API do Google Gemini

3. Execute o projeto:
   - Use um servidor local como Live Server
   - Ou abra o arquivo index.html diretamente no navegador

## 🛠️ Tecnologias Utilizadas

### Frontend

- HTML5 & CSS3
- JavaScript (Vanilla)
- Service Workers para PWA
- CSS Modular

### Backend & Integrações

- Vercel Serverless Functions
- Google Gemini API
- Local Storage para persistência

## 📂 Estrutura do Projeto

```
.
├── assets/
│   ├── css/
│   │   ├── base/           # Estilos base e variáveis
│   │   ├── components/     # Estilos de componentes
│   │   ├── layout/        # Estilos de layout
│   │   └── utils/         # Utilidades CSS
│   ├── images/
│   │   └── icons/         # Ícones e favicon
│   └── js/
│       ├── components/    # Componentes JavaScript
│       ├── config/        # Configurações
│       ├── services/      # Serviços e integrações
│       └── utils/         # Utilitários JavaScript
├── pages/                 # Páginas estáticas
├── api/                   # Funções serverless
├── docs/                  # Documentação
└── sw.js                 # Service Worker
```

## 💡 Funcionalidades

### Análise de Conteúdo

- Verificação de credibilidade de textos
- Identificação de padrões suspeitos
- Sugestões de fontes confiáveis
- Histórico de verificações

### Recursos PWA

- Funcionamento offline
- Instalável no dispositivo
- Tema claro/escuro
- Interface responsiva

### Segurança e Privacidade

- Proteção de dados em trânsito
- Sem armazenamento de dados sensíveis
- Política de privacidade clara
- Termos de serviço transparentes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/NovaFuncionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona Nova Funcionalidade'`
4. Push para a branch: `git push origin feature/NovaFuncionalidade`
5. Abra um Pull Request

### Guidelines para Contribuição

- Mantenha a estrutura CSS modular
- Siga os padrões de nomenclatura existentes
- Teste em diferentes navegadores
- Mantenha a compatibilidade PWA

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](docs/LICENSE) para detalhes.

## 👤 Autor

**Luís Antonio Souza Teixeira**

- LinkedIn: [@luis-tei](https://www.linkedin.com/in/luis-tei/)
- GitHub: [@LuisT-ls](https://github.com/LuisT-ls)
- Email: luishg213@outlook.com
- Instagram: [@luis.tei](https://www.instagram.com/luis.tei)

---

[Previous Portuguese content remains the same until English Version...]

# English Version

## 🔍 Fake News Detector

A modern web application that uses Artificial Intelligence and Google Gemini API to detect and analyze potential fake news in real-time, promoting more conscious and fact-based communication.

## 🎯 Key Features

- ⚡ Real-time analysis with advanced AI
- 🌍 Bilingual interface (Portuguese/English)
- 📱 Installable Progressive Web App (PWA)
- 🎨 Modern, responsive interface
- 🌓 Light/dark theme support
- ☁️ Serverless integration with Vercel

## 🚀 Getting Started

### Prerequisites

- A local web server (such as VS Code's Live Server)
- A Google Gemini API key
- Vercel account (for deployment)

### Local Installation

1. Clone the repository:

```bash
git clone https://github.com/LuisT-ls/fakenews.git
cd fakenews
```

2. Set up the Vercel environment:

   - Create an environment variable `GEMINI_API_KEY` with your Google Gemini API key

3. Run the project:
   - Use a local server like Live Server
   - Or open the index.html file directly in your browser

## 🛠️ Technologies Used

### Frontend

- HTML5 & CSS3
- JavaScript (Vanilla)
- Service Workers for PWA
- Modular CSS

### Backend & Integrations

- Vercel Serverless Functions
- Google Gemini API
- Local Storage for persistence

## 📂 Project Structure

```
.
├── assets/
│   ├── css/
│   │   ├── base/           # Base styles and variables
│   │   ├── components/     # Component styles
│   │   ├── layout/        # Layout styles
│   │   └── utils/         # CSS utilities
│   ├── images/
│   │   └── icons/         # Icons and favicon
│   └── js/
│       ├── components/    # JavaScript components
│       ├── config/        # Configurations
│       ├── services/      # Services and integrations
│       └── utils/         # JavaScript utilities
├── pages/                 # Static pages
├── api/                   # Serverless functions
├── docs/                  # Documentation
└── sw.js                 # Service Worker
```

## 💡 Features

### Content Analysis

- Text credibility verification
- Suspicious pattern identification
- Reliable source suggestions
- Verification history

### PWA Features

- Offline functionality
- Device installation
- Light/dark theme
- Responsive interface

### Security and Privacy

- Data in transit protection
- No sensitive data storage
- Clear privacy policy
- Transparent terms of service

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/NewFeature`
3. Commit your changes: `git commit -m 'Add New Feature'`
4. Push to the branch: `git push origin feature/NewFeature`
5. Open a Pull Request

### Contribution Guidelines

- Maintain modular CSS structure
- Follow existing naming conventions
- Test across different browsers
- Maintain PWA compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](docs/LICENSE) file for details.

## 👤 Author

**Luís Antonio Souza Teixeira**

- LinkedIn: [@luis-tei](https://www.linkedin.com/in/luis-tei/)
- GitHub: [@LuisT-ls](https://github.com/LuisT-ls)
- Email: luishg213@outlook.com
- Instagram: [@luis.tei](https://www.instagram.com/luis.tei)

---

## 🌟 Support the Project

⭐ GitHub Star: [Fake News Detector](https://github.com/LuisT-ls/fakenews)

💝 Contribute: [Open Issues](https://github.com/LuisT-ls/fakenews/issues)

> **Note**: This tool is an aid and does not replace careful human verification. Always check multiple reliable sources.

---

## 🌟 Apoie o Projeto | Support the Project

⭐ Star no GitHub | GitHub Star: [Fake News Detector](https://github.com/LuisT-ls/fakenews)

💝 Contribua | Contribute: [Open Issues](https://github.com/LuisT-ls/fakenews/issues)

> **Nota**: Esta ferramenta é um auxílio e não substitui a verificação humana cuidadosa. Sempre verifique múltiplas fontes confiáveis.

> **Note**: This tool is an aid and does not replace careful human verification. Always check multiple reliable sources.
