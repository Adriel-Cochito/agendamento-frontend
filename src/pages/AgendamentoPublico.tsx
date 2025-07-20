import React, { useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Tag, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAgendamentoPublico } from '@/hooks/useAgendamentoPublico';
import { formatUtils } from '@/utils/validacoesAgendamentoPublico';

interface AgendamentoPublicoProps {
  empresaId?: string;
}

export default function AgendamentoPublico({ empresaId: propEmpresaId }: AgendamentoPublicoProps) {
  // Determinar empresaId (da URL ou props)
  const empresaId = propEmpresaId || '1'; // Usar '1' como padrão se não fornecido
  
  const {
    // Estado
    etapaAtual,
    loading,
    error,
    sucesso,
    servicos,
    servicoSelecionado,
    profissionalSelecionado,
    dataSelecionada,
    horarioSelecionado,
    horariosDisponiveis,
    dadosCliente,
    podeAvancar,
    
    // Ações
    carregarServicos,
    carregarHorariosDisponiveis,
    selecionarServico,
    selecionarProfissional,
    selecionarData,
    selecionarHorario,
    atualizarDadosCliente,
    voltarEtapa,
    finalizarAgendamento,
    reiniciarAgendamento
  } = useAgendamentoPublico(Number(empresaId));

  // Carregar serviços ao montar
  useEffect(() => {
    if (empresaId) {
      carregarServicos();
    }
  }, [empresaId, carregarServicos]);

  // Carregar horários quando necessário
  useEffect(() => {
    if (etapaAtual === 'horario') {
      carregarHorariosDisponiveis();
    }
  }, [etapaAtual, carregarHorariosDisponiveis]);

  if (!empresaId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600">ID da empresa não fornecido no link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendar Serviço</h1>
          <p className="text-gray-600">Escolha seu serviço e horário preferido</p>
        </div>

        {/* Breadcrumb */}
        {etapaAtual !== 'confirmacao' && (
          <div className="flex items-center justify-center mb-8 space-x-2">
            {['servico', 'profissional', 'data', 'horario', 'dados'].map((etapa, index) => (
              <React.Fragment key={etapa}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  etapaAtual === etapa || ['servico', 'profissional', 'data', 'horario', 'dados'].indexOf(etapaAtual) > index
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                {index < 4 && (
                  <ChevronRight className={`w-4 h-4 ${
                    ['servico', 'profissional', 'data', 'horario', 'dados'].indexOf(etapaAtual) > index 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Etapa 1: Seleção de Serviço */}
          {etapaAtual === 'servico' && !loading && (
            <div
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Escolha o Serviço</h2>
              <div className="space-y-3">
                {servicos.map((servico) => (
                  <button
                    key={servico.id}
                    onClick={() => selecionarServico(servico)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{servico.titulo}</h3>
                        <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {servico.duracao} min
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {servico.profissionais?.length || 0} profissionais
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-blue-600">
                          {formatUtils.formatarPreco(servico.preco)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 2: Seleção de Profissional */}
          {etapaAtual === 'profissional' && servicoSelecionado && (
            <div
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Escolha o Profissional</h2>
                <button
                  onClick={voltarEtapa}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Serviço:</strong> {servicoSelecionado.titulo} - {formatUtils.formatarPreco(servicoSelecionado.preco)}
                </p>
              </div>

              <div className="space-y-3">
                {servicoSelecionado.profissionais?.map((profissional) => (
                  <button
                    key={profissional.id}
                    onClick={() => selecionarProfissional(profissional)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {profissional.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{profissional.nome}</h3>
                        <p className="text-sm text-gray-600">{profissional.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 3: Seleção de Data */}
          {etapaAtual === 'data' && (
            <div
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Escolha a Data</h2>
                <button
                  onClick={voltarEtapa}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Profissional:</strong> {profissionalSelecionado?.nome}
                </p>
              </div>

              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={dataSelecionada}
                onChange={(e) => selecionarData(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Etapa 4: Seleção de Horário */}
          {etapaAtual === 'horario' && (
            <div
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Escolha o Horário</h2>
                <button
                  onClick={voltarEtapa}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Data:</strong> {formatUtils.formatarDataExibicao(dataSelecionada)}
                </p>
              </div>

              {!loading && horariosDisponiveis.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum horário disponível para esta data.</p>
                  <button
                    onClick={() => voltarEtapa()}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Escolher outra data
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {horariosDisponiveis.map((horario) => {
                  const [hours, minutes] = horario.dataHora.includes('T') 
                    ? horario.dataHora.split('T')[1].split(':').slice(0, 2)
                    : ['00', '00'];
                  const horarioFormatado = `${hours}:${minutes}`;
                  
                  return (
                    <button
                      key={horario.dataHora}
                      onClick={() => selecionarHorario(horarioFormatado)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                      <span className="text-sm font-medium">{horarioFormatado}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Etapa 5: Dados do Cliente */}
          {etapaAtual === 'dados' && (
            <div
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Seus Dados</h2>
                <button
                  onClick={voltarEtapa}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              </div>

              {/* Resumo */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-gray-900">Resumo do Agendamento</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Serviço:</strong> {servicoSelecionado?.titulo}</p>
                  <p><strong>Profissional:</strong> {profissionalSelecionado?.nome}</p>
                  <p><strong>Data:</strong> {formatUtils.formatarDataExibicao(dataSelecionada)}</p>
                  <p><strong>Horário:</strong> {horarioSelecionado}</p>
                  <p><strong>Valor:</strong> {formatUtils.formatarPreco(servicoSelecionado?.preco || 0)}</p>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={dadosCliente.nomeCliente}
                    onChange={(e) => atualizarDadosCliente({ nomeCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={dadosCliente.telefoneCliente}
                    onChange={(e) => atualizarDadosCliente({ 
                      telefoneCliente: formatUtils.aplicarMascaraTelefone(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+55 31 99999-8888"
                  />
                </div>

                <button
                  onClick={finalizarAgendamento}
                  disabled={!podeAvancar.dados || loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          )}

          {/* Etapa 6: Confirmação */}
          {etapaAtual === 'confirmacao' && sucesso && (
            <div
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Agendamento Confirmado!
              </h2>
              <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-green-900 mb-2">Detalhes do Agendamento</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Cliente:</strong> {dadosCliente.nomeCliente}</p>
                  <p><strong>Telefone:</strong> {dadosCliente.telefoneCliente}</p>
                  <p><strong>Serviço:</strong> {servicoSelecionado?.titulo}</p>
                  <p><strong>Profissional:</strong> {profissionalSelecionado?.nome}</p>
                  <p><strong>Data:</strong> {formatUtils.formatarDataExibicao(dataSelecionada)}</p>
                  <p><strong>Horário:</strong> {horarioSelecionado}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Seu agendamento foi confirmado! Você receberá mais informações em breve.
              </p>
              <button
                onClick={reiniciarAgendamento}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Fazer Novo Agendamento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}