"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Stars } from "@/components/stars";
import { TogetherCounter } from "@/components/together-counter";
import { MemoryAlbum } from "@/components/memory-album";
import { OpenWhen } from "@/components/open-when";
import { OurUniverse } from "@/components/our-universe";

export default function NossoSite() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [musicError, setMusicError] = useState("");

  async function toggleMusic() {
    if (!audio.current) return;
    setMusicError("");
    if (!audio.current.paused) { audio.current.pause(); return; }
    try {
      audio.current.volume = 0.5;
      await audio.current.play();
    } catch {
      setMusicError("Não consegui tocar agora. Tente dar o play de novo.");
    }
  }

  return (
    <div className="our-story" id="inicio">
      <Stars />
      <audio ref={audio} src="/musica.mp3" loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setMusicError("A nossa música não carregou. Tente novamente daqui a pouquinho."); }} />
      <a className="skip-link" href="#conteudo">Ir para a nossa história</a>

      <header className="site-header wrap">
        <a className="wordmark" href="#inicio" aria-label="Vitor e Yasmin, início">V<span>&</span>Y<Icon name="star" width="13" height="13" /></a>
        <nav aria-label="Navegação principal"><a href="#memorias">Memórias</a><a href="#cartinhas">Cartinhas</a><a href="#carta">Nossa carta</a></nav>
        <button className={`header-music ${playing ? "is-playing" : ""}`} type="button" onClick={toggleMusic} aria-pressed={playing} aria-label={playing ? "Pausar nossa música" : "Tocar nossa música"}><Icon name={playing ? "pause" : "music"} width="17" height="17" /><span>Nossa música</span></button>
      </header>

      <main id="conteudo">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="tiny-star">✦</span> O NOSSO PEQUENO UNIVERSO</p>
            <h1 id="hero-title">De todos os caminhos,<br />o meu favorito<br />é com <em>você.</em></h1>
            <p className="hero-description">Um cantinho só nosso. Para guardar o que vivemos,<br className="desktop-break" /> lembrar do que sentimos e sonhar com o que vem.</p>
            <div className="hero-actions"><a className="button button-primary" href="#memorias">Passear pelas nossas memórias <Icon name="arrow" width="18" height="18" /></a><button className="music-link" type="button" onClick={toggleMusic} aria-pressed={playing}><span className="play-circle"><Icon name={playing ? "pause" : "play"} width="15" height="15" /></span>{playing ? "Pausar nossa música" : "Dê o play na nossa história"}</button></div>
            <div className="hero-dedication"><span className="dedication-line" /><p>De Vitor, para Yasmin.<span>Com todo o meu amor, sempre.</span></p><Icon name="heart" width="23" height="23" /></div>
          </div>
          <div className="hero-art">
            <span className="photo-orbit photo-orbit-one" aria-hidden="true" /><span className="photo-orbit photo-orbit-two" aria-hidden="true" />
            <span className="hero-spark spark-one" aria-hidden="true">✧</span><span className="hero-spark spark-two" aria-hidden="true">✦</span>
            <figure className="hero-polaroid"><div className="hero-photo"><Image src="/memorias/foto-pedido.webp" alt="Vitor e Yasmin sorrindo e mostrando as alianças em Corumbá de Goiás" fill sizes="(max-width: 640px) 80vw, (max-width: 1000px) 45vw, 390px" preload /></div><figcaption>A minha melhor escolha. <span>💙</span></figcaption></figure>
            <div className="photo-stamp"><Icon name="orbit" width="22" height="22" /><span>duas estrelas,<br /><strong>o mesmo universo.</strong></span></div>
            <span className="photo-note">o nosso sim, em Corumbá</span>
          </div>
          <a href="#tempo" className="scroll-invitation"><span>A HISTÓRIA CONTINUA</span><Icon name="down" width="16" height="16" /></a>
        </section>

        <section className="time-section wrap" id="tempo" aria-labelledby="time-title">
          <div className="time-intro"><p className="eyebrow">DESDE 26 DE JUNHO DE 2026</p><h2 id="time-title">O tempo voa <em>com você.</em></h2><p>E eu quero cada segundo que ainda vem.</p></div>
          <TogetherCounter />
          <span className="time-footnote"><span className="live-dot" /> A nossa história continua sendo escrita.</span>
        </section>

        <section className="section wrap" id="memorias" aria-labelledby="memories-title">
          <div className="section-heading"><div><p className="eyebrow">PEDACINHOS DA NOSSA VIDA</p><h2 id="memories-title">Se eu pudesse<br /><em>guardar o tempo.</em></h2></div><p>Cada foto tem um pouco da gente.<br />E uma vontade enorme de viver tudo de novo.</p></div>
          <MemoryAlbum />
        </section>

        <section className="reasons-section wrap" aria-labelledby="reasons-title">
          <div className="reasons-intro"><p className="eyebrow">ENTRE TANTOS MOTIVOS</p><h2 id="reasons-title">Eu amo <em>o seu jeito.</em></h2></div>
          <div className="reasons-grid">
            <article><Icon name="star" /><h3>Seu olhar</h3><p>É incrível como o seu olhar é tão apaixonante… chega a me deixar todo bobinho e me faz esquecer de tudo ao redor.</p></article>
            <article><Icon name="orbit" /><h3>Nossa conexão</h3><p>A forma como a gente se entende, se apoia e combina em absolutamente tudo, com uma sintonia absurda.</p></article>
            <article><Icon name="heart" /><h3>Seu jeitinho</h3><p>A maneira única como você enxerga a vida e cuida de mim, me fazendo querer ser alguém melhor todos os dias.</p></article>
          </div>
        </section>

        <section className="section letters-section" id="cartinhas" aria-labelledby="letters-title"><div className="wrap">
          <div className="section-heading"><div><p className="eyebrow">DEIXEI UM CARINHO PRA VOCÊ</p><h2 id="letters-title">Tem palavras que<br /><em>também abraçam.</em></h2></div><p>Quatro cartinhas, feitas pra você.<br />Abra a que o seu coração estiver pedindo hoje.</p></div>
          <OpenWhen />
          <p className="letters-footnote">Pode abrir quantas vezes quiser. O amor aqui não acaba. <Icon name="heart" width="13" height="13" /></p>
        </div></section>

        <section className="soundtrack-section wrap" aria-labelledby="soundtrack-title">
          <div className={`record-player ${playing ? "is-playing" : ""}`} aria-hidden="true"><div className="vinyl"><span>V<span>&</span>Y</span></div><span className="record-spark">✧</span></div>
          <div className="soundtrack-copy"><p className="eyebrow">TEM MÚSICA QUE É UM LUGAR</p><h2 id="soundtrack-title">A nossa <em>trilha sonora.</em></h2><h3>Pra Mudar A Minha Vida</h3><span className="song-artist">Zezé Di Camargo & Luciano</span><p>Aquele modão, a nossa sintonia e a vontade de ficar juntinhos.<br />Tem coisas que uma música guarda melhor que qualquer palavra.</p><button className="button button-outline" type="button" onClick={toggleMusic} aria-pressed={playing}><Icon name={playing ? "pause" : "play"} width="17" height="17" />{playing ? "Pausar a nossa música" : "Ouvir a nossa música"}</button></div>
        </section>

        <section className="section wrap" id="carta" aria-labelledby="love-title">
          <div className="love-letter"><div className="love-letter-margin" aria-hidden="true"><Icon name="heart" width="27" height="27" /><span>COM AMOR, VITOR</span></div><article className="love-letter-content"><p className="eyebrow">PARA LER COM O CORAÇÃO</p><h2 id="love-title">Para a mulher<br /><em>da minha vida.</em></h2><div className="love-letter-text">
            <p>Meu amor, criei este espaço para tentar mostrar pelo menos uma fração do quanto eu te amo. Desde a nossa primeira conversa, eu senti uma conexão tão forte e inexplicável que logo me veio um pensamento: é ela.</p>
            <p>É com ela que eu quero dividir a minha vida. Quero crescer ao seu lado, construir a nossa história e viajar o mundo com você.</p>
            <p>A cada dia que passa, me apaixono ainda mais por você. O quanto combinamos, os nossos gostos, aquele modão raiz que a gente escuta juntos, meu Deus…</p>
            <p>É incrível como todas as vezes que a gente sai junto, é uma saída melhor que a outra. Se eu pudesse parar o tempo pra não passar tão rápido, ficaríamos por dias juntinhos.</p>
            <p>Sempre vou estar com você. Meu amor por você sempre vai ser imenso, e aumentando cada dia mais.</p>
            <p className="letter-emphasis">Eu te amo demais, meu amor.</p>
          </div><p className="letter-signoff">Com todo o meu amor,<span>Vitor</span></p></article><span className="letter-corner-star" aria-hidden="true">✧</span></div>
        </section>

        <section className="section wrap universe-section" id="universo" aria-label="O nosso encontro de universos"><OurUniverse /></section>
      </main>

      <footer className="site-footer wrap"><a className="wordmark" href="#inicio" aria-label="Voltar ao início">V<span>&</span>Y</a><p>Um pequeno espaço no universo.<br /><span>Um amor que não cabe nele.</span></p><span className="footer-love">Feito com muito <Icon name="heart" width="14" height="14" /></span></footer>
      {playing && <button className="floating-player" type="button" onClick={toggleMusic} aria-label="Pausar nossa música"><span className="equalizer" aria-hidden="true"><i /><i /><i /><i /></span><span>A nossa música<span>Pra Mudar A Minha Vida</span></span><Icon name="pause" width="16" height="16" /></button>}
      {musicError && <div className="music-error" role="status">{musicError}<button type="button" onClick={() => setMusicError("")} aria-label="Fechar aviso"><Icon name="close" width="16" height="16" /></button></div>}
    </div>
  );
}
