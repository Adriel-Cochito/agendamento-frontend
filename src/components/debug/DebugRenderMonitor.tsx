// src/components/debug/DebugRenderMonitor.tsx - Monitor para desenvolvimento
import { useEffect, useRef } from 'react';

interface DebugRenderMonitorProps {
  name: string;
  props?: Record<string, any>;
  enabled?: boolean;
}

export function DebugRenderMonitor({ name, props, enabled = process.env.NODE_ENV === 'development' }: DebugRenderMonitorProps) {
  const renderCount = useRef(0);
  const prevProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    
    const changedProps: string[] = [];
    
    if (props && prevProps.current) {
      Object.keys(props).forEach(key => {
        if (props[key] !== prevProps.current![key]) {
          changedProps.push(key);
        }
      });
    }

    console.log(`🔄 [${name}] Render #${renderCount.current}`, {
      changedProps: changedProps.length > 0 ? changedProps : 'first render or no props',
      props: props || 'no props tracked'
    });

    prevProps.current = props;
  });

  // Este componente não renderiza nada
  return null;
}

// Hook para monitorar mudanças de estado
export function useDebugStateChanges(name: string, state: any, enabled = process.env.NODE_ENV === 'development') {
  const prevState = useRef(state);

  useEffect(() => {
    if (!enabled) return;

    if (JSON.stringify(prevState.current) !== JSON.stringify(state)) {
      console.log(`📊 [${name}] State changed:`, {
        from: prevState.current,
        to: state,
        timestamp: new Date().toISOString()
      });
      prevState.current = state;
    }
  }, [name, state, enabled]);
}

// Hook para monitorar efeitos
export function useDebugEffect(name: string, deps: React.DependencyList, enabled = process.env.NODE_ENV === 'development') {
  const prevDeps = useRef<React.DependencyList>();

  useEffect(() => {
    if (!enabled) return;

    if (prevDeps.current) {
      const changedDeps = deps.map((dep, index) => {
        if (dep !== prevDeps.current![index]) {
          return { index, from: prevDeps.current![index], to: dep };
        }
        return null;
      }).filter(Boolean);

      if (changedDeps.length > 0) {
        console.log(`⚡ [${name}] Effect triggered:`, {
          changedDeps,
          allDeps: deps
        });
      }
    } else {
      console.log(`⚡ [${name}] Effect first run:`, { deps });
    }

    prevDeps.current = deps;
  }, deps);
}

// Wrapper HOC para monitorar componentes
export function withRenderMonitor<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    
    return (
      <>
        <DebugRenderMonitor name={name} props={props as Record<string, any>} />
        <Component {...props} />
      </>
    );
  };

  WrappedComponent.displayName = `withRenderMonitor(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}