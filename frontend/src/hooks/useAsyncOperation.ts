import { useCallback, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const controllerRef = useRef<AbortController>();

  const execute = useCallback(async (...args: any[]) => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await asyncFunction(...args, controllerRef.current.signal);
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ data: null, loading: false, error: null });
  }, []);

  return { state, execute, reset };
}