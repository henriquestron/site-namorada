"use client";

import React, { useState, useEffect, useRef } from 'react';

// --- COMPONENTE DA CHUVA DE ESTRELAS ---
const Estrelas = () => {
  const [estrelas, setEstrelas] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Cria 50 estrelinhas em posições aleatórias na tela
    const novasEstrelas = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
    setEstrelas(novasEstrelas);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes animarEstrela {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 0.8; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
        }
      `}</style>
      {estrelas.map((estrela) => (
        <div
          key={estrela.id}
          className="absolute bg-blue-100 rounded-full shadow-[0_0_10px_rgba(147,197,253,0.8)]"
          style={{
            left: `${estrela.x}%`,
            top: `${estrela.y}%`,
            width: `${estrela.size}px`,
            height: `${estrela.size}px`,
            animation: `animarEstrela ${estrela.duration}s infinite ease-in-out ${estrela.delay}s`,
          }}
        />
      ))}
    </div>
  );
};


// --- PÁGINA PRINCIPAL ---
export default function NossoSite() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempoJuntos, setTempoJuntos] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 });
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data em que vocês se conheceram: 29 de Junho de 2026
  const dataInicio = new Date(2026, 5, 29).getTime(); 

  useEffect(() => {
    const atualizarCronometro = () => {
      const agora = new Date().getTime();
      const diferenca = agora - dataInicio;

      const segundos = Math.floor((diferenca / 1000) % 60);
      const minutos = Math.floor((diferenca / 1000 / 60) % 60);
      const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      
      const anos = Math.floor(dias / 365);
      const meses = Math.floor((dias % 365) / 30);
      const diasRestantes = (dias % 365) % 30;

      setTempoJuntos({ anos, meses, dias: diasRestantes, horas, minutos, segundos });
    };

    const intervalo = setInterval(atualizarCronometro, 1000);
    return () => clearInterval(intervalo);
  }, [dataInicio]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-zinc-950 to-black text-gray-200 font-sans selection:bg-blue-500 selection:text-white relative">
      
      {/* O componente que chama as estrelas lá no fundo */}
      <Estrelas />
      
      {/* Música Oculta */}
      <audio ref={audioRef} loop src="/musica.mp3" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none"></div>

        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-6 drop-shadow-lg z-10">
          Nossa História 💙
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl z-10 font-light">
          Um pequeno espaço no universo para guardar os nossos melhores momentos.
        </p>
        
        <button 
          onClick={togglePlay}
          className="z-10 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600 hover:border-blue-600 text-blue-100 hover:text-white font-medium py-4 px-8 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center gap-3 backdrop-blur-md"
        >
          <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
          {isPlaying ? 'Pausar nossa música' : 'Dê o play na nossa história'}
        </button>
      </section>

      {/* Contador de Tempo */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-blue-400 mb-8 tracking-wide">O tempo voa com você</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xl md:text-2xl font-medium text-zinc-400">
            <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl min-w-[100px] hover:border-blue-500/40 transition-colors">
              <span className="block text-4xl font-bold text-blue-500 mb-1">{tempoJuntos.anos}</span> Anos
            </div>
            <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl min-w-[100px] hover:border-blue-500/40 transition-colors">
              <span className="block text-4xl font-bold text-blue-500 mb-1">{tempoJuntos.meses}</span> Meses
            </div>
            <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl min-w-[100px] hover:border-blue-500/40 transition-colors">
              <span className="block text-4xl font-bold text-blue-500 mb-1">{tempoJuntos.dias}</span> Dias
            </div>
            <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl min-w-[100px] hover:border-blue-500/40 transition-colors">
              <span className="block text-4xl font-bold text-blue-500 mb-1">{tempoJuntos.horas}</span> Horas
            </div>
          </div>
        </div>
      </section>

      {/* Galeria de Fotos */}
      {/* Galeria de Fotos */}
      <section className="py-20 px-4 relative z-10">
        <h2 className="text-3xl font-semibold text-blue-400 text-center mb-12 tracking-wide">Nossos Momentos</h2>
        
        {/* Adicionei items-start para alinhar os cards no topo caso as fotos tenham tamanhos diferentes */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start">
          
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              {/* Troquei h-64 por h-auto e adicionei object-top caso ainda precise focar na parte de cima */}
              <img src="/foto1.jpg" alt="Momento 1" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Um encontro</p>
          </div>
          
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto2.jpg" alt="Momento 2" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Sempre juntos</p>
          </div>
          
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto3.jpg" alt="Momento 3" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Um momento especial</p>
          </div>

        </div>
      </section>

      {/* Motivos */}
      <section className="py-20 px-4 relative z-10">
        <h2 className="text-3xl font-semibold text-blue-400 text-center mb-12 tracking-wide">
          Por que eu amo você?
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🥰</div>
            <h3 className="text-xl text-zinc-200 font-medium mb-2">Seu Sorriso</h3>
            <p className="text-zinc-400 font-light text-sm">Que ilumina qualquer dia ruim e é a minha visão favorita no mundo.</p>
          </div>
          <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤝</div>
            <h3 className="text-xl text-zinc-200 font-medium mb-2">Nossa Parceria</h3>
            <p className="text-zinc-400 font-light text-sm">O jeito que a gente se entende e se apoia em absolutamente tudo.</p>
          </div>
          <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="text-xl text-zinc-200 font-medium mb-2">Seu olhar</h3>
            <p className="text-zinc-400 font-light text-sm">É incrivel como o seu olhar é tão apaixonante.</p>
          </div>
        </div>
      </section>

      {/* Música do Zezé */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-blue-400 mb-8 tracking-wide">
            A Nossa Trilha Sonora 🎵
          </h2>
          <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:border-blue-500/30 transition-colors">
            <h3 className="text-2xl text-zinc-200 font-medium mb-1">Pra Mudar A Minha Vida</h3>
            <p className="text-blue-500/80 mb-8 font-light">Zezé Di Camargo & Luciano</p>
            <div className="space-y-6 text-zinc-300 italic leading-relaxed font-light text-lg">
              <p>
                Você chegou, me deixou sem saída<br />
                Me fez te querer quando eu não mais queria<br />
                Você me fez amar quando eu dizia não<br />
                E acreditar que no seu coração<br />
                Tinha o grande amor que eu sonhei um dia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Carta de Amor */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-zinc-900/60 border border-blue-500/30 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
          
          <div className="absolute -top-6 -left-2 text-9xl text-blue-500/10 font-serif pointer-events-none">"</div>
          
          <h2 className="text-3xl font-semibold text-blue-400 mb-6 text-center tracking-wide">
            Para a mulher da minha vida
          </h2>
          
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed font-light">
            <p>
              Meu amor, criei este espaço para tentar mostrar pelo menos uma fração do quanto eu te amo. Desde a nossa primeira conversa, eu senti uma conexão tão forte e inexplicável que logo me veio um pensamento: é ela.
            </p>
            <p>
              É com ela que eu quero dividir a minha vida. Quero crescer ao seu lado, construir a nossa história e viajar o mundo com você. 
            </p>
            <p>
              A cada dia que passa, me apaixono ainda mais por você. O quanto combinamos, os nossos gostos, aquele modão raiz que a gente escuta juntos, meu Deus...
            </p>
            <p>
              Sempre vou estar com você. Meu amor por você sempre vai ser imenso, e aumentando cada dia mais.
            </p>
            <p className="font-medium text-blue-300">
              Eu te amo demais, meu amor.
            </p>
          </div>
          
          <div className="mt-10 text-right">
            <p className="text-blue-400 text-xl font-medium">Com todo o meu amor,</p>
            <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold mt-2">
              Vitor
            </p>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="text-center py-10 text-zinc-500 font-medium border-t border-white/5 relative z-10">
        Feito com muito 💙
      </footer>
    </div>
  );
}