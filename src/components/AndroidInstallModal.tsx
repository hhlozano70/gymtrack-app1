import React, { useState } from 'react';
import { Smartphone, Download, Check, Copy, ExternalLink, X, Sparkles, Terminal, Layers, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npm run build
npx cap sync
npx cap open android`;

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(capacitorCommands);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                Convertir a App de Android
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isAndroid ? 'Android Detectado' : 'WebAPK & APK'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instala Alfa &amp; Omega Gym en tu dispositivo Android o genera un paquete APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pwa'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Instalación Directa (PWA / WebAPK)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'apk'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Generar Archivo APK (.apk)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {activeTab === 'pwa' ? (
            <div className="space-y-5">
              {/* Status Banner */}
              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">¡App ya instalada!</h4>
                    <p className="text-xs text-slate-300">
                      Estás ejecutando Alfa &amp; Omega Gym en modo aplicación nativa independiente.
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Instalador nativo listo</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Tu navegador soporta instalación directa a la pantalla de inicio con un solo toque.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Instalando...' : 'Instalar en este Android'}</span>
                  </button>
                </div>
              ) : null}

              {/* Step-by-Step for Android Phone */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Pasos para instalar en cualquier teléfono Android
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="inline-block w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs text-center leading-6 border border-emerald-500/30">
                        1
                      </span>
                      <h4 className="text-xs font-bold text-white">Abre en Chrome</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Abre esta dirección web desde el navegador Google Chrome en tu smartphone Android.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="inline-block w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs text-center leading-6 border border-emerald-500/30">
                        2
                      </span>
                      <h4 className="text-xs font-bold text-white">Menú de opciones</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Pulsa el icono de los <span className="text-emerald-400 font-bold">tres puntos (⋮)</span> en la esquina superior derecha del navegador.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="inline-block w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs text-center leading-6 border border-emerald-500/30">
                        3
                      </span>
                      <h4 className="text-xs font-bold text-white">Instalar aplicación</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Toca en <span className="text-emerald-400 font-semibold">"Instalar aplicación"</span> o <span className="text-emerald-400 font-semibold">"Añadir a pantalla de inicio"</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What advantages does it have? */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Ventajas en Android:
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Se abre a pantalla completa con icono propio en tu escritorio y cajón de apps.</li>
                  <li>Almacena tus rutinas, pesos y tiempos localmente en tu teléfono.</li>
                  <li>No requiere cuenta de Google Play para instalar ni ocupar espacio excesivo.</li>
                </ul>
              </div>

              {/* Copy URL Section */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <div className="truncate text-xs font-mono text-slate-400 select-all">
                  {currentUrl}
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? '¡Copiado!' : 'Copiar enlace'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Empaquetar a binario nativo Android (.APK / Google Play)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El proyecto ya incluye el archivo de configuración <code className="text-emerald-400 font-mono">capacitor.config.json</code> con el ID <code className="text-slate-300 font-mono">com.gymtrackpro.app</code>. Puedes generar el APK en tu computadora con estos pasos:
                </p>
              </div>

              {/* Command box */}
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-500 font-sans">
                  <span>Terminal (bash / powershell)</span>
                  <button
                    onClick={handleCopyCmd}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? 'Copiado' : 'Copiar comandos'}</span>
                  </button>
                </div>
                <pre className="whitespace-pre">{capacitorCommands}</pre>
              </div>

              {/* Alternative tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    PWABuilder (Online y Gratis)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ingresa en <span className="text-emerald-400">pwabuilder.com</span>, pega la URL de esta app y descarga directamente el paquete APK firmado para Android listo para instalar o subir a la Play Store.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    Bubblewrap CLI (Google TWA)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    La herramienta oficial de Google para crear Trusted Web Activities de Android directamente desde el manifiesto PWA que ya hemos configurado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Iconos adaptativos (192px, 512px y maskable) configurados.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
