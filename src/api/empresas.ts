import { apiClient } from './client';
import { CreateEmpresaWithOwnerRequest } from '@/types/empresa';

export const empresasApi = {
  createWithOwner: async (data: CreateEmpresaWithOwnerRequest): Promise<any> => {
    const response = await apiClient.post('/empresas/com-owner', data);
    return response.data;
  },
};