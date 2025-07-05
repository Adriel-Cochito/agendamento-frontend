export function maskCNPJ(value: string): string {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a máscara do CNPJ: 00.000.000/0000-00
  const masked = cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
  
  // Limita a 18 caracteres (14 números + 4 caracteres de formatação)
  return masked.substring(0, 18);
}

export function maskPhone(value: string): string {
  // Remove tudo que não é número, espaço ou +
  const cleaned = value.replace(/[^\d\s+]/g, '');
  
  // Se não começar com +, adiciona +55
  let masked = cleaned;
  if (!masked.startsWith('+')) {
    masked = '+55 ' + masked.replace(/\+/g, '');
  }
  
  // Aplica a máscara: +55 31 99999-8888
  masked = masked
    .replace(/^(\+\d{2})\s*(\d)/, '$1 $2')
    .replace(/^(\+\d{2}\s\d{2})\s*(\d)/, '$1 $2')
    .replace(/^(\+\d{2}\s\d{2}\s\d{5})(\d)/, '$1-$2');
  
  // Limita o tamanho
  return masked.substring(0, 17);
}

export function unmaskCNPJ(value: string): string {
  return value.replace(/\D/g, '');
}

export function unmaskPhone(value: string): string {
  return value;
}