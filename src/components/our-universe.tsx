"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PROPOSAL_DATE } from "@/lib/story";
import { Icon } from "./icon";
import { Modal } from "./modal";

export function OurUniverse() {
  const [phase, setPhase] = useState<"idle" | "orbit" | "collision">("idle");
  const [open, setOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const running = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function replay() {
    if (running.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOpen(true); return; }
    running.current = true;
    setPhase("orbit");
    timers.current = [
      setTimeout(() => setPhase("collision"), 2200),
      setTimeout(() => { setPhase("idle"); setOpen(true); running.current = false; timers.current = []; }, 2900),
    ];
  }

  return <>
    <div className={`universe-card phase-${phase}`}>
      <div className="binary-system" aria-hidden="true"><div className="orbit-track orbit-track-one" /><div className="orbit-track orbit-track-two" /><div className="binary-stars"><span /><span /></div><span className="collision-glow" /></div>
      <div className="universe-copy"><p className="eyebrow">19.09.2026 · CORUMBÁ DE GOIÁS</p><h2>Quando duas órbitas<br />viraram <em>uma história.</em></h2><p>O nosso encontro de universos tem lugar, data e uma lembrança que eu quero guardar pra sempre.</p><button className="button button-outline" type="button" onClick={replay} disabled={phase !== "idle"}><Icon name="orbit" /> {phase === "idle" ? "Reviver a nossa colisão" : "Nossas órbitas se encontrando…"}</button><span className="universe-status" role="status">{phase === "collision" ? "Colisão concluída. O nosso universo nasceu." : "Duas estrelas. O mesmo universo."}</span></div>
    </div>
    <Modal open={open} onClose={() => setOpen(false)} titleId="universe-title" className="universe-modal">
      <div className="universe-memory"><span className="eyebrow">COLISÃO CONCLUÍDA · {PROPOSAL_DATE}</span><h3 id="universe-title">O nosso <em>sim.</em></h3><p className="status-label"><Icon name="heart" width="15" height="15" /> Novo status: namorados</p><div className="proposal-photo"><Image src="/memorias/foto-pedido.webp" alt="Vitor e Yasmin mostrando as alianças no pedido em Corumbá de Goiás" width={1200} height={1600} sizes="(max-width: 640px) 90vw, 500px" /></div><p>O evento gravitacional em Corumbá de Goiás foi um sucesso absoluto. Nossas trajetórias se alinharam perfeitamente.</p><blockquote>Como um sistema estelar binário, duas estrelas passaram a compartilhar a mesma órbita. Desde aquele dia, deixamos de viajar sozinhos pelo espaço.</blockquote><span className="handwritten">Eu escolheria você de novo. 💙</span></div>
    </Modal>
  </>;
}
