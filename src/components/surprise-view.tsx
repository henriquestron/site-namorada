"use client";

import { useState } from "react";
import { type PublicSurprise, type SurpriseItem, mediaUrl } from "@/lib/surprises";
import { Modal } from "./modal";
import { Icon } from "./icon";

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(`${date}T12:00:00-03:00`));
}
export function ItemMedia({ item }: { item: SurpriseItem }) {
  return <>
    {/* The authenticated proxy enforces visibility and never goes through the public image optimizer. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {item.image && <img className="surprise-photo" src={mediaUrl(item.image)} alt={item.title || "Uma lembrança nossa"} loading="lazy" />}
    {item.audio && <div className="surprise-audio"><p><Icon name="music" width="16" height="16" /> {item.title || "Um recado para você"}</p><audio controls preload="none" src={mediaUrl(item.audio)}>Seu navegador não suporta áudio.</audio></div>}
  </>;
}
export function SurpriseView({ section, preview = false, refresh }: { section: PublicSurprise; preview?: boolean; refresh?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState(-1);
  const { id, content, locked } = section;
  const active = content.items.find((item) => item.id === selected);
  const items = id === "timeline" ? [...content.items].sort((a, b) => a.date.localeCompare(b.date)) : content.items;
  const reasonItem = reason >= 0 ? items[reason % Math.max(items.length, 1)] : undefined;
  return <section className={`surprise-section surprise-${id}`} aria-label={content.title}>
    <div className="surprise-heading"><p className="eyebrow">MAIS UM PEDACINHO DE NÓS</p><h2>{content.title}</h2>{content.intro && <p className="surprise-intro">{content.intro}</p>}</div>
    {id === "capsule" && locked ? <div className="capsule-closed"><Icon name="mail" width="36" height="36" /><p>Tem um pedacinho do futuro guardado aqui.</p><p>Para abrir em <strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(content.unlockAt))}</strong> · horário de Goiás.</p><button className="button button-outline" type="button" onClick={refresh}>Conferir se já chegou a hora</button></div>
    : id === "capsule" && !items.length ? <div className="surprise-empty"><Icon name="mail" width="32" height="32" /><h3>Uma carta para o nosso futuro.</h3><p>A próxima carta e a sua data de abertura vão ficar guardadas aqui.</p></div>
    : id === "voice" && !items.some((item) => item.audio) ? <div className="surprise-empty"><Icon name="music" width="32" height="32" /><h3>Tem carinho que a gente pode ouvir.</h3><p>Este espaço está esperando o primeiro recadinho em áudio.</p></div>
    : id === "stars" ? <>
      {preview && <p className="workshop-hint">As posições correspondem à largura e à altura da tela. No site, estas estrelas ficam sobre o fundo estrelado.</p>}
      <div className="secret-constellation" aria-label="Estrelas para descobrir">{items.map((item) => <button key={item.id} type="button" className="secret-star" style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => setSelected(item.id)} aria-label="Descobrir o segredo desta estrela"><Icon name="star" /></button>)}</div>
      <SecretMessage item={active} onClose={() => setSelected(null)} />
    </> : id === "reasons" ? <div className="reason-reveal"><Icon name="heart" width="30" height="30" /><div className="reason-message" aria-live="polite">{reasonItem ? <><h3>{reasonItem.title}</h3><p>{reasonItem.text}</p></> : <p>Tem tantos detalhes seus que eu amo…</p>}</div><button type="button" className="button button-primary" disabled={!items.length} onClick={() => setReason((value) => (value + 1) % items.length)}>Me conta um motivo <Icon name="heart" width="16" height="16" /></button></div>
    : <div className={id === "timeline" ? "surprise-timeline" : "surprise-cards"}>{items.map((item) => <article key={item.id} className="surprise-card">
      {item.date && <time dateTime={item.date}>{dateLabel(item.date)}</time>}
      {id === "chapters" && <span className="chapter-state">{item.done ? "✓ Já vivemos esse capítulo" : "Ainda vamos viver"}</span>}
      <h3>{item.title}</h3>{item.text && <p>{item.text}</p>}<ItemMedia item={item} />
      {preview && item.letter && <small className="workshop-hint">Este áudio aparecerá dentro da cartinha escolhida.</small>}
      {!preview && item.letter && <a className="surprise-letter-link" href="#cartinhas">Também na cartinha “Abra quando…” ↗</a>}
    </article>)}</div>}
  </section>;
}
function SecretMessage({ item, onClose }: { item: SurpriseItem | undefined; onClose: () => void }) {
  return <Modal open={Boolean(item)} onClose={onClose} titleId="secret-message-title" className="letter-modal">{item && <article className="secret-message"><Icon name="star" width="30" height="30" /><p className="eyebrow">VOCÊ ENCONTROU UM SEGREDO</p><h3 id="secret-message-title">{item.title || "Só para você"}</h3><p>{item.text}</p><ItemMedia item={item} /></article>}</Modal>;
}
export function SecretStars({ section }: { section: PublicSurprise }) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = section.content.items.find((item) => item.id === selected);
  return <><div className="secret-star-layer" aria-label="Segredos entre as estrelas">{section.content.items.map((item) => <button key={item.id} type="button" className="secret-star" style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => setSelected(item.id)} aria-label="Descobrir o segredo desta estrela"><Icon name="star" /></button>)}</div><SecretMessage item={active} onClose={() => setSelected(null)} /></>;
}
