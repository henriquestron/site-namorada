"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { type AdminSurprise, type SectionId, type SurpriseContent, type SurpriseItem, emptyItem, letterOptions, mediaUrl, sectionIds, sectionLabels } from "@/lib/surprises";
import { Stars } from "./stars";
import { Modal } from "./modal";
import { SurpriseView } from "./surprise-view";

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, cache: "no-store", credentials: "same-origin" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Não foi possível concluir.");
  return body;
}
function localDateTime(iso: string) {
  if (!iso) return "";
  // All editorial dates are explicitly in Goiás, independent of the editor's device timezone.
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
  return parts.replace(" ", "T");
}
export function PrivateWorkshop({ authenticated, configured }: { authenticated: boolean; configured: boolean }) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [password, setPassword] = useState("");
  const [sections, setSections] = useState<AdminSurprise[]>([]);
  const [active, setActive] = useState<SectionId>("timeline");
  const [draft, setDraft] = useState<SurpriseContent | null>(null);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(authenticated), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false), [confirm, setConfirm] = useState(false);
  const current = sections.find((s) => s.id === active);
  const dirty = Boolean(draft && current && JSON.stringify(draft) !== JSON.stringify(current.draft));
  const pending = busy || uploading || loading;

  async function load() {
    setLoading(true); setError("");
    try {
      const body = await api("/api/private/sections");
      setSections(body.sections);
      setDraft(body.sections.find((s: AdminSurprise) => s.id === active)?.draft ?? null);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível carregar."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    api("/api/private/sections").then((body) => {
      if (cancelled) return;
      setSections(body.sections);
      setDraft(body.sections.find((s: AdminSurprise) => s.id === active)?.draft ?? null);
    }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Não foi possível carregar."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [signedIn, active]);
  useEffect(() => {
    if (!dirty && !uploading) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploading]);

  function changeSection(id: SectionId) {
    if (id === active || pending || (dirty && !window.confirm("Você tem alterações sem salvar. Descartar e trocar de novidade?"))) return;
    setActive(id); setDraft(null); setNotice(""); setError(""); setLoading(true);
  }
  function updateItem(index: number, changes: Partial<SurpriseItem>) {
    setDraft((d) => d ? { ...d, items: d.items.map((item, i) => i === index ? { ...item, ...changes } : item) } : d);
  }
  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/private/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); setPassword(""); setLoading(true); setSignedIn(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível entrar."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    if (dirty && !window.confirm("Há alterações sem salvar. Sair mesmo assim?")) return;
    setBusy(true); setError("");
    try { await api("/api/private/session", { method: "DELETE" }); setSignedIn(false); setSections([]); setDraft(null); setPreview(false); setConfirm(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível sair."); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!current || !draft) return;
    setBusy(true); setNotice(""); setError("");
    try {
      const { section } = await api(`/api/private/sections/${active}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", version: current.version, content: draft }) });
      setSections((rows) => rows.map((s) => s.id === active ? section : s));
      setDraft(section.draft);
      setNotice("Alterações salvas no site. Já estão disponíveis para os visitantes.");
      setConfirm(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar."); setConfirm(false); }
    finally { setBusy(false); }
  }
  async function upload(file: File | undefined, itemId: string, kind: "image" | "audio") {
    if (!file) return;
    setUploading(true); setNotice(""); setError("");
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error("Envie arquivos de até 3 MB.");
      const { asset } = await api("/api/private/media", { method: "POST", headers: { "Content-Type": file.type }, body: file });
      setDraft((d) => d ? { ...d, items: d.items.map((item) => item.id === itemId ? { ...item, [kind]: asset } : item) } : d);
      setNotice("Arquivo enviado. Clique em Salvar no site para adicioná-lo à seção pública.");
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível enviar o arquivo."); }
    finally { setUploading(false); }
  }

  return <div className="our-story workshop-page"><Stars />
    <header className="workshop-header wrap"><Link className="wordmark" href="/" onClick={(e) => { if (dirty && !window.confirm("Descartar alterações locais e voltar ao site?")) e.preventDefault(); }}>V<span>&</span>Y</Link><Link href="/" className="workshop-link" onClick={(e) => { if (dirty && !window.confirm("Descartar alterações locais e voltar ao site?")) e.preventDefault(); }}>Voltar ao nosso universo ↗</Link>{signedIn && <button type="button" className="button button-outline" onClick={signOut} disabled={pending}>Sair</button>}</header>
    {!signedIn ? <main className="workshop-login wrap">
      <p className="eyebrow">PAINEL DE EDIÇÃO</p><h1>O que vem a seguir<br /><em>começa aqui.</em></h1><p>As novidades já estão públicas. Entre para editar os textos e adicionar fotos e áudios.</p>
      {!configured && <p className="workshop-alert" role="status">O painel ainda está fechado. Conclua a configuração descrita em CONFIGURAR_AREA_PRIVADA.md antes de entrar.</p>}
      <form onSubmit={signIn} method="post" action="/api/private/session"><label htmlFor="admin-password">Sua senha</label><input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={256} disabled={!configured || busy} /><button type="submit" className="button button-primary" disabled={!configured || busy}>{busy ? "Entrando…" : "Entrar no espaço privado"}</button></form>
      {error && <p className="workshop-alert" role="alert">{error}</p>}
    </main> : <main className="wrap workshop-main">
      <div className="section-heading"><div><p className="eyebrow">FEITO NO SEU TEMPO</p><h1>Nos bastidores<br /><em>do nosso universo.</em></h1></div><p>As seis novidades estão públicas.<br />Salve para atualizar o site.</p></div>
      <nav className="workshop-tabs" aria-label="Novidades">{sectionIds.map((id, i) => {
        return <button key={id} type="button" aria-current={active === id ? "page" : undefined} onClick={() => changeSection(id)} disabled={pending}><span>0{i + 1}</span><strong>{sectionLabels[id]}</strong><small>Pública</small></button>;
      })}</nav>
      {loading && <p role="status">Abrindo seu espaço…</p>}
      {error && <div className="workshop-alert" role="alert">{error}<button type="button" disabled={pending} onClick={() => { if (!dirty || window.confirm("Descartar alterações locais e recarregar?")) void load(); }}>Recarregar</button></div>}
      {notice && <p className="workshop-notice" role="status">{notice}</p>}
      {draft && current && <>
        <div className="workshop-editor-heading"><div><h2>{sectionLabels[active]}</h2><p>Confira a prévia e clique em Salvar no site para atualizar esta seção. {dirty && <strong>Há alterações sem salvar.</strong>}</p></div><span className="workshop-badge published">Pública</span></div>
        <fieldset className="workshop-fields" disabled={pending}>
          <label>Título da seção<input value={draft.title} maxLength={160} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
          <label>Texto de abertura<textarea value={draft.intro} maxLength={4000} rows={3} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} /></label>
          {active === "capsule" && <label>Data e horário de abertura · horário de Goiás<input type="datetime-local" value={localDateTime(draft.unlockAt)} onChange={(e) => setDraft({ ...draft, unlockAt: e.target.value ? new Date(`${e.target.value}:00-03:00`).toISOString() : "" })} /><small>Opcional. Sem data, a carta fica aberta. Com uma data futura, a cápsula aparece no site e a carta abre no horário escolhido.</small></label>}
          <div className="workshop-item-list">{draft.items.map((item, index) => <article className="workshop-item" key={item.id}>
            <div className="workshop-item-heading"><h3>{active === "reasons" ? "Motivo" : active === "stars" ? "Estrela" : "Item"} {String(index + 1).padStart(2, "0")}</h3><div><button type="button" aria-label={`Mover item ${index + 1} para cima`} disabled={pending || index === 0} onClick={() => { const items = [...draft.items]; [items[index - 1], items[index]] = [items[index], items[index - 1]]; setDraft({ ...draft, items }); }}>↑</button><button type="button" aria-label={`Mover item ${index + 1} para baixo`} disabled={pending || index === draft.items.length - 1} onClick={() => { const items = [...draft.items]; [items[index], items[index + 1]] = [items[index + 1], items[index]]; setDraft({ ...draft, items }); }}>↓</button><button type="button" onClick={() => { if (window.confirm("Remover este item do rascunho?")) setDraft({ ...draft, items: draft.items.filter((i) => i.id !== item.id) }); }}>Remover</button></div></div>
            <label>Título<input value={item.title} maxLength={160} onChange={(e) => updateItem(index, { title: e.target.value })} /></label>
            <label>{active === "reasons" ? "O motivo, do seu jeito" : "Sua mensagem"}<textarea value={item.text} rows={5} maxLength={12000} onChange={(e) => updateItem(index, { text: e.target.value })} /></label>
            {(active === "timeline" || active === "chapters") && <label>{active === "timeline" ? "Data do marco" : "Data (opcional)"}<input type="date" value={item.date} onChange={(e) => updateItem(index, { date: e.target.value })} /></label>}
            {active === "chapters" && <label className="workshop-checkbox"><input type="checkbox" checked={item.done} onChange={(e) => updateItem(index, { done: e.target.checked })} />Este sonho já aconteceu</label>}
            {active === "stars" && <div className="workshop-position"><label>Posição horizontal (%)<input type="number" min={3} max={97} value={item.x} onChange={(e) => updateItem(index, { x: Number(e.target.value) })} /></label><label>Posição vertical (%)<input type="number" min={3} max={97} value={item.y} onChange={(e) => updateItem(index, { y: Number(e.target.value) })} /></label></div>}
            {active === "voice" && <label>Onde ouvir esta mensagem<select value={item.letter} onChange={(e) => updateItem(index, { letter: e.target.value })}>{letterOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
            {active !== "reasons" && <div className="workshop-uploads">
              <label>Foto · até 3 MB<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { void upload(e.target.files?.[0], item.id, "image"); e.target.value = ""; }} /></label>
              {item.image && <div className="workshop-attachment">
                {/* Private assets must bypass the public Next image optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(item.image)} alt="Prévia da foto" /><button type="button" onClick={() => updateItem(index, { image: "" })}>Retirar foto</button></div>}
              {(active === "voice" || active === "capsule" || active === "stars") && <><label>Seu áudio · até 3 MB<input type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,audio/x-wav,audio/webm" onChange={(e) => { void upload(e.target.files?.[0], item.id, "audio"); e.target.value = ""; }} /></label>{item.audio && <div className="workshop-attachment"><audio controls preload="none" src={mediaUrl(item.audio)} /><button type="button" onClick={() => updateItem(index, { audio: "" })}>Retirar áudio</button></div>}</>}
            </div>}
          </article>)}</div>
          <button className="button button-outline" type="button" disabled={pending || draft.items.length >= 100} onClick={() => setDraft({ ...draft, items: [...draft.items, emptyItem(crypto.randomUUID())] })}>+ Adicionar {active === "stars" ? "estrela" : active === "reasons" ? "motivo" : "item"}</button>
        </fieldset>
        <div className="workshop-toolbar"><button type="button" className="button button-primary" onClick={() => setConfirm(true)} disabled={pending}>{busy ? "Salvando…" : uploading ? "Enviando arquivo…" : "Salvar no site"}</button><button type="button" className="button button-outline" onClick={() => setPreview(true)} disabled={pending}>Pré-visualizar</button></div>
      </>}
      <Modal open={preview} onClose={() => setPreview(false)} titleId="preview-title" className="workshop-preview"><h2 id="preview-title">Prévia da seção</h2><p className="workshop-hint">Aqui você confere o conteúdo antes de salvar, inclusive uma carta com data futura.</p>{preview && draft && <SurpriseView section={{ id: active, content: draft, locked: false }} preview />}</Modal>
      <Modal open={confirm} onClose={() => { if (!busy) setConfirm(false); }} titleId="confirm-title" className="letter-modal workshop-confirm"><h2 id="confirm-title">Salvar no site?</h2><p className="workshop-hint">Estas alterações vão atualizar a seção pública. Se você definiu uma data futura para a cápsula, a carta aguarda essa data.</p><div className="workshop-confirm-actions"><button className="button button-primary" type="button" disabled={busy} onClick={save}>{busy ? "Aguarde…" : "Salvar e publicar"}</button><button className="button button-outline" type="button" disabled={busy} onClick={() => setConfirm(false)}>Continuar editando</button></div></Modal>
    </main>}
  </div>;
}
