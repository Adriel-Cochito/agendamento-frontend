import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Calendar, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useDisponibilidadesByProfissional } from '@/hooks/useDisponibilidades';
import { useAgendamentosByData } from '@/hooks/useAgendamentos';
import { HorarioDisponivel } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { calcularHorariosDisponiveisPorProfissional, criarDataHora } from '@/utils/horariosDisponiveis';

interface HorarioSelectorProps {
 servico: Servico;
 profissionais: Profissional[]; // Array de profissionais em vez de um só
 data: string;
 onHorarioSelect: (dataHora: string, profissionalId: number) => void;
}

interface HorarioComProfissionais {
 hora: string;
 profissionaisDisponiveis: Array<{
   profissional: Profissional;
   disponivel: boolean;
   motivo?: string;
 }>;
}

export function HorarioSelector({
 servico,
 profissionais,
 data,
 onHorarioSelect
}: HorarioSelectorProps) {
 const [horariosComProfissionais, setHorariosComProfissionais] = useState<HorarioComProfissionais[]>([]);
 const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
 
 // Buscar disponibilidades e agendamentos para cada profissional
 const disponibilidadeQueries = profissionais.map(prof => 
   useDisponibilidadesByProfissional(prof.id, data)
 );
 
 const agendamentoQueries = profissionais.map(prof => 
   useAgendamentosByData({
     servicoId: servico.id,
     profissionalId: prof.id,
     data
   })
 );

 useEffect(() => {
   // Verificar se todas as queries carregaram
   const allLoaded = disponibilidadeQueries.every(q => !q.isLoading) && 
                    agendamentoQueries.every(q => !q.isLoading);
   
   if (!allLoaded) return;

   // Calcular horários disponíveis para cada profissional
   const horariosPorProfissional = profissionais.map((prof, index) => {
     const disponibilidades = disponibilidadeQueries[index].data || [];
     const agendamentos = agendamentoQueries[index].data || [];
     
     return {
       profissional: prof,
       horarios: calcularHorariosDisponiveisPorProfissional(
         disponibilidades,
         agendamentos,
         data,
         servico.duracao
       )
     };
   });

   // Criar conjunto único de horários
   const todosHorarios = new Set<string>();
   horariosPorProfissional.forEach(({ horarios }) => {
     horarios.forEach(h => todosHorarios.add(h.hora));
   });

   // Ordenar horários
   const horariosOrdenados = Array.from(todosHorarios).sort();

   // Mapear cada horário com os profissionais disponíveis
   const horariosFinais: HorarioComProfissionais[] = horariosOrdenados.map(hora => {
     const profissionaisDisponiveis = profissionais.map(prof => {
       const dadosProfissional = horariosPorProfissional.find(p => p.profissional.id === prof.id);
       const horarioInfo = dadosProfissional?.horarios.find(h => h.hora === hora);
       
       return {
         profissional: prof,
         disponivel: horarioInfo?.disponivel || false,
         motivo: horarioInfo?.motivo
       };
     });

     return {
       hora,
       profissionaisDisponiveis
     };
   });

   // Filtrar apenas horários que tenham pelo menos um profissional disponível
   const horariosComDisponibilidade = horariosFinais.filter(h => 
     h.profissionaisDisponiveis.some(p => p.disponivel)
   );

   setHorariosComProfissionais(horariosComDisponibilidade);
 }, [disponibilidadeQueries, agendamentoQueries, profissionais, data, servico.duracao]);

 const handleHorarioClick = (horario: string) => {
   setSelectedHorario(horario === selectedHorario ? null : horario);
 };

 const handleProfissionalSelect = (horario: string, profissionalId: number) => {
   const dataHora = criarDataHora(data, horario);
   onHorarioSelect(dataHora, profissionalId);
 };

 const isLoading = disponibilidadeQueries.some(q => q.isLoading) || 
                  agendamentoQueries.some(q => q.isLoading);

 if (isLoading) {
   return (
     <div className="flex items-center justify-center p-8">
       <Loading size="md" />
     </div>
   );
 }

 const formatDate = (dateString: string) => {
   return new Intl.DateTimeFormat('pt-BR', {
     weekday: 'long',
     day: '2-digit',
     month: 'long',
     year: 'numeric',
   }).format(new Date(dateString));
 };

 return (
   <div className="space-y-4">
     {/* Header */}
     <div className="border-b pb-4">
       <div className="flex items-center space-x-2 mb-2">
         <Calendar className="w-5 h-5 text-primary-600" />
         <h3 className="text-lg font-semibold text-gray-900">
           Horários Disponíveis
         </h3>
       </div>
       <p className="text-sm text-gray-600">
         {formatDate(data)}
       </p>
       <p className="text-sm text-gray-500">
         Serviço: {servico.titulo} ({servico.duracao} min)
       </p>
       <p className="text-sm text-gray-500">
         {profissionais.length} profissional(is) selecionado(s)
       </p>
     </div>

     {/* Horários */}
     {horariosComProfissionais.length === 0 ? (
       <div className="text-center py-8">
         <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
         <h3 className="text-lg font-medium text-gray-900 mb-2">
           Nenhum horário disponível
         </h3>
         <p className="text-gray-500">
           Não há horários livres para os profissionais selecionados na data escolhida.
           Tente escolher outra data.
         </p>
       </div>
     ) : (
       <>
         <p className="text-sm text-gray-600 mb-4">
           {horariosComProfissionais.length} horário(s) disponível(is). 
           Clique em um horário para ver os profissionais disponíveis:
         </p>
         
         <div className="space-y-3">
           {horariosComProfissionais.map((horarioData) => {
             const profissionaisDisponiveis = horarioData.profissionaisDisponiveis.filter(p => p.disponivel);
             const isSelected = selectedHorario === horarioData.hora;
             
             return (
               <div key={horarioData.hora} className="border border-gray-200 rounded-lg overflow-hidden">
                 {/* Botão do horário */}
                 <button
                   onClick={() => handleHorarioClick(horarioData.hora)}
                   className={`w-full p-4 text-left transition-colors ${
                     isSelected 
                       ? 'bg-primary-50 border-primary-300' 
                       : 'hover:bg-gray-50'
                   }`}
                 >
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <Clock className="w-5 h-5 text-gray-400" />
                       <span className="font-medium text-gray-900">
                         {horarioData.hora}
                       </span>
                       <span className="text-sm text-gray-500">
                         ({profissionaisDisponiveis.length} disponível{profissionaisDisponiveis.length !== 1 ? 'eis' : ''})
                       </span>
                     </div>
                     <div className="flex items-center space-x-2">
                       {profissionaisDisponiveis.slice(0, 3).map(p => (
                         <div
                           key={p.profissional.id}
                           className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-700"
                           title={p.profissional.nome}
                         >
                           {p.profissional.nome.charAt(0).toUpperCase()}
                         </div>
                       ))}
                       {profissionaisDisponiveis.length > 3 && (
                         <span className="text-xs text-gray-500">
                           +{profissionaisDisponiveis.length - 3}
                         </span>
                       )}
                     </div>
                   </div>
                 </button>

                 {/* Lista de profissionais (expandida) */}
                 {isSelected && (
                   <div className="border-t bg-gray-50 p-4">
                     <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                       <Users className="w-4 h-4 mr-2" />
                       Selecione um profissional:
                     </h4>
                     <div className="grid grid-cols-1 gap-2">
                       {profissionaisDisponiveis.map(({ profissional }) => (
                         <Button
                           key={profissional.id}
                           variant="outline"
                           className="justify-start h-auto p-3 hover:bg-primary-50 hover:border-primary-300"
                           onClick={() => handleProfissionalSelect(horarioData.hora, profissional.id)}
                         >
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-medium text-primary-700">
                               {profissional.nome.charAt(0).toUpperCase()}
                             </div>
                             <div className="text-left">
                               <p className="font-medium text-gray-900">{profissional.nome}</p>
                               <p className="text-xs text-gray-500">{profissional.email}</p>
                             </div>
                           </div>
                         </Button>
                       ))}
                     </div>
                     
                     {/* Profissionais indisponíveis */}
                     {horarioData.profissionaisDisponiveis.some(p => !p.disponivel) && (
                       <div className="mt-4 pt-3 border-t">
                         <h5 className="text-xs font-medium text-gray-500 mb-2">
                           Indisponíveis neste horário:
                         </h5>
                         <div className="flex flex-wrap gap-2">
                           {horarioData.profissionaisDisponiveis
                             .filter(p => !p.disponivel)
                             .map(({ profissional, motivo }) => (
                               <span
                                 key={profissional.id}
                                 className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                                 title={`${profissional.nome} - ${motivo || 'Indisponível'}`}
                               >
                                 {profissional.nome}
                               </span>
                             ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             );
           })}
         </div>
       </>
     )}
   </div>
 );
}