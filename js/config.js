/* Blackline Performance — configuração e valores por defeito
 *
 * backendUrl: URL da aplicação web do Google Apps Script (ver docs/painel-admin.md).
 *   Vazio  → modo demonstração: marcações e alterações ficam guardadas só no navegador.
 *   Preenchido → modo online: marcações e alterações ficam na Folha Google da Blackline
 *                e valem para todos os visitantes.
 */
window.BL_CONFIG = {
  backendUrl: '',
  // Apenas para o modo demonstração. No modo online a palavra-passe é validada no servidor.
  adminUser: 'admin',
  adminPassHash: '2e71858c36954a6c40cb339e20f82ae72ea53895be6a2222865cb724f1a94b9d', // Blackline@2026
};

window.BL_DEFAULTS = {
  version: 1,
  contacts: {
    phone: '+258 86 042 4242',
    whatsapp: '258860424242',
    email: '',
    instagram: 'blp_autocare',
    tiktok: 'blackline.perfomace',
    address: { pt: 'Moçambique', en: 'Mozambique' },
    hours: { pt: 'Seg–Sex 08:00–17:00 · Sáb 08:00–12:00', en: 'Mon–Fri 08:00–17:00 · Sat 08:00–12:00' },
    payment: { pt: 'Numerário, POS, M-Pesa e e-Mola', en: 'Cash, card, M-Pesa and e-Mola' },
  },
  booking: {
    pickupFee: 500,
    satClose: '12:00',
  },
  // Dados que aparecem nas cotações em PDF
  company: {
    legalName: 'Blackline Performance',
    nuit: '',
    address: 'Moçambique',
    vatRate: 16,              // IVA em Moçambique
    pricesIncludeVat: true,   // os preços dos serviços já incluem IVA
    quoteValidityDays: 15,
    quoteTerms: 'Valores sujeitos a confirmação após avaliação da viatura. Garantia de 6 meses na mão de obra. Peças com garantia do fornecedor.',
    bankDetails: '',
  },
  // Promoções (geridas no painel). type: 'percent' | 'fixed' | 'price'. services: [] = todos.
  promos: [
    { id: 'promo-exemplo', active: true, showOnSite: true, type: 'percent', value: 15, services: ['lavagem', 'detailing'],
      start: '2026-10-01', end: '2026-10-31',
      title: { pt: 'Outubro: estética com 15% de desconto', en: 'October: 15% off detailing' },
      desc: { pt: 'Lavagem completa e detailing com desconto durante todo o mês. Exemplo — edite ou apague no painel.', en: 'Full wash and detailing discounted all month. Example — edit or delete in the admin panel.' } },
  ],
  // Preços indicativos (MZN). price: null = sob orçamento. from: true = "desde".
  groups: [
    { id: 'manutencao', name: { pt: 'Manutenção', en: 'Maintenance' }, items: [
      { id: 'revisao', active: true, price: 3500, name: { pt: 'Revisão completa', en: 'Full service' }, desc: { pt: 'Óleo, filtros de óleo, ar e habitáculo, verificação de 40 pontos.', en: 'Oil, oil/air/cabin filters and a 40-point inspection.' }, dur: { pt: '2 h', en: '2 h' } },
      { id: 'oleo', active: true, price: 1800, name: { pt: 'Mudança de óleo e filtro', en: 'Oil and filter change' }, desc: { pt: 'Óleo de especificação do fabricante.', en: 'Manufacturer-spec oil.' }, dur: { pt: '45 min', en: '45 min' } },
      { id: 'travoes', active: true, price: 2500, from: true, name: { pt: 'Travões', en: 'Brakes' }, desc: { pt: 'Pastilhas e/ou discos, eixo dianteiro ou traseiro.', en: 'Pads and/or discs, front or rear axle.' }, dur: { pt: '1 h 30', en: '1 h 30' } },
      { id: 'diagnostico', active: true, price: 1500, name: { pt: 'Diagnóstico computorizado', en: 'Computer diagnostics' }, desc: { pt: 'Leitura de avarias e relatório.', en: 'Fault code reading and report.' }, dur: { pt: '45 min', en: '45 min' } },
    ] },
    { id: 'mecanica', name: { pt: 'Mecânica e eletricidade', en: 'Mechanical and electrical' }, items: [
      { id: 'mecanica', active: true, price: null, name: { pt: 'Mecânica geral', en: 'General mechanics' }, desc: { pt: 'Motor, suspensão, direção e transmissão.', en: 'Engine, suspension, steering and transmission.' }, dur: { pt: 'A definir', en: 'To be defined' } },
      { id: 'eletricidade', active: true, price: 1500, from: true, name: { pt: 'Eletricidade auto', en: 'Auto electrical' }, desc: { pt: 'Baterias, alternador, cablagens e iluminação.', en: 'Batteries, alternator, wiring and lighting.' }, dur: { pt: '1 h', en: '1 h' } },
      { id: 'ac', active: true, price: 2000, name: { pt: 'Ar condicionado', en: 'Air conditioning' }, desc: { pt: 'Verificação de fugas e carga de gás.', en: 'Leak check and gas recharge.' }, dur: { pt: '1 h', en: '1 h' } },
    ] },
    { id: 'estetica', name: { pt: 'Carroçaria e estética', en: 'Bodywork and detailing' }, items: [
      { id: 'pintura', active: true, price: null, name: { pt: 'Bate-chapa e pintura', en: 'Panel beating and paint' }, desc: { pt: 'Reparação de danos e pintura com acabamento de fábrica.', en: 'Damage repair and factory-finish paintwork.' }, dur: { pt: 'A definir', en: 'To be defined' } },
      { id: 'lavagem', active: true, price: 800, name: { pt: 'Lavagem completa', en: 'Full wash' }, desc: { pt: 'Exterior, interior e jantes.', en: 'Exterior, interior and wheels.' }, dur: { pt: '1 h', en: '1 h' } },
      { id: 'detailing', active: true, price: 8000, from: true, name: { pt: 'Detailing e ceramic coating', en: 'Detailing and ceramic coating' }, desc: { pt: 'Correção de pintura e proteção cerâmica.', en: 'Paint correction and ceramic protection.' }, dur: { pt: '1 dia', en: '1 day' } },
      { id: 'smash', active: true, price: 4500, name: { pt: 'Smash & Grab', en: 'Smash & Grab' }, desc: { pt: 'Película de segurança nos vidros laterais e traseiro.', en: 'Security film on side and rear windows.' }, dur: { pt: '3 h', en: '3 h' } },
    ] },
    { id: 'performance', name: { pt: 'Performance', en: 'Performance' }, items: [
      { id: 'tuning', active: true, price: null, name: { pt: 'Tuning e personalização', en: 'Tuning and styling' }, desc: { pt: 'Reprogramação, escapes, jantes e acessórios.', en: 'Remapping, exhausts, wheels and accessories.' }, dur: { pt: 'A definir', en: 'To be defined' } },
    ] },
  ],
};
