export interface ChamadoSuporte {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaSuporte;
  subcategoria: string;
  prioridade: PrioridadeSuporte;
  status: StatusChamado;
  emailUsuario: string;
  nomeUsuario?: string;
  empresaId?: number;
  paginaErro?: string;
  anexos?: string[];
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  respostaSuporte?: string;
  dataResposta?: Date;
  usuarioSuporte?: string;
}

export interface CategoriaSuporte {
  id: string;
  nome: string;
  subcategorias: SubcategoriaSuporte[];
}

export interface SubcategoriaSuporte {
  id: string;
  nome: string;
  descricao?: string;
}

export type PrioridadeSuporte = 'baixa' | 'media' | 'alta' | 'critica';

export type StatusChamado = 'aberto' | 'em_andamento' | 'aguardando_usuario' | 'resolvido' | 'fechado';

export interface FormularioSuporte {
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  prioridade: PrioridadeSuporte;
  nomeUsuario: string;
  emailUsuario: string;
  paginaErro?: string;
  anexos?: File[];
}

export interface FiltrosChamados {
  status?: StatusChamado[];
  prioridade?: PrioridadeSuporte[];
  categoria?: string;
  dataInicio?: Date;
  dataFim?: Date;
  emailUsuario?: string;
}

export const CATEGORIAS_SUPORTE: CategoriaSuporte[] = [
  {
    id: 'erro',
    nome: 'Erro/Bug',
    subcategorias: [
      { id: 'erro_login', nome: 'Erro de Login', descricao: 'Problemas para fazer login na plataforma' },
      { id: 'erro_agendamento', nome: 'Erro em Agendamentos', descricao: 'Problemas ao criar, editar ou cancelar agendamentos' },
      { id: 'erro_calendario', nome: 'Erro no Calendário', descricao: 'Problemas na visualização ou funcionamento do calendário' },
      { id: 'erro_pagamento', nome: 'Erro de Pagamento', descricao: 'Problemas com processamento de pagamentos' },
      { id: 'erro_notificacao', nome: 'Erro de Notificações', descricao: 'Problemas com envio de notificações' },
      { id: 'erro_importacao', nome: 'Erro de Importação', descricao: 'Problemas ao importar dados' },
      { id: 'erro_exportacao', nome: 'Erro de Exportação', descricao: 'Problemas ao exportar dados' },
      { id: 'erro_outros', nome: 'Outros Erros', descricao: 'Outros tipos de erros não listados' }
    ]
  },
  {
    id: 'duvida',
    nome: 'Dúvida/Funcionalidade',
    subcategorias: [
      { id: 'duvida_configuracao', nome: 'Configuração Inicial', descricao: 'Dúvidas sobre configuração da conta' },
      { id: 'duvida_agendamento', nome: 'Como Fazer Agendamentos', descricao: 'Dúvidas sobre processo de agendamento' },
      { id: 'duvida_profissionais', nome: 'Gerenciar Profissionais', descricao: 'Dúvidas sobre gestão de profissionais' },
      { id: 'duvida_servicos', nome: 'Configurar Serviços', descricao: 'Dúvidas sobre configuração de serviços' },
      { id: 'duvida_disponibilidade', nome: 'Definir Disponibilidades', descricao: 'Dúvidas sobre horários disponíveis' },
      { id: 'duvida_relatorios', nome: 'Relatórios e Dashboard', descricao: 'Dúvidas sobre relatórios e métricas' },
      { id: 'duvida_integracao', nome: 'Integrações', descricao: 'Dúvidas sobre integrações com outros sistemas' },
      { id: 'duvida_outros', nome: 'Outras Dúvidas', descricao: 'Outras dúvidas não listadas' }
    ]
  },
  {
    id: 'sugestao',
    nome: 'Sugestão/Melhoria',
    subcategorias: [
      { id: 'sugestao_interface', nome: 'Interface do Usuário', descricao: 'Sugestões para melhorar a interface' },
      { id: 'sugestao_funcionalidade', nome: 'Nova Funcionalidade', descricao: 'Sugestões de novas funcionalidades' },
      { id: 'sugestao_performance', nome: 'Performance', descricao: 'Sugestões para melhorar performance' },
      { id: 'sugestao_mobile', nome: 'Versão Mobile', descricao: 'Sugestões para versão mobile' },
      { id: 'sugestao_integracao', nome: 'Integrações', descricao: 'Sugestões de novas integrações' },
      { id: 'sugestao_outros', nome: 'Outras Sugestões', descricao: 'Outras sugestões não listadas' }
    ]
  },
  {
    id: 'faturamento',
    nome: 'Faturamento/Cobrança',
    subcategorias: [
      { id: 'faturamento_cobranca', nome: 'Problema de Cobrança', descricao: 'Problemas com cobrança ou faturamento' },
      { id: 'faturamento_plano', nome: 'Mudança de Plano', descricao: 'Dúvidas sobre mudança de plano' },
      { id: 'faturamento_cancelamento', nome: 'Cancelamento', descricao: 'Dúvidas sobre cancelamento da conta' },
      { id: 'faturamento_reembolso', nome: 'Reembolso', descricao: 'Solicitação de reembolso' },
      { id: 'faturamento_fatura', nome: 'Emissão de Fatura', descricao: 'Problemas com emissão de fatura' },
      { id: 'faturamento_outros', nome: 'Outros', descricao: 'Outras questões de faturamento' }
    ]
  },
  {
    id: 'seguranca',
    nome: 'Segurança/Privacidade',
    subcategorias: [
      { id: 'seguranca_senha', nome: 'Problema com Senha', descricao: 'Problemas de acesso ou recuperação de senha' },
      { id: 'seguranca_conta', nome: 'Acesso à Conta', descricao: 'Problemas de acesso à conta' },
      { id: 'seguranca_dados', nome: 'Proteção de Dados', descricao: 'Dúvidas sobre proteção de dados pessoais' },
      { id: 'seguranca_lgpd', nome: 'LGPD', descricao: 'Dúvidas sobre LGPD e privacidade' },
      { id: 'seguranca_outros', nome: 'Outros', descricao: 'Outras questões de segurança' }
    ]
  },
  {
    id: 'outros',
    nome: 'Outros',
    subcategorias: [
      { id: 'outros_geral', nome: 'Assunto Geral', descricao: 'Outros assuntos não categorizados' }
    ]
  }
];

export const PAGINAS_ERRO = [
  'Login',
  'Dashboard',
  'Agendamentos',
  'Calendário',
  'Profissionais',
  'Serviços',
  'Disponibilidades',
  'Configurações',
  'Relatórios',
  'Página Pública de Agendamento',
  'Outra página'
];
