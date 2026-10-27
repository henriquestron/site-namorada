"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { memories } from "@/lib/story";
import { Icon } from "./icon";
import { Modal } from "./modal";

export function MemoryAlbum() {
  const [active, setActive] = useState<number | null>(null);
  const isOpen = active !== null;
  const selected = active === null ? null : memories[active];
  const move = (step: number) => setActive((index) => index === null ? null : (index + step + memories.length) % memories.length);

  useEffect(() => {
    if (!isOpen) return;
    const navigate = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((index) => index === null ? null : (index + step + memories.length) % memories.length);
    };
    document.addEventListener("keydown", navigate);
    return () => document.removeEventListener("keydown", navigate);
  }, [isOpen]);

  return <>
    <div className="memory-grid">
      {memories.map((memory, i) => (
        <button key={memory.src} type="button" className={`memory-card memory-${i + 1}`} onClick={() => setActive(i)} aria-label={`Abrir foto: ${memory.title}`}>
          <Image src={memory.src} alt="" fill sizes={i === 0 ? "(max-width: 640px) 100vw, (max-width: 1000px) 66vw, 550px" : "(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 275px"} />
          <span className="memory-shade" />
          <span className="memory-number">{String(i + 1).padStart(2, "0")}</span>
          <span className="memory-caption">{memory.title}</span>
          <span className="memory-expand"><Icon name="expand" width="16" height="16" /></span>
        </button>
      ))}
    </div>
    <p className="album-hint"><Icon name="expand" width="14" height="14" /> Toque em uma foto e fique mais um pouquinho.</p>
    <Modal open={selected !== null} onClose={() => setActive(null)} titleId="memory-title" className="photo-modal">
      {selected && <div>
        <div className="photo-viewer"><Image src={selected.src} alt={selected.title} width={selected.width} height={selected.height} sizes="(max-width: 800px) 94vw, 800px" /></div>
        <div className="photo-details" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">LEMBRANÇA {String((active ?? 0) + 1).padStart(2, "0")} / {String(memories.length).padStart(2, "0")}</span>
          <h3 id="memory-title">{selected.title}</h3><p>{selected.note}</p>
        </div>
        <div className="photo-controls"><button type="button" className="icon-button" aria-label="Foto anterior" onClick={() => move(-1)}><Icon name="previous" /></button><span>Mais um pedacinho de nós</span><button type="button" className="icon-button" aria-label="Próxima foto" onClick={() => move(1)}><Icon name="next" /></button></div>
      </div>}
    </Modal>
  </>;
}
