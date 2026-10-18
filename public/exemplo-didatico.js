// Exemplo didático ilustrativo — Conforme seção 7 do Blueprint da Folha v1.1
// Exporta missaoDoc e subcolecoes no formato do Firestore para renderização somente leitura.

export const exemploDidatico = {
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
    camposMudaramUltimaVersao: ['consultarAntes'],
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
      { id: '2026-10-14', dia: '2026-10-14', atividade: 'Listar itens da época' },
      { id: '2026-10-15', dia: '2026-10-15', atividade: 'Coletar preços mercado A' },
      { id: '2026-10-16', dia: '2026-10-16', atividade: 'Coletar preços mercado B' },
      { id: '2026-10-17', dia: '2026-10-17', atividade: 'Preencher tabela nutricional' },
      { id: '2026-10-18', dia: '2026-10-18', atividade: 'Montar cesta e fechar planilha' },
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
