// Exemplo didático ilustrativo — Conforme Seção 7 do Blueprint da Folha e Princípios Lean / Toyota Production System (TPS)
// Exporta missaoDoc e subcolecoes no formato do Firestore para renderização somente leitura.

export const exemploBolo = {
  missaoDoc: {
    id: 'MS-BOLO',
    codigo: 'MS-BOLO',
    titulo: 'Produzir lote piloto de 10 bolos de cenoura com cobertura',
    gestorUid: 'gestor-exemplo',
    responsavelEmail: 'confeitaria@exemplo.com',
    responsavelNome: 'Clara Silveira (Confeitaria)',
    docsUrl: 'https://docs.google.com/document/d/pop-bolo-cenoura-tps',
    pastaUrl: 'https://drive.google.com/drive/folders/lote-piloto-bolo-cenoura',
    linksEm: '2026-10-14T08:00:00.000Z',
    emitidaEm: '2026-10-14',
    dataEstimada: '2026-10-18',
    versao: 1,
    camposMudaramUltimaVersao: [],
    descricao: {
      necessidade:
        'Validar a padronização do processo produtivo (Standard Work) e os parâmetros de forneamento do bolo de cenoura para a nova linha da cafeteria, garantindo repetibilidade de sabor, textura e rentabilidade sem desperdício de insumos.',
      resultadoEsperado:
        'Lote piloto de 10 unidades de bolo de cenoura com cobertura finalizadas no peso padrão, acompanhadas da planilha de controle e teste sensorial aprovado.',
      tarefa:
        'Executar mise en place 5S, emulsão líquida, incorporação de secos com poka-yoke de peneiramento, forneamento com monitoramento jidoka de temperatura, cobertura temperada e inspeção sensorial cega.',
      entrega:
        '10 unidades embaladas e identificadas com etiqueta de lote e validade na bancada de expedição + planilha de controle do lote e relatório fotográfico de corte do miolo na pasta do Drive.',
      criterios: [
        {
          id: 'cr-bolo-1',
          condicao: 'Todas as 10 unidades apresentam peso líquido de 450 g ± 15 g após cocção, cobertura e resfriamento.',
          verificacao: 'teste',
        },
        {
          id: 'cr-bolo-2',
          condicao: 'Temperatura interna do miolo atinge entre 93 °C e 96 °C ao término do assamento, sem ponto cru ou queimado na crosta.',
          verificacao: 'teste',
        },
        {
          id: 'cr-bolo-3',
          condicao: 'Cobertura de chocolate com brilho homogêneo, espessura entre 2 mm e 4 mm, sem rachaduras ou cristalização.',
          verificacao: 'inspecao',
        },
        {
          id: 'cr-bolo-4',
          condicao: 'Teste sensorial cego com 3 provadores obtém nota de aceitação ≥ 8/10 nos quesitos umidade do miolo e equilíbrio de doçura.',
          verificacao: 'analise',
        },
      ],
      insumos:
        'Farinha de trigo tipo 1, cenoura fresca higienizada, ovos pasteurizados, óleo vegetal, açúcar cristal, fermento químico, chocolate 50% cacau e manteiga sem sal.',
    },
    requisitos: {
      precisa: [
        'Trabalho Padronizado (Standard Work): Pesar todos os ingredientes secos e líquidos em balança digital calibrada antes de ligar o forno (mise en place 100% conferido).',
        'Poka-Yoke (À prova de falhas): Peneirar a farinha de trigo e o fermento químico em malha fina para impedir a formação de grumos na massa.',
        'Jidoka (Autonomação / Parada de linha): Se a temperatura do forno oscilar além de ± 5 °C do padrão (180 °C), interromper o lote imediatamente e acionar manutenção antes do forneamento.',
        '5S e Gestão Visual: Manter a bancada limpa e setorizada durante todo o ciclo produtivo (limpeza imediata de qualquer derramamento).',
        'Rastreabilidade: Registrar o número do lote e data de validade de cada matéria-prima utilizada na planilha de produção.',
      ],
      naoPode: [
        'Não abrir a porta do forno antes de completar 30 minutos de assamento (evita colapso térmico da aeração do miolo).',
        'Não bater a massa após adicionar o fermento (misturar delicadamente à mão por no máximo 45 segundos para não desenvolver glúten em excesso).',
        'Não desenformar os bolos com temperatura da forma superior a 35 °C (previne fissuras estruturais e perda de unidades).',
        'Não estocar sobras de ingredientes abertos sem vedação hermética e etiqueta com data.',
        'Não reaproveitar calda ou aparas que tenham tido contato com superfícies não sanitizadas.',
      ],
      consultarAntes: [],
    },
    fraseGestor: 'Excelente lote piloto. A ficha técnica servirá de padrão para a equipe do turno matutino.',
    concluidaEm: '2026-10-18',
    cancelada: null,
  },
  subcolecoes: {
    alteracoes: [],
    respostas: [],
    planos: [
      {
        id: 'plano-bolo-1',
        em: '2026-10-14',
        versaoMissao: 1,
        etapas: [
          'Mise en place gravimétrico e aferição 5S da praça',
          'Emulsão de cenoura/ovos/óleo e homogeneização dos secos',
          'Porcionamento padrão nas 10 formas e forneamento a 180 °C',
          'Aplicação da cobertura de chocolate temperada e resfriamento',
          'Inspeção de peso, corte do miolo e teste sensorial cego',
        ],
      },
    ],
    estado: {
      vistoVersao: 1,
      primeiroPlanoEm: '2026-10-14',
      fraseResponsavel: 'O controle de temperatura interna no espeto garantiu 100% de uniformidade nos 10 bolos.',
      etapas: [
        {
          id: 'et-b1',
          ordem: 1,
          nome: 'Mise en place gravimétrico e aferição 5S da praça',
          concluidaEm: '2026-10-14',
        },
        {
          id: 'et-b2',
          ordem: 2,
          nome: 'Emulsão de cenoura/ovos/óleo e homogeneização dos secos',
          concluidaEm: '2026-10-15',
        },
        {
          id: 'et-b3',
          ordem: 3,
          nome: 'Porcionamento padrão nas 10 formas e forneamento a 180 °C',
          concluidaEm: '2026-10-16',
        },
        {
          id: 'et-b4',
          ordem: 4,
          nome: 'Aplicação da cobertura de chocolate temperada e resfriamento',
          concluidaEm: '2026-10-17',
        },
        {
          id: 'et-b5',
          ordem: 5,
          nome: 'Inspeção de peso, corte do miolo e teste sensorial cego',
          concluidaEm: '2026-10-18',
        },
      ],
    },
    pendencias: [],
    registros: [
      {
        id: '2026-10-14',
        dia: '2026-10-14',
        atividade: 'Mise en place 5S, calibração da balança e pesagem dos insumos',
        horas: 3,
      },
      {
        id: '2026-10-15',
        dia: '2026-10-15',
        atividade: 'Emulsão líquida e incorporação manual dos secos peneirados',
        horas: 3.5,
      },
      {
        id: '2026-10-16',
        dia: '2026-10-16',
        atividade: 'Cocção monitorada a 180°C, aferição de miolo (94°C) em 10 unidades',
        horas: 4,
      },
      {
        id: '2026-10-17',
        dia: '2026-10-17',
        atividade: 'Temperagem da cobertura, aplicação em 10 bolos e embalagem',
        horas: 3,
      },
      {
        id: '2026-10-18',
        dia: '2026-10-18',
        atividade: 'Inspeção de peso final (451g média), teste sensorial e relatório',
        horas: 2.5,
      },
    ],
    entregas: [
      {
        id: 'ent-bolo-1',
        em: '2026-10-18',
        link: 'https://docs.google.com/spreadsheets/d/lote-piloto-bolo-cenoura-ms-bolo',
        observacoes:
          'Lote de 10 bolos concluído sem perdas (zero refugo). Peso médio aferido: 451,2 g. Cobertura lisa e brilhante.',
        criterios: [
          {
            criterioId: 'cr-bolo-1',
            condicao: 'Todas as 10 unidades apresentam peso líquido de 450 g ± 15 g após cocção, cobertura e resfriamento.',
            atendido: true,
            comprovacao: 'Planilha na pasta: peso variou entre 446 g e 457 g em todas as formas.',
          },
          {
            criterioId: 'cr-bolo-2',
            condicao: 'Temperatura interna do miolo atinge entre 93 °C e 96 °C ao término do assamento, sem ponto cru ou queimado na crosta.',
            atendido: true,
            comprovacao: 'Termômetro espeto registrou média de 94,6 °C no centro térmico de cada unidade.',
          },
          {
            criterioId: 'cr-bolo-3',
            condicao: 'Cobertura de chocolate com brilho homogêneo, espessura entre 2 mm e 4 mm, sem rachaduras ou cristalização.',
            atendido: true,
            comprovacao: 'Espessímetro registrou 2,8 mm na calota e 3,1 mm nas laterais.',
          },
          {
            criterioId: 'cr-bolo-4',
            condicao: 'Teste sensorial cego com 3 provadores obtém nota de aceitação ≥ 8/10 nos quesitos umidade do miolo e equilíbrio de doçura.',
            atendido: true,
            comprovacao: 'Notas médias dos 3 provadores: Umidade 9,3/10; Doçura 8,7/10.',
          },
        ],
      },
    ],
    revisoes: [
      {
        id: 'ent-bolo-1',
        entregaId: 'ent-bolo-1',
        em: '2026-10-18',
        resultado: 'concluida',
        produto: 'atende',
        criterios: [
          { criterioId: 'cr-bolo-1', aceito: true, falta: '' },
          { criterioId: 'cr-bolo-2', aceito: true, falta: '' },
          { criterioId: 'cr-bolo-3', aceito: true, falta: '' },
          { criterioId: 'cr-bolo-4', aceito: true, falta: '' },
        ],
      },
    ],
  },
};

export const exemploCesta = {
  missaoDoc: {
    id: 'MS-000',
    codigo: 'MS-000',
    titulo: 'Montar uma cesta de alimentos de baixo custo e nutritiva para um adulto',
    gestorUid: 'gestor-exemplo',
    responsavelEmail: 'responsavel@exemplo.com',
    responsavelNome: 'Marina Costa',
    docsUrl: 'https://docs.google.com/document/d/exemplo-cesta',
    pastaUrl: 'https://drive.google.com/drive/folders/exemplo-cesta',
    linksEm: '2026-10-18T10:00:00.000Z',
    emitidaEm: '2026-10-14',
    dataEstimada: '2026-10-21',
    versao: 2,
    camposMudaramUltimaVersao: ['precisa'],
    descricao: {
      necessidade:
        'Saber se dá para alimentar bem um adulto com pouco dinheiro, usando o que o mercado do bairro tem nesta época, para orientar a compra da semana.',
      resultadoEsperado:
        'Uma cesta diária com custo e valor nutricional conhecidos, feita só com itens que existem hoje no mercado.',
      tarefa:
        'Levantar os alimentos da época disponíveis em dois mercados do bairro, com preço e valor nutricional, e montar a cesta de um dia.',
      entrega:
        'Uma planilha na pasta, com uma linha por alimento (alimento, porção, calorias, proteína, preço, mercado, data da coleta) e o total do dia.',
      criterios: [
        {
          id: 'cr-1-exemplo',
          condicao: 'A cesta soma pelo menos 2.000 kcal e 50 g de proteína por dia',
          verificacao: 'analise',
        },
        {
          id: 'cr-2-exemplo',
          condicao:
            'O custo da cesta é de no máximo R$ 12 por dia, com preços coletados nos dois mercados na mesma semana',
          verificacao: 'inspecao',
        },
        {
          id: 'cr-3-exemplo',
          condicao: 'Todos os itens estavam à venda nos mercados na data da coleta',
          verificacao: 'inspecao',
        },
      ],
      insumos:
        'A Tabela Brasileira de Composição de Alimentos (TACO), na pasta; os endereços dos dois mercados.',
    },
    requisitos: {
      precisa: [
        'Registrar a fonte e a data de cada preço coletado.',
        'Calcular a média ponderada quando houver mais de uma variedade do mesmo item.',
      ],
      naoPode: [
        'Usar preço de site ou de folheto promocional no lugar do preço coletado no mercado.',
        'Incluir produtos com prazo de validade vencido ou avariados.',
        'Ultrapassar a tolerância calórica estabelecida nos critérios.',
        'Presumir tabelas de composição sem citar a versão oficial da TACO.',
      ],
      consultarAntes: [
        'Incluir alimentos além de frutas, verduras, legumes e ovos.',
        'Substituir um mercado parceiro caso esteja fechado na data da coleta.',
      ],
    },
    fraseGestor: 'Nas próximas, dizer quantos mercados contam.',
    concluidaEm: '2026-10-18',
    cancelada: null,
  },
  subcolecoes: {
    alteracoes: [
      {
        id: 'alt-1',
        versao: 2,
        em: '2026-10-16',
        resumo:
          'Pode incluir ovo. O "consultar antes" passa a ser: incluir alimentos além de frutas, verduras, legumes e ovos.',
        pendenciaId: 'pend-1',
      },
    ],
    respostas: [
      {
        id: 'pend-1',
        pendenciaId: 'pend-1',
        em: '2026-10-16',
        tipo: 'alteracao',
        texto:
          'Pode incluir ovo. O "consultar antes" passa a ser: incluir alimentos além de frutas, verduras, legumes e ovos.',
      },
    ],
    planos: [
      {
        id: 'plano-1',
        em: '2026-10-14',
        versaoMissao: 1,
        etapas: [
          'Itens da época listados',
          'Preços coletados nos dois mercados',
          'Tabela nutricional das frutas',
          'Cesta fechada e conferida',
        ],
      },
      {
        id: 'plano-2',
        em: '2026-10-16',
        versaoMissao: 2,
        etapas: [
          'Itens da época listados',
          'Preços coletados nos dois mercados',
          'Valores nutricionais preenchidos',
          'Cesta fechada e conferida',
        ],
      },
    ],
    estado: {
      vistoVersao: 2,
      primeiroPlanoEm: '2026-10-14',
      fraseResponsavel: 'A folha deveria ter dito se valia um mercado só ou os dois.',
      etapas: [
        { id: 'et-1', ordem: 1, nome: 'Itens da época listados', concluidaEm: '2026-10-14' },
        { id: 'et-2', ordem: 2, nome: 'Preços coletados nos dois mercados', concluidaEm: '2026-10-15' },
        { id: 'et-3', ordem: 3, nome: 'Valores nutricionais preenchidos', concluidaEm: '2026-10-17' },
        { id: 'et-4', ordem: 4, nome: 'Cesta fechada e conferida', concluidaEm: '2026-10-18' },
      ],
    },
    pendencias: [
      {
        id: 'pend-1',
        tipo: 'consulta',
        bloqueio: 'nenhum',
        texto: 'Pretendo incluir ovo, porque só com frutas e verduras a proteína não chega a 50 g.',
        abertaEm: '2026-10-15',
        fechadaEm: '2026-10-16',
      },
    ],
    registros: [
      { id: '2026-10-14', dia: '2026-10-14', atividade: 'Listar itens da época', horas: 3 },
      { id: '2026-10-15', dia: '2026-10-15', atividade: 'Coletar preços mercado A', horas: 4.5 },
      { id: '2026-10-16', dia: '2026-10-16', atividade: 'Coletar preços mercado B', horas: 4 },
      { id: '2026-10-17', dia: '2026-10-17', atividade: 'Preencher tabela nutricional', horas: 5 },
      { id: '2026-10-18', dia: '2026-10-18', atividade: 'Montar cesta e fechar planilha', horas: 3.5 },
    ],
    entregas: [
      {
        id: 'ent-1',
        em: '2026-10-18',
        link: 'https://docs.google.com/spreadsheets/d/exemplo-cesta-ms-000',
        observacoes: 'A pesquisa foi realizada em 2 supermercados do bairro na mesma quarta-feira pela manhã.',
        criterios: [
          {
            criterioId: 'cr-1-exemplo',
            condicao: 'A cesta soma pelo menos 2.000 kcal e 50 g de proteína por dia',
            atendido: true,
            comprovacao: 'Linhas 1 a 12 da planilha',
          },
          {
            criterioId: 'cr-2-exemplo',
            condicao:
              'O custo da cesta é de no máximo R$ 12 por dia, com preços coletados nos dois mercados na mesma semana',
            atendido: true,
            comprovacao: 'Custo final no mercado A: R$ 11,40',
          },
          {
            criterioId: 'cr-3-exemplo',
            condicao: 'Todos os itens estavam à venda nos mercados na data da coleta',
            atendido: true,
            comprovacao: 'Fotos dos encartes/gôndolas na pasta',
          },
        ],
      },
    ],
    revisoes: [
      {
        id: 'ent-1',
        entregaId: 'ent-1',
        em: '2026-10-18',
        resultado: 'concluida',
        produto: 'atende',
        criterios: [
          { criterioId: 'cr-1-exemplo', aceito: true, falta: '' },
          { criterioId: 'cr-2-exemplo', aceito: true, falta: '' },
          { criterioId: 'cr-3-exemplo', aceito: true, falta: '' },
        ],
      },
    ],
  },
};

// O exemplo ativo principal do aplicativo
export let exemploDidatico = exemploBolo;

export function alternarExemplo(tipo) {
  if (tipo === 'cesta') {
    exemploDidatico = exemploCesta;
  } else {
    exemploDidatico = exemploBolo;
  }
  return exemploDidatico;
}
