export default function handler(req, res) {
  // Verificar se a requisição veio do seu domínio
  const allowedOrigins = ['https://fakenews-sigma.vercel.app']
  const origin = req.headers.origin

  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0])
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

  // Verificar origem para requests não-preflight
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origem não autorizada' })
  }

  // Retornar a chave API de forma segura
  res.status(200).json({ apiKey: process.env.GEMINI_API_KEY })
}
