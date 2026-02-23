import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UseCrudOptions {
  endpoint: string;
  queryParams?: Record<string, any>;
  autoFetch?: boolean;
}

export function useCrud<T = any>({ endpoint, queryParams = {}, autoFetch = true }: UseCrudOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchData = useCallback(async (p?: number) => {
    setLoading(true);
    try {
      const res = await api.get(endpoint, {
        params: { page: p || page, limit, search: search || undefined, ...queryParams },
      });
      const result = res.data;
      if (Array.isArray(result)) {
        setData(result);
        setTotal(result.length);
      } else if (result.data) {
        setData(result.data);
        setTotal(result.total || result.meta?.total || result.data.length);
      } else if (result.items) {
        setData(result.items);
        setTotal(result.total || result.items.length);
      } else {
        setData(Array.isArray(result) ? result : []);
        setTotal(0);
      }
    } catch {
      // error already handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search, JSON.stringify(queryParams)]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch]);

  const create = async (body: any) => {
    const res = await api.post(endpoint, body);
    toast.success("Muvaffaqiyatli yaratildi");
    fetchData();
    return res.data;
  };

  const update = async (id: string | number, body: any) => {
    const res = await api.patch(`${endpoint}/${id}`, body);
    toast.success("Muvaffaqiyatli yangilandi");
    fetchData();
    return res.data;
  };

  const remove = async (id: string | number) => {
    await api.delete(`${endpoint}/${id}`);
    toast.success("Muvaffaqiyatli o'chirildi");
    fetchData();
  };

  const changePage = (p: number) => {
    setPage(p);
    fetchData(p);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data, loading, total, page, totalPages, search,
    setSearch, setPage: changePage, refetch: fetchData,
    create, update, remove,
  };
}
