import { useState, useEffect } from 'react';
import { useEngine } from '../context/EngineContext';
import { EngineState } from '../engine/types/timeline';

export function useEngineState(): EngineState {
  const { timelineEngine } = useEngine();
  const [state, setState] = useState<EngineState>(() => timelineEngine.getState());

  useEffect(() => {
    const unsubscribe = timelineEngine.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, [timelineEngine]);

  return state;
}
