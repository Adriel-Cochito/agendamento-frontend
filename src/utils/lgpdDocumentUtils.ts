import { TermoUso, PoliticaPrivacidade } from '@/types/lgpd';

/**
 * Abre um documento LGPD em uma nova aba com formatação responsiva
 */
export const openDocumentInNewTab = (
  documento: TermoUso | PoliticaPrivacidade,
  tipo: 'termo' | 'politica'
) => {
  // Como o conteúdo já é HTML completo, podemos usar diretamente
  const html = documento.conteudo;

  // Abrir em nova janela/aba
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
  } else {
    // Fallback se popup for bloqueado
    alert('Por favor, permita popups para visualizar o documento completo.');
  }
};
