/**
 * European Portuguese (pt-PT) copy for the public website.
 *
 * To add another language (e.g. pt-BR or en), copy this file, translate the
 * values keeping the same shape (`satisfies Dictionary`), and switch the
 * export in src/content/index.ts.
 */
export const ptPT = {
  nav: {
    home: "Início",
    about: "Sobre Nós",
    services: "Serviços",
    team: "Equipa",
    space: "Espaço",
    contact: "Contactos",
    menu: "Menu",
    closeMenu: "Fechar menu",
    skipToContent: "Saltar para o conteúdo",
  },
  cta: {
    book: "Marcar Consulta",
    bookShort: "Marcar",
    whatsapp: "WhatsApp",
    whatsappLong: "Falar pelo WhatsApp",
    whatsappAria: "Falar com a clínica pelo WhatsApp (abre numa nova janela)",
    learnMore: "Saber Mais",
    bookWithProfessional: "Marcar com este profissional",
    knowOurSpace: "Conheça o nosso espaço",
    seeAllServices: "Ver todos os serviços",
    meetTeam: "Conhecer a equipa",
    call: "Ligar",
    sendEmail: "Enviar email",
    openMaps: "Abrir no Google Maps",
  },
  whatsapp: {
    general:
      "Olá! Gostaria de obter informações e marcar uma consulta. Podem ajudar-me?",
    service: "Olá! Gostaria de marcar uma consulta de {service}. Podem ajudar-me?",
    therapist:
      "Olá! Gostaria de saber a disponibilidade para uma consulta com {therapist}. Obrigado/a!",
    booking:
      "Olá! Gostaria de solicitar uma consulta.\n\nServiço: {service}\nProfissional: {therapist}\nData preferida: {date}\nHorário preferido: {time}\n\nPodem confirmar a disponibilidade? Obrigado/a!",
    noPreference: "Sem preferência",
  },
  hero: {
    eyebrow: "Psicologia & Bem-Estar",
    imageAlt: "Copa de um jacarandá em flor, com ramos retorcidos, folhas verdes e flores lilás contra o céu azul",
    statValue: "< 1 min",
    statLabel: "para pedir a sua consulta, sem registo",
  },
  journey: {
    eyebrow: "O seu caminho",
    title: "Um caminho feito ao seu ritmo",
    steps: [
      { title: "Escutar", text: "Começamos por ouvir, sem pressa e sem julgamentos." },
      { title: "Compreender", text: "Procuramos, em conjunto, dar sentido ao que está a viver." },
      { title: "Recomeçar", text: "Construímos estratégias que façam sentido para a sua vida." },
    ],
  },
  highlightsLabel: "O que pode esperar:",
  highlightsLink: "A nossa abordagem",
  highlights: [
    { title: "Escuta sem julgamento", text: "Um espaço seguro, confidencial e sem pressas." },
    { title: "Acompanhamento à medida", text: "Cada processo é pensado para a sua pessoa." },
    { title: "Para todas as idades", text: "Crianças, adolescentes, adultos, casais e famílias." },
  ],
  about: {
    eyebrow: "Sobre nós",
    title: "Cuidar da saúde mental com tempo, proximidade e respeito",
    philosophyTitle: "A nossa forma de estar",
    philosophy:
      "Acreditamos numa psicologia próxima, baseada na relação de confiança entre quem acompanha e quem é acompanhado. Sem fórmulas fechadas: cada pessoa tem a sua história e o seu ritmo.",
    pillars: [
      {
        title: "Atenção personalizada",
        text: "Objetivos definidos consigo e revistos ao longo do caminho.",
      },
      {
        title: "Ambiente acolhedor",
        text: "Salas tranquilas, pensadas para que se sinta à vontade.",
      },
      {
        title: "Confidencialidade",
        text: "O que é partilhado em consulta fica em consulta.",
      },
    ],
  },
  services: {
    eyebrow: "Serviços",
    helpEyebrow: "Como podemos ajudar",
    more: "Saber mais",
    all: "Ver todos os serviços",
    imageAlt: "Mulher idosa de cabelo grisalho a descansar de olhos fechados, recostada numa poltrona coberta com mantas coloridas",
    title: "Acompanhamento para cada fase da vida",
    intro:
      "Escolha o tipo de acompanhamento que procura. Se tiver dúvidas, fale connosco — ajudamos a perceber qual o mais indicado.",
    duration: "Sessões de cerca de {minutes} minutos",
    professionalsTitle: "Profissionais neste serviço",
    othersTitle: "Outros acompanhamentos",
    notSureTitle: "Não sabe por onde começar?",
    notSureText:
      "Envie-nos uma mensagem. Ajudamos a escolher o acompanhamento e o profissional mais adequados.",
  },
  team: {
    eyebrow: "Equipa",
    title: "Pessoas que escutam, antes de tudo",
    intro:
      "Uma equipa multidisciplinar com formação e experiência em diferentes áreas da psicologia.",
    registration: "Cédula profissional",
    expertise: "Áreas de acompanhamento",
    servicesTitle: "Acompanhamentos",
    bioTitle: "Sobre mim",
    backToTeam: "Ver toda a equipa",
    photoPlaceholder: "Fotografia a adicionar",
    profile: "Ver perfil",
    show: "Conhecer",
  },
  space: {
    eyebrow: "O nosso espaço",
    title: "Um lugar pensado para se sentir em casa",
    intro:
      "Luz natural, cores calmas e salas confortáveis. Venha conhecer o espaço onde cuidamos de si.",
    placeholderNote: "Imagem ilustrativa — substituir por fotografia real",
    lightboxPrev: "Imagem anterior",
    lightboxNext: "Imagem seguinte",
    lightboxClose: "Fechar",
    openImage: "Ampliar imagem: {title}",
  },
  howItWorks: {
    eyebrow: "Como funciona",
    title: "Marcar a primeira consulta é simples",
    intro: "Sem registos, sem formulários longos. Leva menos de um minuto.",
    steps: [
      {
        title: "Escolha o acompanhamento",
        text: "Selecione o serviço e, se quiser, o profissional com quem prefere falar.",
      },
      {
        title: "Indique a sua disponibilidade",
        text: "Diga-nos o dia e a hora que lhe dão mais jeito.",
      },
      {
        title: "Receba a confirmação da nossa equipa",
        text: "Entramos em contacto consigo para confirmar o horário.",
      },
      {
        title: "Venha à primeira consulta",
        text: "Conversamos sobre o que o traz até nós e definimos juntos o caminho.",
      },
    ],
    imageAlt: "Cadeira de tons quentes junto a uma planta, numa sala calma com luz natural",
  },
  testimonials: {
    eyebrow: "Testemunhos",
    title: "Palavras de quem nos visitou",
    previous: "Anterior",
    next: "Seguinte",
    show: "Ver testemunho",
    sampleNote: "Exemplo: a substituir por um testemunho real",
    /** Layout preview in development only. Never shown in production. */
    samples: [
      { id: "exemplo-a", author: "Exemplo A.", photo: "/images/testimonials/a.jpg", quote: "Texto de exemplo. Aqui ficará um testemunho real, publicado apenas com o consentimento de quem o deu." },
      { id: "exemplo-b", author: "Exemplo B.", photo: "/images/testimonials/b.jpg", quote: "Texto de exemplo. Um testemunho pode ser assinado com iniciais ou um pseudónimo, nunca com o nome completo sem autorização." },
      { id: "exemplo-c", author: "Exemplo C.", photo: "/images/testimonials/c.jpg", quote: "Texto de exemplo. Se não houver testemunhos reais, esta secção não aparece no site." },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    title: "Tem dúvidas? Nós ajudamos.",
    items: [
      {
        q: "Como posso marcar uma consulta?",
        a: "Pode fazer um pedido de marcação aqui no site, em menos de um minuto e sem criar conta: escolhe o serviço, o profissional (opcional) e o dia e hora que prefere. Também pode ligar-nos ou enviar uma mensagem pelo WhatsApp.",
      },
      {
        q: "Posso marcar pelo WhatsApp?",
        a: "Sim. Basta tocar no botão do WhatsApp em qualquer página — a mensagem já vai preenchida. Por favor, não envie informação clínica por mensagem; falaremos sobre isso em consulta.",
      },
      {
        q: "Existem consultas online?",
        a: "Sim, sempre que o acompanhamento o permita. Pode indicar essa preferência quando falarmos consigo para confirmar a marcação.",
      },
      {
        q: "Como funciona a primeira consulta?",
        a: "A primeira consulta é um momento para nos conhecermos: ouvimos o que o traz até nós, esclarecemos dúvidas e definimos, em conjunto, como poderá ser o acompanhamento. Não precisa de preparar nada.",
      },
      {
        q: "Posso escolher o psicólogo?",
        a: "Claro. Pode escolher o profissional ao fazer o pedido ou deixar a opção “Sem preferência” — nesse caso, sugerimos o profissional mais indicado para si.",
      },
      {
        q: "Como posso alterar ou cancelar a marcação?",
        a: "Basta contactar-nos por telefone, email ou WhatsApp, de preferência com pelo menos 24 horas de antecedência, para podermos reagendar com tranquilidade.",
      },
    ],
  },
  crisis: {
    lead: "Se está em crise ou tem pensamentos de suicídio, há quem possa ajudar agora. Ligue",
    line: "1411",
    lineNote: ", a Linha Nacional de Prevenção do Suicídio, gratuita e disponível 24 horas por dia. Em perigo imediato, ligue",
    emergency: "112",
  },
  ctaBand: {
    eyebrow: "Estamos aqui",
    title: "Dar o primeiro passo pode ser simples.",
    text: "Faça o seu pedido de marcação em menos de um minuto ou fale connosco pelo WhatsApp.",
  },
  contact: {
    eyebrow: "Contactos",
    title: "Estamos aqui para si",
    intro: "Escolha a forma de contacto que lhe for mais confortável.",
    address: "Morada",
    hours: "Horário",
    phone: "Telefone",
    email: "Email",
    whatsapp: "WhatsApp",
    closed: "Encerrado",
    mapTitle: "Mapa com a localização da clínica",
    mapConsent:
      "O mapa é fornecido pelo Google e só é carregado com a sua autorização.",
    loadMap: "Mostrar mapa",
  },
  footer: {
    description:
      "Psicologia e bem-estar num espaço acolhedor, seguro e pensado para si.",
    navigation: "Navegação",
    contacts: "Contactos",
    legal: "Informação legal",
    privacy: "Política de Privacidade",
    terms: "Termos e Condições",
    complaints: "Livro de Reclamações",
    rights: "Todos os direitos reservados.",
    emergency:
      "Em situação de emergência ligue 112. Para aconselhamento em saúde, contacte a linha SNS 24 (808 24 24 24).",
  },
  booking: {
    pageTitle: "Marcar consulta",
    pageIntro:
      "Faça o seu pedido em poucos passos. A nossa equipa entra em contacto consigo para confirmar.",
    whatsappAlternative: "Prefere falar diretamente?",
    steps: {
      service: "Serviço",
      professional: "Profissional",
      datetime: "Data e hora",
      details: "Contacto",
    },
    stepOf: "Passo {current} de {total}",
    serviceTitle: "Que tipo de acompanhamento procura?",
    serviceHint: "Se não tiver a certeza, escolha Psicologia Individual — ajudamos depois.",
    professionalTitle: "Tem preferência de profissional?",
    professionalHint: "Opcional. Pode avançar sem escolher.",
    noPreference: "Sem preferência",
    noPreferenceText: "Sugerimos o profissional mais indicado para si.",
    datetimeTitle: "Quando lhe dá mais jeito?",
    requestModeNotice:
      "Indique a sua preferência. Não é ainda uma marcação confirmada — vamos verificar a disponibilidade e confirmar consigo.",
    liveModeNotice: "Os horários apresentados estão disponíveis neste momento.",
    chooseDate: "Escolha um dia",
    chooseTime: "Horário preferido",
    chooseTimeLive: "Horários disponíveis",
    noTimes: "Não há horários disponíveis neste dia. Experimente outro dia.",
    loadingTimes: "A carregar horários…",
    morning: "Manhã",
    afternoon: "Tarde",
    prevMonth: "Mês anterior",
    nextMonth: "Mês seguinte",
    closedDay: "Encerrado",
    detailsTitle: "Como podemos contactá-lo?",
    detailsHint: "Só precisamos do essencial para confirmar a consulta.",
    name: "Nome",
    namePlaceholder: "O seu nome",
    phone: "Telemóvel",
    phonePlaceholder: "912 345 678",
    email: "Email",
    emailOptional: "(opcional)",
    emailPlaceholder: "nome@exemplo.pt",
    consent:
      "Aceito que os meus dados de contacto sejam usados apenas para gerir este pedido de marcação, nos termos da",
    consentLink: "Política de Privacidade",
    sensitiveNotice:
      "Não precisa de nos dizer o motivo da consulta. Por favor, não partilhe informação clínica neste formulário.",
    summary: "Resumo do pedido",
    edit: "Alterar",
    back: "Voltar",
    next: "Continuar",
    skip: "Avançar sem escolher",
    submit: "Enviar pedido de marcação",
    submitting: "A enviar…",
    successTitle: "Pedido de marcação recebido!",
    successText: "Entraremos em contacto consigo para confirmar a sua consulta.",
    successReference: "Referência do pedido",
    successNote:
      "O seu pedido ainda não é uma consulta confirmada. Receberá a confirmação da nossa equipa por telefone ou mensagem.",
    successWhatsapp: "Continuar no WhatsApp",
    successHome: "Voltar ao início",
    newRequest: "Fazer outro pedido",
    errorTitle: "Não foi possível enviar o pedido",
    errorGeneric:
      "Ocorreu um problema ao guardar o seu pedido. O seu pedido NÃO foi registado. Tente novamente ou fale connosco pelo WhatsApp.",
    errorRateLimit:
      "Recebemos vários pedidos seguidos a partir deste dispositivo. Aguarde alguns minutos ou fale connosco pelo WhatsApp.",
    errorSlotTaken:
      "Esse horário acabou de ficar indisponível. Por favor escolha outro horário.",
    errorValidation: "Verifique os campos assinalados.",
    errorNetwork:
      "Sem ligação ao servidor. O seu pedido NÃO foi registado. Verifique a ligação ou fale connosco pelo WhatsApp.",
    tryAgain: "Tentar novamente",
    whatsappFallback: "Enviar pedido pelo WhatsApp",
    validation: {
      service: "Escolha um serviço.",
      date: "Escolha um dia.",
      time: "Escolha um horário.",
      name: "Indique o seu nome (pelo menos 2 letras).",
      phone: "Indique um número de telemóvel válido.",
      email: "Indique um email válido ou deixe em branco.",
      consent: "É necessário aceitar para podermos tratar o seu pedido.",
    },
  },
  notFound: {
    title: "Página não encontrada",
    text: "A página que procura não existe ou foi movida.",
    home: "Voltar ao início",
  },
  error: {
    title: "Algo correu mal",
    text: "Pedimos desculpa pelo incómodo. Pode tentar novamente ou contactar-nos pelo WhatsApp.",
    retry: "Tentar novamente",
  },
  weekdays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
  weekdaysShort: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
};

export type Dictionary = typeof ptPT;
