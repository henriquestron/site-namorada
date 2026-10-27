"use client";

import { useState } from "react";
import { letters } from "@/lib/story";
import { Icon } from "./icon";
import { Modal } from "./modal";
import { ReleasedLetterAudio } from "./released-surprises";

export function OpenWhen() {
  const [active, setActive] = useState<string | null>(null);
  const letter = letters.find((item) => item.id === active);

  return <>
    <div className="letters-grid">
      {letters.map((item, i) => <button key={item.id} type="button" className="envelope-card" onClick={() => setActive(item.id)} aria-label={`Abrir cartinha: quando ${item.title}`}>
        <span className="envelope-topline"><span>PARA: MEU AMOR</span><span>0{i + 1}</span></span>
        <span className="envelope-drawing" aria-hidden="true"><span className="envelope-flap" /><span className="envelope-seal"><Icon name={item.symbol} /></span></span>
        <span className="envelope-prefix">Abra quando…</span>
        <span className="envelope-title">{item.title}</span>
        <span className="envelope-description">{item.subtitle}</span>
        <span className="envelope-action">Tem um carinho aqui <Icon name="arrow" width="17" height="17" /></span>
      </button>)}
    </div>
    <Modal open={Boolean(letter)} onClose={() => setActive(null)} titleId="letter-title" className="letter-modal">
      {letter && <article className="opened-letter">
        <Icon name={letter.symbol} className="letter-symbol" width="32" height="32" />
        <p className="eyebrow">UMA CARTINHA SÓ SUA</p>
        <h3 id="letter-title">Para quando<br /><em>{letter.title}.</em></h3>
        <div className="letter-paragraphs">{letter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <ReleasedLetterAudio key={letter.id} letterId={letter.id} />
        <p className="letter-signoff">Com todo o meu amor,<span>Vitor</span></p>
      </article>}
    </Modal>
  </>;
}
