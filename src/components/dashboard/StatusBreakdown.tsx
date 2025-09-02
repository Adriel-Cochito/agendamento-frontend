// src/components/dashboard/StatusBreakdown.tsx
interface StatusBreakdownProps {
  data: Record<string, number>;
}

const statusColors = {
  AGENDADO: 'bg-blue-500',
  CONFIRMADO: 'bg-green-500',
  REALIZADO: 'bg-gray-500',
  CANCELADO: 'bg-red-500',
};

const statusLabels = {
  AGENDADO: 'Agendados',
  CONFIRMADO: 'Confirmados',
  REALIZADO: 'Realizados',
  CANCELADO: 'Cancelados',
};

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        Nenhum agendamento hoje
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([status, count]) => {
        const percentage = (count / total) * 100;
        const colorClass = statusColors[status as keyof typeof statusColors];
        const label = statusLabels[status as keyof typeof statusLabels];

        return (
          <div key={status} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
            <span className="text-sm text-gray-600 flex-1">{label}</span>
            <span className="text-sm font-medium text-gray-900">{count}</span>
            <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
          </div>
        );
      })}
    </div>
  );
}