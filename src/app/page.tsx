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

// --- COMPONENTE DO RELÓGIO BUGADO ---
const RelogioBugado = () => {
  const [texto, setTexto] = useState("00:00:00");
  const caracteres = "0123456789§¥£¢∞≠?!@#$%";

  useEffect(() => {
    const intervalo = setInterval(() => {
      // 10% de chance de mostrar a data do pedido (19/09/26) disfarçada de hora
      if (Math.random() > 0.9) {
        setTexto("19:09:26");
      } else {
        let baguncado = "";
        for (let i = 0; i < 6; i++) {
          baguncado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        setTexto(`${baguncado.substring(0,2)}:${baguncado.substring(2,4)}:${baguncado.substring(4,6)}`);
      }
    }, 70); // Velocidade do "bug" (70 milissegundos)

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="font-mono text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
      {texto}
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function NossoSite() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempoJuntos, setTempoJuntos] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [diaDaSurpresaChegou, setDiaDaSurpresaChegou] = useState(false);
  const [abrirSurpresa, setAbrirSurpresa] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data em que vocês se conheceram: 26 de Junho de 2026
  const dataInicio = new Date(2026, 5, 26).getTime(); 

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
  // No useEffect do cronômetro, a gente adiciona a checagem da data!
  useEffect(() => {
    // 20 de Setembro de 2026 (Lembrando que Setembro é o mês 8 no JavaScript)
    const dataSurpresa = new Date(2026, 8, 20).getTime(); 

    const atualizarCronometro = () => {
      const agora = new Date().getTime();
      
      // CHECAGEM DA SURPRESA: Se "agora" for maior ou igual ao dia 20, libera o botão!
      if (agora >= dataSurpresa) {
        setDiaDaSurpresaChegou(true);
      }
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
      <section className="py-20 px-4 relative z-10">
        <h2 className="text-3xl font-semibold text-blue-400 text-center mb-12 tracking-wide">Nossos Momentos</h2>
        
        {/* Container do Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start">
          
          {/* Foto 1 */}
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto1.jpg" alt="Momento 1" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Um encontro</p>
          </div>
          
          {/* Foto 2 */}
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto2.jpg" alt="Momento 2" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Sempre juntos</p>
          </div>
          
          {/* Foto 3 */}
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto3.jpg" alt="Momento 3" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Um momento especial</p>
          </div>

          {/* Foto 4 */}
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto4.jpg" alt="Momento 4" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Nossas aventuras</p>
          </div>

          {/* Foto 5 */}
          <div className="group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-2 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="overflow-hidden rounded-xl flex justify-center bg-black/20">
              <img src="/foto5.jpg" alt="Momento 5" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out" />
            </div>
            <p className="text-center mt-4 mb-2 text-zinc-300 font-medium">Academia juntos</p>
          </div>

        </div>
      </section>

      {/* Motivos */}
      <section className="py-20 px-4 relative z-10">
        <h2 className="text-3xl font-semibold text-blue-400 text-center mb-12 tracking-wide">
          Por que eu amo você?
        </h2>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🥰</div>
            <h3 className="text-xl text-zinc-200 font-medium mb-2">Seu olhar</h3>
            <p className="text-zinc-400 font-light text-sm">
              É incrível como o seu olhar é tão apaixonante... chega a me deixar todo bobinho e me faz esquecer de tudo ao redor.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🧩</div>
            <h3 className="text-xl text-zinc-200 font-medium mb-2">Nossa conexão</h3>
            <p className="text-zinc-400 font-light text-sm">
              A forma como a gente se entende, se apoia e combina em absolutamente tudo, com uma sintonia absurda.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">❤️</div>
            <h3 className="text-xl text-zinc-200 font-medium mb-2">Seu jeitinho</h3>
            <p className="text-zinc-400 font-light text-sm">
              A maneira única como você enxerga a vida e cuida de mim, me fazendo querer ser alguém melhor todos os dias.
            </p>
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
              É incrível como todas as vezes que a gente sai junto, é uma saída melhor que a outra. Se eu pudesse parar o tempo pra não passar tão rápido, ficaríamos por dias juntinhos.
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

      {/* Seção Mistério / Pedido */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-2xl mx-auto bg-zinc-900/60 border border-cyan-500/50 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-[0_0_40px_rgba(34,211,238,0.15)] text-center relative overflow-hidden group">
          
          {/* Luz de fundo pulsante */}
          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>

          <h2 className="text-2xl md:text-3xl font-semibold text-cyan-400 mb-4 tracking-wide flex items-center justify-center gap-3">
            ⚠️ Anomalia Detectada 
          </h2>
          
          <p className="text-zinc-300 text-lg font-light mb-8">
            Nossos radares captaram uma perturbação no espaço-tempo. Uma grande colisão de universos está prevista para acontecer, gerando uma energia nunca antes vista.
          </p>

          {/* O Relógio Bugado */}
          <div className="bg-black/40 py-6 px-4 rounded-xl border border-white/5 inline-block min-w-[250px] mb-8">
            <RelogioBugado />
          </div>
          
          {/* TERMINAL DE COORDENADAS SECRETAS */}
          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-5 font-mono text-left max-w-sm mx-auto relative overflow-hidden shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
            {/* Linha de escaneamento animada no topo */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/50 animate-pulse"></div>
            
            <p className="text-cyan-500/60 text-xs mb-2 uppercase tracking-wider">
              &gt; Rastreando singularidade...
            </p>
            
            <div className="text-cyan-400 text-sm md:text-base animate-pulse space-y-1">
              <p><span className="text-zinc-500">LAT:</span> 15° 55' 26" S</p>
              <p><span className="text-zinc-500">LON:</span> 48° 48' 32" W</p>
            </div>
            
            <p className="text-cyan-500/60 text-xs mt-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Epicentro Gravitacional
            </p>
          </div>

          <p className="text-cyan-500/70 text-sm mt-8 font-mono uppercase tracking-widest animate-pulse">
            Aguardando colisão do sistema...
          </p>
        </div>
        {/* BOTÃO SECRETO (SÓ APARECE DIA 20+) */}
          {diaDaSurpresaChegou && (
            <div className="mt-8 animate-fade-in-up">
              <button 
                onClick={() => setAbrirSurpresa(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] transition-all transform hover:scale-110 flex items-center gap-3 mx-auto"
              >
                <span>🔓</span> Acessar Relatório da Colisão
              </button>
            </div>
          )}
      </section>

      {/* Rodapé */}
      <footer className="text-center py-10 text-zinc-500 font-medium border-t border-white/5 relative z-10">
        Feito com muito 💙
      </footer>

      {/* POP-UP DA SURPRESA (MODAL) */}
      {abrirSurpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-xl w-full bg-zinc-900 border border-cyan-500 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.3)] relative transform transition-all">
            
            {/* Botão de fechar */}
            <button 
              onClick={() => setAbrirSurpresa(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-cyan-400 text-3xl transition-colors"
            >
              &times;
            </button>

            <div className="text-6xl mb-4 animate-bounce">👩‍❤️‍👨</div>
            
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Colisão Concluída!
            </h2>
            
            <p className="text-zinc-300 text-lg font-light mb-6">
              O evento gravitacional em Corumbá de Goiás foi um sucesso absoluto. Nossas trajetórias se alinharam perfeitamente.
            </p>

            <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-4 inline-block mb-6 shadow-[inset_0_0_15px_rgba(34,211,238,0.1)]">
              <p className="text-cyan-400 font-mono text-xl uppercase tracking-widest font-bold">
                Novo Status: Namorados
              </p>
            </div>

            {/* O toque de Física/Astronomia */}
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl mb-6 text-left">
              <p className="text-blue-300 text-sm font-light italic">
                "Na astronomia, quando duas estrelas se encontram e passam a orbitar o mesmo centro gravitacional, elas formam um <strong className="text-cyan-400 font-medium">Sistema Estelar Binário</strong>. A partir de ontem, deixamos de viajar sozinhos pelo espaço."
              </p>
            </div>

            {/* Espaço para a foto de vocês em Corumbá */}
            <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-6 bg-black/20 group hover:border-cyan-500/60 transition-colors">
              <p className="text-cyan-500/60 font-mono text-xs uppercase tracking-widest mb-2">
                [ Evidência Fotográfica do Sistema Binário ]
              </p>
              
              {/* Quando você tiver a foto da viagem, você pode trocar essa <div> inteira pela tag <img> */}
              <div className="h-40 flex items-center justify-center">
                <p className="text-zinc-500 text-sm italic">
                  (Inserir aqui a nossa primeira foto oficial tirada em Corumbá!)
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}