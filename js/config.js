/* Blackline Performance — configuração e valores por defeito
 *
 * A ligação ao Supabase está em js/env.js (gerado a partir de .env com: node scripts/build-env.mjs).
 * Sem Supabase o site funciona em modo demonstração (dados só no navegador).
 */
window.BL_CONFIG = {
  // Só para o modo demonstração. Com Supabase o login é feito com email e palavra-passe do Supabase Auth.
  adminUser: 'admin',
  adminPassHash: '2e71858c36954a6c40cb339e20f82ae72ea53895be6a2222865cb724f1a94b9d', // só modo demonstração (sem Supabase)
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
  promos: [],
  // Preços indicativos (MZN). price: null = sob orçamento. from: true = "desde".
  // options: subopções com subpreço (o cliente escolhe; o total é a soma). optMode: 'multi' (várias) | 'single' (só uma).
  groups: [
    { id: 'manutencao', name: { pt: 'Manutenção', en: 'Maintenance' }, items: [
      { id: 'revisao', active: true, price: 3500, name: { pt: 'Revisão completa', en: 'Full service' }, desc: { pt: 'Óleo, filtros de óleo, ar e habitáculo, verificação de 40 pontos.', en: 'Oil, oil/air/cabin filters and a 40-point inspection.' }, dur: { pt: '2 h', en: '2 h' },
      optMode: 'single', options: [
        { id: 'ate15', price: 3500, name: { pt: 'Motor até 1.5 L', en: 'Engine up to 1.5 L' }, desc: { pt: 'Citadinos e compactos (Vitz, Demio, Fit…)', en: 'City and compact cars (Vitz, Demio, Fit…)' } },
        { id: 'm1625', price: 4500, name: { pt: 'Motor 1.6 a 2.5 L', en: 'Engine 1.6 to 2.5 L' }, desc: { pt: 'Sedans, carrinhas e SUV médios', en: 'Saloons, wagons and mid-size SUVs' } },
        { id: 'm25', price: 6000, name: { pt: 'Motor acima de 2.5 L / 4x4', en: 'Engine above 2.5 L / 4x4' }, desc: { pt: 'Pick-ups, SUV grandes e 4x4', en: 'Pick-ups, large SUVs and 4x4' } },
      ] },
      { id: 'oleo', active: true, price: 1800, name: { pt: 'Mudança de óleo e filtro', en: 'Oil and filter change' }, desc: { pt: 'Óleo de especificação do fabricante.', en: 'Manufacturer-spec oil.' }, dur: { pt: '45 min', en: '45 min' },
      optMode: 'single', options: [
        { id: 'semi', price: 1800, name: { pt: 'Óleo semi-sintético', en: 'Semi-synthetic oil' }, desc: { pt: 'Inclui filtro de óleo', en: 'Oil filter included' } },
        { id: 'sint', price: 2500, name: { pt: 'Óleo sintético', en: 'Fully synthetic oil' }, desc: { pt: 'Inclui filtro de óleo', en: 'Oil filter included' } },
      ] },
      { id: 'travoes', active: true, price: 2500, from: true, name: { pt: 'Travões', en: 'Brakes' }, desc: { pt: 'Pastilhas e/ou discos, eixo dianteiro ou traseiro.', en: 'Pads and/or discs, front or rear axle.' }, dur: { pt: '1 h 30', en: '1 h 30' },
      optMode: 'multi', options: [
        { id: 'past_f', price: 2500, name: { pt: 'Pastilhas dianteiras', en: 'Front pads' }, desc: { pt: 'Mão de obra, eixo dianteiro', en: 'Labour, front axle' } },
        { id: 'past_t', price: 2500, name: { pt: 'Pastilhas traseiras', en: 'Rear pads' }, desc: { pt: 'Mão de obra, eixo traseiro', en: 'Labour, rear axle' } },
        { id: 'disc_f', price: 3500, name: { pt: 'Discos dianteiros', en: 'Front discs' }, desc: { pt: 'Substituição ou retificação', en: 'Replacement or skimming' } },
        { id: 'disc_t', price: 3500, name: { pt: 'Discos / tambores traseiros', en: 'Rear discs / drums' }, desc: { pt: 'Substituição ou retificação', en: 'Replacement or skimming' } },
        { id: 'oleo_tr', price: 1500, name: { pt: 'Óleo dos travões', en: 'Brake fluid' }, desc: { pt: 'Substituição completa do líquido', en: 'Full fluid replacement' } },
      ] },
      { id: 'diagnostico', active: true, price: 1500, name: { pt: 'Diagnóstico computorizado', en: 'Computer diagnostics' }, desc: { pt: 'Leitura de avarias e relatório.', en: 'Fault code reading and report.' }, dur: { pt: '45 min', en: '45 min' },
      optMode: 'single', options: [
        { id: 'scan', price: 1500, name: { pt: 'Leitura de avarias', en: 'Fault code reading' }, desc: { pt: 'Scanner e apagar códigos', en: 'Scan and clear codes' } },
        { id: 'full', price: 2500, name: { pt: 'Diagnóstico completo com relatório', en: 'Full diagnosis with report' }, desc: { pt: 'Testes e relatório escrito', en: 'Tests and written report' } },
      ] },
    ] },
    { id: 'mecanica', name: { pt: 'Mecânica e eletricidade', en: 'Mechanical and electrical' }, items: [
      { id: 'mecanica', active: true, price: null, name: { pt: 'Mecânica geral', en: 'General mechanics' }, desc: { pt: 'Motor, suspensão, direção e transmissão.', en: 'Engine, suspension, steering and transmission.' }, dur: { pt: 'A definir', en: 'To be defined' },
      optMode: 'multi', options: [
        { id: 'motor', price: null, name: { pt: 'Motor', en: 'Engine' }, desc: { pt: 'Ruídos, falhas, fugas, correia', en: 'Noises, misfires, leaks, belt' } },
        { id: 'susp', price: null, name: { pt: 'Suspensão', en: 'Suspension' }, desc: { pt: 'Amortecedores, molas, rótulas, casquilhos', en: 'Shocks, springs, ball joints, bushes' } },
        { id: 'dir', price: null, name: { pt: 'Direção', en: 'Steering' }, desc: { pt: 'Folgas, direção assistida, alinhamento', en: 'Play, power steering, alignment' } },
        { id: 'trans', price: null, name: { pt: 'Caixa e embraiagem', en: 'Gearbox and clutch' }, desc: { pt: 'Manual ou automática', en: 'Manual or automatic' } },
        { id: 'arref', price: null, name: { pt: 'Arrefecimento', en: 'Cooling' }, desc: { pt: 'Radiador, bomba de água, sobreaquecimento', en: 'Radiator, water pump, overheating' } },
      ] },
      { id: 'eletricidade', active: true, price: 1500, from: true, name: { pt: 'Eletricidade auto', en: 'Auto electrical' }, desc: { pt: 'Baterias, alternador, cablagens e iluminação.', en: 'Batteries, alternator, wiring and lighting.' }, dur: { pt: '1 h', en: '1 h' },
      optMode: 'multi', options: [
        { id: 'bat', price: 1500, name: { pt: 'Bateria', en: 'Battery' }, desc: { pt: 'Teste e substituição', en: 'Test and replacement' } },
        { id: 'alt', price: 2500, name: { pt: 'Alternador / motor de arranque', en: 'Alternator / starter' }, desc: { pt: 'Diagnóstico e reparação', en: 'Diagnosis and repair' } },
        { id: 'luz', price: 1500, name: { pt: 'Iluminação', en: 'Lighting' }, desc: { pt: 'Faróis, farolins e lâmpadas', en: 'Headlights, tail lights and bulbs' } },
        { id: 'cabl', price: null, name: { pt: 'Cablagens e curto-circuitos', en: 'Wiring and short circuits' }, desc: { pt: 'Sob orçamento após diagnóstico', en: 'Quoted after diagnosis' } },
      ] },
      { id: 'ac', active: true, price: 2000, name: { pt: 'Ar condicionado', en: 'Air conditioning' }, desc: { pt: 'Verificação de fugas e carga de gás.', en: 'Leak check and gas recharge.' }, dur: { pt: '1 h', en: '1 h' },
      optMode: 'multi', options: [
        { id: 'gas', price: 2000, name: { pt: 'Carga de gás', en: 'Gas recharge' }, desc: { pt: 'Vácuo e carga', en: 'Vacuum and recharge' } },
        { id: 'fuga', price: 1500, name: { pt: 'Deteção de fugas', en: 'Leak detection' }, desc: { pt: 'Teste com corante / azoto', en: 'Dye / nitrogen test' } },
        { id: 'limp', price: 1500, name: { pt: 'Higienização do sistema', en: 'System sanitising' }, desc: { pt: 'Filtro de habitáculo e desinfeção', en: 'Cabin filter and disinfection' } },
      ] },
    ] },
    { id: 'estetica', name: { pt: 'Carroçaria e estética', en: 'Bodywork and detailing' }, items: [
      { id: 'pintura', active: true, price: null, name: { pt: 'Bate-chapa e pintura', en: 'Panel beating and paint' }, desc: { pt: 'Reparação de danos e pintura com acabamento de fábrica.', en: 'Damage repair and factory-finish paintwork.' }, dur: { pt: 'A definir', en: 'To be defined' },
      optMode: 'multi', options: [
        { id: 'pc_f', price: null, name: { pt: 'Para-choques dianteiro', en: 'Front bumper' }, desc: { pt: '', en: '' } },
        { id: 'pc_t', price: null, name: { pt: 'Para-choques traseiro', en: 'Rear bumper' }, desc: { pt: '', en: '' } },
        { id: 'capo', price: null, name: { pt: 'Capô', en: 'Bonnet' }, desc: { pt: '', en: '' } },
        { id: 'portas', price: null, name: { pt: 'Portas', en: 'Doors' }, desc: { pt: 'Indique quais no detalhe', en: 'Say which in the details' } },
        { id: 'guarda', price: null, name: { pt: 'Guarda-lamas', en: 'Fenders' }, desc: { pt: '', en: '' } },
        { id: 'completa', price: null, name: { pt: 'Pintura completa', en: 'Full respray' }, desc: { pt: '', en: '' } },
      ] },
      { id: 'lavagem', active: true, price: 800, name: { pt: 'Lavagem completa', en: 'Full wash' }, desc: { pt: 'Exterior, interior e jantes.', en: 'Exterior, interior and wheels.' }, dur: { pt: '1 h', en: '1 h' },
      optMode: 'multi', options: [
        { id: 'ext', price: 400, name: { pt: 'Exterior', en: 'Exterior' }, desc: { pt: 'Lavagem e secagem à mão', en: 'Hand wash and dry' } },
        { id: 'int', price: 300, name: { pt: 'Interior', en: 'Interior' }, desc: { pt: 'Aspiração, tablier e vidros', en: 'Vacuum, dashboard and glass' } },
        { id: 'jantes', price: 100, name: { pt: 'Jantes e pneus', en: 'Wheels and tyres' }, desc: { pt: 'Limpeza e brilho', en: 'Clean and shine' } },
        { id: 'motor', price: 500, name: { pt: 'Motor', en: 'Engine bay' }, desc: { pt: 'Limpeza do compartimento', en: 'Engine bay clean' } },
      ] },
      { id: 'detailing', active: true, price: 8000, from: true, name: { pt: 'Detailing e ceramic coating', en: 'Detailing and ceramic coating' }, desc: { pt: 'Correção de pintura e proteção cerâmica.', en: 'Paint correction and ceramic protection.' }, dur: { pt: '1 dia', en: '1 day' },
      optMode: 'multi', options: [
        { id: 'corr', price: 8000, name: { pt: 'Correção de pintura', en: 'Paint correction' }, desc: { pt: 'Remoção de riscos e marcas', en: 'Swirl and scratch removal' } },
        { id: 'ceram', price: 12000, name: { pt: 'Ceramic coating', en: 'Ceramic coating' }, desc: { pt: 'Proteção cerâmica da pintura', en: 'Ceramic paint protection' } },
        { id: 'farois', price: 1500, name: { pt: 'Polimento de faróis', en: 'Headlight restoration' }, desc: { pt: 'Faróis baços ou amarelados', en: 'Hazy or yellowed headlights' } },
        { id: 'estofos', price: 3000, name: { pt: 'Limpeza de estofos', en: 'Upholstery cleaning' }, desc: { pt: 'Bancos, alcatifas e tejadilho', en: 'Seats, carpets and headliner' } },
      ] },
      { id: 'smash', active: true, price: 4500, name: { pt: 'Smash & Grab', en: 'Smash & Grab' }, desc: { pt: 'Película de segurança nos vidros laterais e traseiro.', en: 'Security film on side and rear windows.' }, dur: { pt: '3 h', en: '3 h' },
      optMode: 'multi', options: [
        { id: 'frente', price: 2500, name: { pt: 'Frente (para-brisas)', en: 'Front (windscreen)' }, desc: { pt: 'Película no vidro da frente', en: 'Film on the windscreen' } },
        { id: 'tras', price: 2500, name: { pt: 'Trás (vidro traseiro)', en: 'Rear window' }, desc: { pt: 'Película no vidro de trás', en: 'Film on the rear window' } },
        { id: 'lat_fe', price: 1500, name: { pt: 'Lateral dianteira esquerda', en: 'Front left side' }, desc: { pt: 'Vidro da porta', en: 'Door window' } },
        { id: 'lat_fd', price: 1500, name: { pt: 'Lateral dianteira direita', en: 'Front right side' }, desc: { pt: 'Vidro da porta', en: 'Door window' } },
        { id: 'lat_te', price: 1500, name: { pt: 'Lateral traseira esquerda', en: 'Rear left side' }, desc: { pt: 'Vidro da porta', en: 'Door window' } },
        { id: 'lat_td', price: 1500, name: { pt: 'Lateral traseira direita', en: 'Rear right side' }, desc: { pt: 'Vidro da porta', en: 'Door window' } },
      ] },
    ] },
    { id: 'performance', name: { pt: 'Performance', en: 'Performance' }, items: [
      { id: 'tuning', active: true, price: null, name: { pt: 'Tuning e personalização', en: 'Tuning and styling' }, desc: { pt: 'Reprogramação, escapes, jantes e acessórios.', en: 'Remapping, exhausts, wheels and accessories.' }, dur: { pt: 'A definir', en: 'To be defined' },
      optMode: 'multi', options: [
        { id: 'remap', price: null, name: { pt: 'Reprogramação (remap)', en: 'Remap' }, desc: { pt: 'Mais potência e resposta', en: 'More power and response' } },
        { id: 'escape', price: null, name: { pt: 'Escape', en: 'Exhaust' }, desc: { pt: 'Ponteiras, abafadores, sistemas completos', en: 'Tips, mufflers, full systems' } },
        { id: 'jantes', price: null, name: { pt: 'Jantes e pneus', en: 'Wheels and tyres' }, desc: { pt: 'Montagem e equilibragem', en: 'Fitting and balancing' } },
        { id: 'acess', price: null, name: { pt: 'Acessórios e estilo', en: 'Accessories and styling' }, desc: { pt: 'Iluminação, kits, interiores', en: 'Lighting, kits, interiors' } },
      ] },
    ] },
  ],
};
