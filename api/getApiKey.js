export default function handler(req, res) {
  // Permitir requisições do mesmo domínio
  const allowedOrigin = 'https://fakenews-sigma.vercel.app'

  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // Lidar com preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Retornar a chave API de forma segura
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key não configurada')
    }
    res.status(200).json({ apiKey: process.env.GEMINI_API_KEY })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter a chave API' })
  }
}
