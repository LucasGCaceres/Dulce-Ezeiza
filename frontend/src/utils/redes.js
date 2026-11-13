// Redes sociales del local. El backend guarda solo el usuario o el
// número (no la URL completa), y acá se arma el link de cada una.
// Lo usan el Footer (para mostrar los links) y el panel (para que el
// admin vea a dónde va a llevar cada uno).
export const REDES = [
  { campo: 'instagram', nombre: 'Instagram', url: (v) => `https://instagram.com/${v.replace('@', '')}` },
  { campo: 'facebook', nombre: 'Facebook', url: (v) => `https://facebook.com/${v}` },
  { campo: 'tiktok', nombre: 'TikTok', url: (v) => `https://tiktok.com/@${v.replace('@', '')}` },
  { campo: 'whatsapp', nombre: 'WhatsApp', url: (v) => `https://wa.me/${v.replace(/\D/g, '')}` }
]