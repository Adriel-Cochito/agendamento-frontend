import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface SimpleBarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
}

// Componente customizado para renderizar labels dentro das barras
const CustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  
  // Só mostrar o label se a barra tiver altura suficiente
  if (height < 20) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fontWeight="bold"
      style={{ 
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
      }}
    >
      {value}
    </text>
  );
};

// Função para formatar datas - mostrar apenas dia/mês
const formatDateLabel = (dateString: string) => {
  try {
    // Se for uma data no formato YYYY-MM-DD
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}`;
    }
    // Se já estiver em outro formato, retornar como está
    return dateString;
  } catch {
    return dateString;
  }
};

export function SimpleBarChart({ data, color = '#3b82f6' }: SimpleBarChartProps) {
  // Cores alternadas para melhor visualização
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  // Formatar os dados para mostrar apenas dia/mês nas datas
  const formattedData = data.map(item => ({
    ...item,
    displayName: formatDateLabel(item.name),
    originalName: item.name
  }));

  // Determinar se precisa de scroll horizontal (mais de 6 itens)
  const needsScroll = data.length > 6;
  const chartWidth = needsScroll ? Math.max(data.length * 80, 500) : '100%';
  
  return (
    <div className="w-full h-64">
      <div 
        className={`h-full ${needsScroll ? 'overflow-x-auto' : ''}`}
        style={{ 
          minWidth: '100%',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6'
        }}
      >
        <div style={{ width: chartWidth, height: '100%', minWidth: needsScroll ? 500 : 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <XAxis 
                dataKey="displayName"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: '#6b7280',
                  textAnchor: 'middle'
                }}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: '#6b7280'
                }}
                width={40}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                label={<CustomizedLabel />}
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}