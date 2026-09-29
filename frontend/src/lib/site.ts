export const site = {
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'Vendas de Simples',
  tagline:
    'A plataforma definitiva para capacitação de novos vendedores baseada nos maiores mentores do mercado.',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '55XXXXXXXXXXX',
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? '+55 XX XXXXX-XXXX',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'suporte@seudominio.com.br',
  cnpj: process.env.NEXT_PUBLIC_CNPJ ?? 'XX.XXX.XXX/0001-XX',
  supportHours: 'Segunda a Sexta, das 08h às 18h',
  introVideoUrl: process.env.NEXT_PUBLIC_INTRO_VIDEO_URL ?? '',
};

export const whatsappLink = (text = 'Olá, preciso de ajuda com o curso!') =>
  `https://wa.me/${site.whatsappNumber.replace(/\D/g, '') || '55XXXXXXXXXXX'}?text=${encodeURIComponent(text)}`;
