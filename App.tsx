
import React, { useState, useEffect, useCallback } from 'react';
import { fetchRatings, saveRating, isConfigured } from './services/supabase';
import { getCoachFeedback } from './services/gemini';
import { Rating } from './types';
import { getEmojiForRating, getRatingColor } from './constants';

const App: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [puntuacion, setPuntuacion] = useState(50);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [coachMsg, setCoachMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    if (isConfigured()) {
      setFetching(true);
      try {
        const data = await fetchRatings();
        setRatings(data);
      } catch (err) {
        console.error("Fetch data error caught in UI:", err);
      } finally {
        setFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('Por favor, introduce un nombre.');
      return;
    }
    if (!isConfigured()) {
      setErrorMsg('Configura URL_SUPABASE y KEY_SUPABASE en services/supabase.ts');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      // Parallelize AI feedback and DB saving
      const feedbackPromise = getCoachFeedback(nombre, puntuacion);
      const successPromise = saveRating(nombre, puntuacion);

      const [feedback, success] = await Promise.all([feedbackPromise, successPromise]);

      if (success) {
        setCoachMsg(feedback);
        setNombre('');
        setPuntuacion(50);
        await loadData();
      } else {
        setErrorMsg('Error al guardar. Verifica las credenciales o si la tabla "clasificacion" existe.');
      }
    } catch (err: any) {
      setErrorMsg(`Error inesperado: ${err.message || 'Inténtalo de nuevo.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-sport font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          PRO PERFORMANCE RATER
        </h1>
        <p className="text-slate-400 text-sm md:text-base">Mide tu potencial. Registra tu progreso.</p>
      </header>

      {!isConfigured() && (
        <div className="bg-amber-900/30 border border-amber-600 p-4 rounded-lg mb-6 max-w-xl text-center">
          <p className="text-amber-400 font-semibold mb-2">Supabase no configurado</p>
          <p className="text-xs text-amber-200">
            Abre <code className="bg-black/40 px-1 rounded">services/supabase.ts</code> y añade tus credenciales.
          </p>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-md space-y-8">
        {/* Form Card */}
        <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Atleta / Nombre
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Marc Gasol"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Puntuación
                </label>
                <div className="text-center">
                  <span className={`text-6xl block transform transition-transform duration-200 ${loading ? 'scale-110' : ''}`}>
                    {getEmojiForRating(puntuacion)}
                  </span>
                  <span className={`text-2xl font-sport font-bold ${getRatingColor(puntuacion)}`}>
                    {puntuacion}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={puntuacion}
                onChange={(e) => setPuntuacion(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-sport font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                loading 
                ? 'bg-slate-800 text-slate-500' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              {loading ? (
                <i className="fas fa-circle-notch animate-spin"></i>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  ENVIAR VALORACIÓN
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center gap-2">
              <i className="fas fa-exclamation-circle text-red-500"></i>
              <p className="text-red-400 text-xs">{errorMsg}</p>
            </div>
          )}

          {coachMsg && (
            <div className="mt-6 p-4 bg-cyan-950/20 border-l-4 border-cyan-500 rounded-r-lg animate-fade-in">
              <p className="text-xs font-bold text-cyan-500 uppercase mb-1">Coach Insight:</p>
              <p className="italic text-slate-300">"{coachMsg}"</p>
            </div>
          )}
        </section>

        {/* List Card */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-sport font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <i className="fas fa-list-ul text-cyan-500"></i>
              Clasificación Reciente
            </h2>
            {fetching && <i className="fas fa-spinner animate-spin text-cyan-500"></i>}
          </div>
          
          <div className="space-y-3">
            {ratings.length === 0 && !fetching ? (
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-xl text-center text-slate-600 italic">
                No hay registros. Verifica tu tabla de Supabase o conexión.
              </div>
            ) : (
              ratings.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-900/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                      {getEmojiForRating(item.puntuacion)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{item.nombre}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Hoy'}
                      </p>
                    </div>
                  </div>
                  <div className={`font-sport text-xl font-bold ${getRatingColor(item.puntuacion)}`}>
                    {item.puntuacion}%
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="mt-auto pt-10 pb-4 text-slate-600 text-xs text-center">
        Elite Performance Dashboard &copy; 2024
      </footer>
    </div>
  );
};

export default App;
