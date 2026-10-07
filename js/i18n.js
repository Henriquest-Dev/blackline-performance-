/* Blackline Performance — traduções PT / EN */
(() => {
  const DICT = {
    pt: {
      'meta.title': 'Blackline Performance — Excelência em Serviços Automóveis',
      'nav.aria': 'Principal', 'nav.about': 'Sobre', 'nav.services': 'Serviços', 'nav.process': 'Como funciona', 'nav.why': 'Porquê nós', 'nav.contact': 'Contacto',
      'nav.open': 'Abrir menu', 'nav.close': 'Fechar menu',
      'cta.book': 'Marcar serviço', 'cta.bookService': 'Marcar revisão', 'cta.online': 'Marcar online',
      'cta.title': 'Agende já uma revisão!', 'cta.lead': 'Marque online em poucos passos ou fale diretamente com a oficina.',
      'hero.l1': '<em>Excelência</em> em', 'hero.l2': 'Serviços', 'hero.l3': 'Automóveis',
      'hero.lead': 'Mecânica, eletricidade, bate-chapa, detailing e performance — tudo num só lugar, com o rigor que a sua viatura merece.',
      'hero.follow': 'Siga-nos', 'hero.bar1': 'Atendimento profissional & personalizado.', 'hero.bar2': 'Agende já uma revisão!',
      'ph.status': 'Estado da viatura', 'ph.s1': 'Viatura recebida', 'ph.s2': 'Diagnóstico', 'ph.s2d': '09:02 · Computorizado', 'ph.s3': 'Em reparação', 'ph.s3d': 'Troca de pastilhas e discos',
      'ph.s4': 'Lavagem', 'ph.s4d': 'Previsto 15:30', 'ph.s5': 'Pronta a levantar', 'ph.s5d': 'Previsto 17:30', 'ph.eta': 'Entrega estimada',
      'ph.book': 'Marcar serviço', 'ph.car': 'A sua viatura', 'ph.service': 'Serviço', 'ph.c1': 'Revisão', 'ph.c2': 'Travões', 'ph.c3': 'Lavagem', 'ph.date': 'Data',
      'ph.d1': 'Seg', 'ph.d2': 'Ter', 'ph.d3': 'Qua', 'ph.d4': 'Qui', 'ph.confirm': 'Confirmar marcação',
      'app.title': 'Acompanhe a sua viatura', 'app.lead': 'Marque online e acompanhe cada etapa — receção, diagnóstico, reparação, lavagem e entrega. O orçamento e as fotos do trabalho chegam-lhe pelo WhatsApp.',
      'app.f1t': 'Orçamento', 'app.f1': 'Aprovado por si antes de qualquer intervenção.', 'app.f2t': 'Registo', 'app.f2': 'Fotografias do antes e depois de cada serviço.', 'app.f3t': 'Manutenção', 'app.f3': 'Aviso da próxima revisão, por data ou quilometragem.',
      'svc.title': 'Serviços', 'svc.lead': 'Manutenção, reparação, estética e performance para todas as marcas, numa só oficina.',
      'f.all': 'Todos', 'f.mec': 'Mecânica', 'f.ele': 'Eletricidade', 'f.pin': 'Bate-chapa e pintura', 'f.pin2': 'Bate-chapa', 'f.det': 'Detailing', 'f.lav': 'Lavagem', 'f.tun': 'Tuning',
      'show.aria': 'Viaturas na oficina', 'show.kicker': 'Na oficina esta semana', 'show.prev': 'Anterior', 'show.next': 'Seguinte', 'show.cta': 'Marcar para a minha viatura',
      'g.book': 'Marcar',
      'g1.t': 'Remap e escape desportivo', 'g1.d': 'Mais potência e resposta do motor',
      'g2.t': 'Ceramic coating 9H', 'g2.d': 'Proteção da pintura até 3 anos',
      'g3.t': 'Correção de pintura', 'g3.d': 'Polimento em 3 fases',
      'g4.t': 'Revisão completa', 'g4.d': 'Óleo, filtros e travões',
      'g5.t': 'Lavagem premium', 'g5.d': 'Interior e exterior',
      'g6.t': 'Diagnóstico eletrónico', 'g6.d': 'Leitura de avarias e cablagens',
      'g7.t': 'Suspensão e jantes', 'g7.d': 'Rebaixamento e alinhamento',
      'g8.t': 'Mudança de óleo', 'g8.d': 'Óleo e filtro em 45 minutos',
      'g9.t': 'Reparação de chapa', 'g9.d': 'Acabamento de fábrica',
      'g10.t': 'Smash & Grab', 'g10.d': 'Película de segurança nos vidros',
      'g11.t': 'Polimento e vidros', 'g11.d': 'Brilho espelhado e vidros tratados',
      'f.pin3': 'Pintura', 'f.sg': 'Smash & Grab',
      'why.title': 'Porquê a Blackline', 'why.lead': 'Uma oficina com método: diagnóstico antes de reparar, orçamento antes de avançar, e a viatura entregue limpa e testada.',
      'why.1t': 'Diagnóstico computorizado', 'why.1': 'Equipamento de diagnóstico multimarca. Sabemos o que reparar antes de mexer.',
      'why.2t': 'Orçamento fechado', 'why.2': 'Valor aprovado por si antes de qualquer trabalho. Sem extras surpresa na fatura.',
      'why.3t': 'Peças certificadas', 'why.3': 'Originais ou equivalentes de qualidade, sempre com fatura e referência.',
      'why.4t': '6 meses de garantia', 'why.4': 'Garantia sobre a mão de obra em todos os serviços de mecânica e eletricidade.',
      'info.hours': 'Horário', 'info.brands': 'Marcas', 'info.brandsV': 'Todas as marcas<br>ligeiros e SUV', 'info.contact': 'Contacto', 'info.pay': 'Pagamento',
      'proc.title': 'Como funciona', 'proc.lead': 'Da marcação à entrega, sabe sempre em que ponto está a sua viatura.',
      'proc.1t': 'Marcação', 'proc.1': 'Escolha o serviço, o dia e a hora — online, por WhatsApp ou por telefone.',
      'proc.2t': 'Diagnóstico', 'proc.2': 'Inspeção computorizada e orçamento enviado para aprovação.',
      'proc.3t': 'Execução', 'proc.3': 'Técnicos especializados, peças de qualidade e fotos do progresso.',
      'proc.4t': 'Entrega', 'proc.4': 'Viatura lavada, testada e pronta — com 6 meses de garantia.',
      'foot.about': 'Excelência em serviços automóveis. Atendimento profissional e personalizado.', 'foot.nav': 'Navegação',
      'foot.s1': 'Mecânica geral', 'foot.s2': 'Eletricidade auto', 'foot.s4': 'Detailing e ceramic', 'foot.news': 'Novidades', 'foot.newsLead': 'Campanhas e lembretes de manutenção. Sem spam.',
      'promo.title': 'Promoções', 'promo.lead': 'Condições especiais por tempo limitado. O desconto é aplicado automaticamente na marcação online.',
      'promo.until': 'Válido até {d}', 'promo.from': 'De {a} a {b}', 'promo.cta': 'Marcar com desconto', 'promo.all': 'Todos os serviços com preço', 'promo.tag': 'Promoção', 'promo.price': 'Preço especial',
      'foot.email': 'O seu email', 'foot.thanks': 'Obrigado!', 'foot.terms': 'Termos', 'foot.privacy': 'Privacidade',

      // marcação
      'bk.name': 'Marcação de serviço', 'bk.t1': 'Serviços', 'bk.t2': 'Viatura', 'bk.t3': 'Data e hora', 'bk.t4': 'Contacto', 'bk.t5': 'Confirmação', 'bk.close': 'Fechar',
      'bk.step': 'Etapa {n} de 5', 'bk.done': 'Concluído',
      'bk.h0': 'Que serviços pretende?', 'bk.d0': 'Selecione um ou mais serviços. Os valores são indicativos; o preço final é confirmado após avaliação da viatura.',
      'bk.h1': 'Dados da viatura', 'bk.d1': 'Ajuda-nos a preparar as peças certas e o tempo de oficina.',
      'bk.h2': 'Data e hora', 'bk.d2': 'Escolha o dia no calendário e depois o horário.',
      'bk.h3': 'Os seus contactos', 'bk.d3': 'Usamos estes dados apenas para confirmar e acompanhar a marcação.',
      'bk.h4': 'Confirme o pedido', 'bk.d4': 'Verifique os dados. Pode alterar qualquer secção antes de enviar.',
      'bk.h5': 'Pedido de marcação registado', 'bk.d5': '',
      'bk.brand': 'Marca', 'bk.model': 'Modelo', 'bk.modelPh': 'Ex.: Vitz 1.0, Demio, Hilux 2.8', 'bk.year': 'Ano', 'bk.km': 'Quilometragem', 'bk.fuel': 'Combustível',
      'bk.fuelG': 'Gasolina', 'bk.fuelD': 'Diesel', 'bk.fuelH': 'Híbrido', 'bk.fuelE': 'Elétrico', 'bk.plate': 'Matrícula',
      'bk.chassis': 'Número de chassis (VIN)', 'bk.chassisHint': 'Está no livrete e na chapa do pilar da porta ou do para-brisas. Usamos para confirmar as peças certas.',
      'bk.select': 'Selecione', 'bk.other': 'Outra',
      'bk.drop': 'Entrega da viatura', 'bk.drop1': 'Deixo a viatura na oficina', 'bk.drop1d': 'Sem custo adicional', 'bk.drop2': 'Recolha e entrega no meu endereço', 'bk.drop2d': '+{fee} · dentro da cidade',
      'bk.first': 'Nome', 'bk.last': 'Apelido', 'bk.phone': 'Telemóvel', 'bk.email': 'Email', 'bk.optional': '(opcional)', 'bk.pref': 'Como prefere ser contactado?', 'bk.prefCall': 'Chamada',
      'bk.notes': 'Outros detalhes', 'bk.notesPh': 'Ex.: ruído na roda dianteira ao travar; risco na porta traseira esquerda.',
      'bk.aboutT': 'Sobre o pedido', 'bk.aboutD': 'Ajuda-nos a preparar a viatura e as peças antes de chegar. Tudo opcional.',
      'bk.goal': 'O que pretende?', 'bk.goal1': 'Manutenção programada', 'bk.goal2': 'Resolver um problema', 'bk.goal3': 'Estética / aspeto', 'bk.goal4': 'Mais desempenho', 'bk.goal5': 'Avaliação / orçamento',
      'bk.symptoms': 'Sinais que notou', 'bk.sy1': 'Ruído', 'bk.sy2': 'Vibração', 'bk.sy3': 'Luz de aviso no painel', 'bk.sy4': 'Fuga de líquido', 'bk.sy5': 'Perda de potência', 'bk.sy6': 'Dificuldade a arrancar', 'bk.sy7': 'Aquece demais', 'bk.sy8': 'Travões fracos', 'bk.sy9': 'Ar condicionado fraco', 'bk.sy10': 'Riscos / amolgadelas',
      'bk.sel': '—', 'bk.since': 'Desde quando?', 'bk.since1': 'Hoje', 'bk.since2': 'Esta semana', 'bk.since3': 'Este mês', 'bk.since4': 'Há mais tempo',
      'bk.drive': 'A viatura anda?', 'bk.drive1': 'Sim, normalmente', 'bk.drive2': 'Sim, com dificuldade', 'bk.drive3': 'Não — precisa de reboque',
      'bk.urgency': 'Urgência', 'bk.urg1': 'Normal', 'bk.urg2': 'Urgente — preciso da viatura rápido',
      'bk.parts': 'Peças', 'bk.parts1': 'A oficina fornece as peças', 'bk.parts2': 'Eu trago as minhas peças', 'bk.parts3': 'Decidir depois do orçamento',
      'bk.optsSingle': 'Escolha uma opção', 'bk.optsMulti': 'Escolha as partes que pretende', 'bk.optsAll': 'Selecionar tudo', 'bk.optsNone': 'Limpar', 'bk.svcNote': 'Detalhe deste serviço (opcional)', 'bk.svcNotePh': 'Ex.: só o vidro do condutor; risco na porta de trás',
      'err.opts': 'Escolha pelo menos uma opção em {s}.', 'bk.rvDetails': 'Pedido',
      'bk.consent': 'Aceito ser contactado pela Blackline Performance sobre esta marcação.',
      'bk.order': 'O seu pedido', 'bk.total': 'Total estimado', 'bk.back': 'Voltar', 'bk.next': 'Continuar', 'bk.send': 'Enviar pedido', 'bk.sending': 'A enviar…', 'bk.finish': 'Concluir',
      'bk.noteVat': 'Valores indicativos, IVA incluído.', 'bk.noteQuote': 'Inclui serviços sob orçamento — valor final após avaliação.',
      'bk.quote': 'Sob orçamento', 'bk.from': 'desde', 'bk.pickup': 'Recolha e entrega',
      'bk.dow': 'Seg,Ter,Qua,Qui,Sex,Sáb,Dom', 'bk.morning': 'Manhã', 'bk.afternoon': 'Tarde', 'bk.pickDay': 'Selecione um dia no calendário para ver os horários disponíveis.', 'bk.unavailable': 'indisponível',
      'bk.edit': 'Alterar', 'bk.rvMakeModel': 'Marca e modelo', 'bk.rvDate': 'Data', 'bk.rvTime': 'Hora', 'bk.rvDrop': 'Entrega', 'bk.rvDropShop': 'Na oficina', 'bk.rvDropHome': 'Recolha e entrega no endereço',
      'bk.rvName': 'Nome', 'bk.rvPref': 'Preferência',
      'bk.ref': 'Referência', 'bk.sent': 'Recebemos o seu pedido para <b>{car}</b> em <b>{when}</b>. A marcação fica confirmada quando a oficina o contactar por {pref}.',
      'bk.atShop': 'na oficina', 'bk.atHome': 'recolha no seu endereço',
      'bk.n1': 'Confirmação', 'bk.n1d': 'A oficina confirma a hora pelo contacto que escolheu, em horário de expediente.', 'bk.n2': 'Receção', 'bk.n3': 'Orçamento', 'bk.n3d': 'Recebe o orçamento para aprovação antes de qualquer trabalho.',
      'bk.ics': 'Adicionar ao calendário', 'bk.question': 'Tenho uma dúvida',
      'bk.pref.whatsapp': 'WhatsApp', 'bk.pref.chamada': 'chamada', 'bk.pref.email': 'email',
      'err.services': 'Selecione pelo menos um serviço.', 'err.brand': 'Indique a marca.', 'err.model': 'Indique o modelo.', 'err.plate': 'Matrícula inválida.',
      'err.chassis': 'Indique o número de chassis.', 'err.chassisFmt': 'Use 6 a 20 letras ou números (ex.: NCP10-1234567 ou 17 caracteres).',
      'err.slot': 'Escolha o dia e o horário.', 'err.slotTime': 'Escolha um horário.', 'err.first': 'Indique o nome.', 'err.last': 'Indique o apelido.',
      'err.phone': 'Número moçambicano com 9 dígitos (ex.: 84 123 4567).', 'err.email': 'Email inválido.', 'err.consent': 'Necessário para podermos contactá-lo.',
      'err.send': 'Não foi possível enviar o pedido. Verifique a ligação à internet e tente novamente, ou contacte-nos por WhatsApp.',
      'err.rate': 'Já recebemos um pedido deste número há instantes. Aguarde um minuto antes de enviar outro.',
    },
    en: {
      'meta.title': 'Blackline Performance — Automotive Service Excellence',
      'nav.aria': 'Main', 'nav.about': 'About', 'nav.services': 'Services', 'nav.process': 'How it works', 'nav.why': 'Why us', 'nav.contact': 'Contact',
      'nav.open': 'Open menu', 'nav.close': 'Close menu',
      'cta.book': 'Book a service', 'cta.bookService': 'Book a service', 'cta.online': 'Book online',
      'cta.title': 'Book your service today!', 'cta.lead': 'Book online in a few steps or talk to the workshop directly.',
      'hero.l1': '<em>Excellence</em> in', 'hero.l2': 'Automotive', 'hero.l3': 'Services',
      'hero.lead': 'Mechanical, electrical, panel beating, detailing and performance — all in one place, with the care your vehicle deserves.',
      'hero.follow': 'Follow us', 'hero.bar1': 'Professional, personal service.', 'hero.bar2': 'Book your service today!',
      'ph.status': 'Vehicle status', 'ph.s1': 'Vehicle received', 'ph.s2': 'Diagnostics', 'ph.s2d': '09:02 · Computer scan', 'ph.s3': 'In repair', 'ph.s3d': 'Brake pads and discs',
      'ph.s4': 'Wash', 'ph.s4d': 'Expected 15:30', 'ph.s5': 'Ready for collection', 'ph.s5d': 'Expected 17:30', 'ph.eta': 'Estimated delivery',
      'ph.book': 'Book a service', 'ph.car': 'Your vehicle', 'ph.service': 'Service', 'ph.c1': 'Service', 'ph.c2': 'Brakes', 'ph.c3': 'Wash', 'ph.date': 'Date',
      'ph.d1': 'Mon', 'ph.d2': 'Tue', 'ph.d3': 'Wed', 'ph.d4': 'Thu', 'ph.confirm': 'Confirm booking',
      'app.title': 'Track your vehicle', 'app.lead': 'Book online and follow every step — check-in, diagnostics, repair, wash and handover. Quotes and photos of the work arrive on WhatsApp.',
      'app.f1t': 'Quote', 'app.f1': 'Approved by you before any work starts.', 'app.f2t': 'Record', 'app.f2': 'Before and after photos of every job.', 'app.f3t': 'Maintenance', 'app.f3': 'Reminder for your next service, by date or mileage.',
      'svc.title': 'Services', 'svc.lead': 'Maintenance, repairs, detailing and performance for every make, in one workshop.',
      'f.all': 'All', 'f.mec': 'Mechanical', 'f.ele': 'Electrical', 'f.pin': 'Panel beating and paint', 'f.pin2': 'Panel beating', 'f.det': 'Detailing', 'f.lav': 'Wash', 'f.tun': 'Tuning',
      'show.aria': 'Vehicles in the workshop', 'show.kicker': 'In the workshop this week', 'show.prev': 'Previous', 'show.next': 'Next', 'show.cta': 'Book for my vehicle',
      'g.book': 'Book',
      'g1.t': 'ECU remap and sport exhaust', 'g1.d': 'More power and throttle response',
      'g2.t': 'Ceramic coating 9H', 'g2.d': 'Paint protection for up to 3 years',
      'g3.t': 'Paint correction', 'g3.d': '3-stage machine polish',
      'g4.t': 'Full service', 'g4.d': 'Oil, filters and brakes',
      'g5.t': 'Premium wash', 'g5.d': 'Interior and exterior',
      'g6.t': 'Electronic diagnostics', 'g6.d': 'Fault codes and wiring',
      'g7.t': 'Suspension and wheels', 'g7.d': 'Lowering and alignment',
      'g8.t': 'Oil change', 'g8.d': 'Oil and filter in 45 minutes',
      'g9.t': 'Panel repair', 'g9.d': 'Factory finish',
      'g10.t': 'Smash & Grab', 'g10.d': 'Security film on the windows',
      'g11.t': 'Polish and glass', 'g11.d': 'Mirror gloss and treated glass',
      'f.pin3': 'Paint', 'f.sg': 'Smash & Grab',
      'why.title': 'Why Blackline', 'why.lead': 'A workshop with a method: diagnose before repairing, quote before proceeding, and hand the car back clean and tested.',
      'why.1t': 'Computer diagnostics', 'why.1': 'Multi-brand diagnostic equipment. We know what to fix before we touch it.',
      'why.2t': 'Fixed quote', 'why.2': 'Price approved by you before any work. No surprise extras on the invoice.',
      'why.3t': 'Certified parts', 'why.3': 'Genuine or quality equivalent parts, always invoiced and referenced.',
      'why.4t': '6-month warranty', 'why.4': 'Labour warranty on all mechanical and electrical work.',
      'info.hours': 'Opening hours', 'info.brands': 'Makes', 'info.brandsV': 'All makes<br>cars and SUVs', 'info.contact': 'Contact', 'info.pay': 'Payment',
      'proc.title': 'How it works', 'proc.lead': 'From booking to handover, you always know where your vehicle is.',
      'proc.1t': 'Booking', 'proc.1': 'Choose the service, day and time — online, on WhatsApp or by phone.',
      'proc.2t': 'Diagnostics', 'proc.2': 'Computer inspection and a quote sent for your approval.',
      'proc.3t': 'Repair', 'proc.3': 'Specialist technicians, quality parts and progress photos.',
      'proc.4t': 'Handover', 'proc.4': 'Washed, tested and ready — with a 6-month warranty.',
      'foot.about': 'Automotive service excellence. Professional, personal service.', 'foot.nav': 'Navigation',
      'foot.s1': 'General mechanics', 'foot.s2': 'Auto electrical', 'foot.s4': 'Detailing and ceramic', 'foot.news': 'News', 'foot.newsLead': 'Offers and maintenance reminders. No spam.',
      'promo.title': 'Offers', 'promo.lead': 'Special conditions for a limited time. The discount is applied automatically when you book online.',
      'promo.until': 'Valid until {d}', 'promo.from': 'From {a} to {b}', 'promo.cta': 'Book with discount', 'promo.all': 'All priced services', 'promo.tag': 'Offer', 'promo.price': 'Special price',
      'foot.email': 'Your email', 'foot.thanks': 'Thank you!', 'foot.terms': 'Terms', 'foot.privacy': 'Privacy',

      'bk.name': 'Service booking', 'bk.t1': 'Services', 'bk.t2': 'Vehicle', 'bk.t3': 'Date and time', 'bk.t4': 'Contact', 'bk.t5': 'Review', 'bk.close': 'Close',
      'bk.step': 'Step {n} of 5', 'bk.done': 'Done',
      'bk.h0': 'Which services do you need?', 'bk.d0': 'Select one or more services. Prices are indicative; the final price is confirmed after inspecting the vehicle.',
      'bk.h1': 'Vehicle details', 'bk.d1': 'Helps us prepare the right parts and workshop time.',
      'bk.h2': 'Date and time', 'bk.d2': 'Pick a day on the calendar, then a time.',
      'bk.h3': 'Your contact details', 'bk.d3': 'We only use these details to confirm and follow up on your booking.',
      'bk.h4': 'Review your request', 'bk.d4': 'Check the details. You can change any section before sending.',
      'bk.h5': 'Booking request received', 'bk.d5': '',
      'bk.brand': 'Make', 'bk.model': 'Model', 'bk.modelPh': 'e.g. Vitz 1.0, Demio, Hilux 2.8', 'bk.year': 'Year', 'bk.km': 'Mileage', 'bk.fuel': 'Fuel',
      'bk.fuelG': 'Petrol', 'bk.fuelD': 'Diesel', 'bk.fuelH': 'Hybrid', 'bk.fuelE': 'Electric', 'bk.plate': 'Number plate',
      'bk.chassis': 'Chassis number (VIN)', 'bk.chassisHint': 'Found in the registration papers and on the plate on the door pillar or windscreen. We use it to confirm the right parts.',
      'bk.select': 'Select', 'bk.other': 'Other',
      'bk.drop': 'Vehicle drop-off', 'bk.drop1': 'I will bring the vehicle to the workshop', 'bk.drop1d': 'No extra cost', 'bk.drop2': 'Collection and delivery at my address', 'bk.drop2d': '+{fee} · within the city',
      'bk.first': 'First name', 'bk.last': 'Surname', 'bk.phone': 'Mobile', 'bk.email': 'Email', 'bk.optional': '(optional)', 'bk.pref': 'How should we contact you?', 'bk.prefCall': 'Phone call',
      'bk.notes': 'Other details', 'bk.notesPh': 'e.g. noise from the front wheel when braking; scratch on the rear left door.',
      'bk.aboutT': 'About the request', 'bk.aboutD': 'Helps us prepare the car and parts before you arrive. All optional.',
      'bk.goal': 'What do you need?', 'bk.goal1': 'Scheduled maintenance', 'bk.goal2': 'Fix a problem', 'bk.goal3': 'Looks / detailing', 'bk.goal4': 'More performance', 'bk.goal5': 'Inspection / quote',
      'bk.symptoms': 'What have you noticed?', 'bk.sy1': 'Noise', 'bk.sy2': 'Vibration', 'bk.sy3': 'Warning light on dash', 'bk.sy4': 'Fluid leak', 'bk.sy5': 'Loss of power', 'bk.sy6': 'Hard to start', 'bk.sy7': 'Overheating', 'bk.sy8': 'Weak brakes', 'bk.sy9': 'Weak air conditioning', 'bk.sy10': 'Scratches / dents',
      'bk.sel': '—', 'bk.since': 'Since when?', 'bk.since1': 'Today', 'bk.since2': 'This week', 'bk.since3': 'This month', 'bk.since4': 'Longer',
      'bk.drive': 'Is the car driveable?', 'bk.drive1': 'Yes, normally', 'bk.drive2': 'Yes, with difficulty', 'bk.drive3': 'No — needs towing',
      'bk.urgency': 'Urgency', 'bk.urg1': 'Normal', 'bk.urg2': 'Urgent — I need the car back quickly',
      'bk.parts': 'Parts', 'bk.parts1': 'The workshop supplies the parts', 'bk.parts2': 'I will bring my own parts', 'bk.parts3': 'Decide after the quote',
      'bk.optsSingle': 'Choose one option', 'bk.optsMulti': 'Choose the parts you want', 'bk.optsAll': 'Select all', 'bk.optsNone': 'Clear', 'bk.svcNote': 'Details for this service (optional)', 'bk.svcNotePh': 'e.g. driver window only; scratch on the rear door',
      'err.opts': 'Choose at least one option for {s}.', 'bk.rvDetails': 'Request',
      'bk.consent': 'I agree to be contacted by Blackline Performance about this booking.',
      'bk.order': 'Your request', 'bk.total': 'Estimated total', 'bk.back': 'Back', 'bk.next': 'Continue', 'bk.send': 'Send request', 'bk.sending': 'Sending…', 'bk.finish': 'Finish',
      'bk.noteVat': 'Indicative prices, VAT included.', 'bk.noteQuote': 'Includes services priced on inspection — final price after assessment.',
      'bk.quote': 'On quote', 'bk.from': 'from', 'bk.pickup': 'Collection and delivery',
      'bk.dow': 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', 'bk.morning': 'Morning', 'bk.afternoon': 'Afternoon', 'bk.pickDay': 'Select a day on the calendar to see available times.', 'bk.unavailable': 'unavailable',
      'bk.edit': 'Edit', 'bk.rvMakeModel': 'Make and model', 'bk.rvDate': 'Date', 'bk.rvTime': 'Time', 'bk.rvDrop': 'Drop-off', 'bk.rvDropShop': 'At the workshop', 'bk.rvDropHome': 'Collection and delivery',
      'bk.rvName': 'Name', 'bk.rvPref': 'Preference',
      'bk.ref': 'Reference', 'bk.sent': 'We have received your request for <b>{car}</b> on <b>{when}</b>. The booking is confirmed once the workshop contacts you by {pref}.',
      'bk.atShop': 'at the workshop', 'bk.atHome': 'collection at your address',
      'bk.n1': 'Confirmation', 'bk.n1d': 'The workshop confirms the time using your preferred contact method, during business hours.', 'bk.n2': 'Check-in', 'bk.n3': 'Quote', 'bk.n3d': 'You receive the quote for approval before any work starts.',
      'bk.ics': 'Add to calendar', 'bk.question': 'I have a question',
      'bk.pref.whatsapp': 'WhatsApp', 'bk.pref.chamada': 'phone', 'bk.pref.email': 'email',
      'err.services': 'Select at least one service.', 'err.brand': 'Enter the make.', 'err.model': 'Enter the model.', 'err.plate': 'Invalid number plate.',
      'err.chassis': 'Enter the chassis number.', 'err.chassisFmt': 'Use 6 to 20 letters or numbers (e.g. NCP10-1234567 or a 17-character VIN).',
      'err.slot': 'Choose a day and time.', 'err.slotTime': 'Choose a time.', 'err.first': 'Enter your first name.', 'err.last': 'Enter your surname.',
      'err.phone': 'Mozambican mobile number with 9 digits (e.g. 84 123 4567).', 'err.email': 'Invalid email.', 'err.consent': 'Required so we can contact you.',
      'err.send': 'We could not send your request. Check your connection and try again, or contact us on WhatsApp.',
      'err.rate': 'We received a request from this number a moment ago. Please wait a minute before sending another.',
    },
  };

  const KEY = 'blp:lang';
  const pick = () => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'pt') return q;
    try { const s = localStorage.getItem(KEY); if (s === 'en' || s === 'pt') return s; } catch (e) { /* */ }
    return 'pt';
  };

  const I18n = {
    lang: pick(),
    locale() { return this.lang === 'en' ? 'en-GB' : 'pt-PT'; },
    t(key, vars) {
      let s = (DICT[this.lang] && DICT[this.lang][key]) ?? DICT.pt[key] ?? key;
      if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
      return s;
    },
    pt(key) { return DICT.pt[key] ?? key; },
    // texto bilingue vindo das definições: {pt, en} ou string
    pick(v) { return v && typeof v === 'object' ? (v[this.lang] || v.pt || '') : (v || ''); },
    apply(root = document) {
      root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.dataset.i18n); });
      root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = this.t(el.dataset.i18nHtml); });
      root.querySelectorAll('[data-i18n-alt]').forEach(el => { el.alt = this.t(el.dataset.i18nAlt); });
      root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = this.t(el.dataset.i18nPh); });
      root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', this.t(el.dataset.i18nAria)); });
      document.documentElement.lang = this.lang;
      document.title = this.t('meta.title');
      document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === this.lang));
    },
    set(lang) {
      if (lang === this.lang) return;
      this.lang = lang;
      try { localStorage.setItem(KEY, lang); } catch (e) { /* */ }
      this.apply();
      document.dispatchEvent(new CustomEvent('lang:change', { detail: lang }));
    },
  };

  window.BLi18n = I18n;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) I18n.set(b.dataset.lang);
  });
  if (I18n.lang !== 'pt') I18n.apply();
  else document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === 'pt'));
})();
