import { useLocation } from 'react-router-dom';

export const useQueryValue = (paramId: string): string | null => {
  const queryParams = new URLSearchParams(useLocation().search);
  return queryParams.get(paramId);
};
