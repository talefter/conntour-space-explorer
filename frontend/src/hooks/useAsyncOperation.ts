import { useCallback, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AsyncOperationResult<T> {
  state: AsyncState<T>;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): AsyncOperationResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const controllerRef = useRef<AbortController>();

  const execute = useCallback(async (...args: any[]) => {
    // Cancel previous request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    controllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args, controllerRef.current.signal);
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setState({ data: null, loading: false, error: null });
  }, []);

  return { state, execute, reset };
}