import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
            <div className="flex justify-center">
              <AlfaOmegaLogo size="lg" variant="compact" />
            </div>

            <div className="w-16 h-16 bg-red-600/20 border border-red-500/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black font-['Space_Grotesk'] text-white">
                Algo no cargó correctamente
              </h1>
              <p className="text-xs text-slate-300">
                La aplicación detectó una inconsistencia o actualización pendiente en el navegador. Puedes recargar o restablecer la memoria caché para continuar.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left overflow-auto max-h-32 text-[11px] font-mono text-red-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recargar Aplicación</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Limpiar Caché y Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
