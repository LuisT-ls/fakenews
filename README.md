# 🔍 Verificador de Fake News

> Uma aplicação web moderna que utiliza Inteligência Artificial e APIs avançadas para detectar e analisar possíveis fake news, promovendo uma comunicação mais consciente e baseada em fatos.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com/)

## 📑 Índice

- [🌟 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [🚀 Começando](#-começando)
- [⚙️ Configuração](#️-configuração)
- [💡 Uso](#-uso)
- [🎨 Interface](#-interface)
- [📱 PWA](#-pwa)
- [🔒 Privacidade e Segurança](#-privacidade-e-segurança)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)
- [👤 Autor](#-autor)

## 🌟 Visão Geral

O Verificador de Fake News é uma ferramenta web desenvolvida como projeto final da disciplina "Algoritmo, Política e Sociedade" na UFBA. Utiliza tecnologias modernas e IA para analisar e identificar possíveis desinformações, ajudando usuários a tomarem decisões mais informadas sobre o conteúdo que consomem e compartilham.

## ✨ Funcionalidades

### Análise de Conteúdo
- ✅ Verificação em tempo real de textos e notícias
- 📊 Pontuação de confiabilidade baseada em múltiplos fatores
- 🔍 Identificação de elementos suspeitos
- 📝 Análise detalhada do conteúdo

### Recursos Avançados
- 🤖 Integração com Google Gemini API para análise profunda
- 💾 Histórico de verificações
- 🌓 Modo escuro/claro
- 📱 Design responsivo
- 🔄 Funcionamento offline
- 📲 Instalável como PWA

### Compartilhamento
- 📤 Compartilhamento direto para redes sociais
- 📊 Resultados detalhados exportáveis
- 🔗 Links para fontes confiáveis

## 🛠️ Tecnologias

### Frontend
- HTML5 & CSS3
- JavaScript (ES6+)
- Bootstrap 5.3.0
- Font Awesome 6.0.0

### APIs e Serviços
- Google Gemini API
- Service Workers para PWA

### Ferramentas de Desenvolvimento
- CSS Modular
- Sistema de Componentes
- Mobile-First Design

## 📂 Estrutura do Projeto

```
.
├── assets/
│   ├── css/
│   │   ├── base/           # Estilos base e variáveis
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── layout/         # Layouts principais
│   │   └── utils/          # Utilidades CSS
│   ├── images/
│   └── js/
├── docs/
├── pages/                  # Páginas estáticas
└── manifest.json          # Configuração PWA
```

## 🚀 Começando

### Pré-requisitos

- Navegador moderno com suporte a ES6+
- Chave da API Google Gemini

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/LuisT-ls/fakenews.git
cd fakenews
```

2. Configure as variáveis de ambiente no arquivo `assets/js/script.js`:
```javascript
const GEMINI_API_KEY = 'SUA_CHAVE_AQUI';
```

3. Execute o projeto:
- Use um servidor local como Live Server
- Ou abra `index.html` diretamente no navegador

## 💡 Uso

1. Acesse a aplicação
2. Cole o texto a ser verificado
3. Clique em "Verificar Agora"
4. Analise os resultados detalhados
5. Compartilhe a verificação (opcional)

## 🎨 Interface

### Componentes Principais
- Barra de navegação responsiva
- Campo de entrada de texto
- Painel de resultados
- Histórico de verificações
- Guia de dicas

### Temas
- Suporte a modo claro/escuro
- Cores acessíveis
- Design intuitivo

## 📱 PWA

A aplicação é um Progressive Web App (PWA) que oferece:
- ⚡ Instalação no dispositivo
- 🔄 Funcionamento offline
- 📲 Experiência nativa
- 🔔 Notificações (opcional)

## 🔒 Privacidade e Segurança

- ✅ Não armazena dados sensíveis
- 🔐 Processamento local quando possível
- 📜 Política de privacidade clara
- ⚠️ Avisos sobre limitações

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 👤 Autor

**Luís Antonio Souza Teixeira**

- 📧 Email: luishg213@outlook.com
- 🔗 LinkedIn: [luis-tei](https://www.linkedin.com/in/luis-tei/)
- 📷 Instagram: [@luis.tei](https://www.instagram.com/luis.tei)

---

⭐️ Este projeto? [Deixe uma estrela no GitHub](https://github.com/LuisT-ls/fakenews)!

> **Nota**: Esta ferramenta é um auxílio e não substitui a verificação humana cuidadosa. Sempre verifique múltiplas fontes confiáveis.