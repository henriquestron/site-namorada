// Shared structure. Public starting content is in public-surprises.ts.
export const sectionIds = ["timeline", "stars", "capsule", "voice", "chapters", "reasons"] as const;
export type SectionId = typeof sectionIds[number];
export const sectionLabels: Record<SectionId, string> = {
  timeline: "Linha do tempo", stars: "Estrelas com segredos", capsule: "Cápsula do tempo",
  voice: "Mensagens com a sua voz", chapters: "Nossos próximos capítulos", reasons: "Um motivo para te amar",
};
export const letterOptions = [
  { id: "", label: "Na seção de áudios" }, { id: "saudade", label: "Quando a saudade apertar" },
  { id: "dia-dificil", label: "Quando o dia estiver difícil" }, { id: "sorriso", label: "Quando precisar de um sorriso" },
  { id: "nos", label: "Quando quiser lembrar de nós" },
];
export type SurpriseItem = {
  id: string; title: string; text: string; date: string; image: string; audio: string;
  letter: string; done: boolean; x: number; y: number;
};
export type SurpriseContent = { title: string; intro: string; unlockAt: string; items: SurpriseItem[]; timelineRevision?: number; chaptersRevision?: number };
export type PublicSurprise = { id: SectionId; content: SurpriseContent; locked: boolean };
export type AdminSurprise = {
  id: SectionId; draft: SurpriseContent; published: SurpriseContent | null;
  version: number; published_at: string | null;
};
export function isSectionId(value: unknown): value is SectionId {
  return typeof value === "string" && sectionIds.includes(value as SectionId);
}
export function emptyContent(id: SectionId): SurpriseContent {
  return { title: sectionLabels[id], intro: "", unlockAt: "", items: [] };
}
export function emptyItem(id: string): SurpriseItem {
  return { id, title: "", text: "", date: "", image: "", audio: "", letter: "", done: false, x: 12, y: 25 };
}
export const assetPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp3|m4a|ogg|wav|webm)$/;
export function isExistingPublicPhoto(asset: string) { return /^\/memorias\/foto([1-8]|-pedido)\.webp$/.test(asset); }
export function mediaUrl(asset: string) { return isExistingPublicPhoto(asset) ? asset : `/api/surprises/media/${encodeURIComponent(asset)}`; }

// Explicitly rebuild the object: never persist arbitrary client fields or external asset URLs.
export function validateContent(value: unknown): SurpriseContent {
  if (!value || typeof value !== "object") throw new Error("Conteúdo inválido.");
  const v = value as Record<string, unknown>;
  function str(input: unknown, max: number) {
    if (typeof input !== "string" || input.length > max) throw new Error("Texto inválido ou muito longo.");
    return input.trim();
  }
  const title = str(v.title, 160), intro = str(v.intro, 4000), unlockAt = str(v.unlockAt, 40);
  if (!title) throw new Error("Escreva um título.");
  if (unlockAt && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{3})?)?(Z|[+-]\d\d:\d\d)$/.test(unlockAt) || !Number.isFinite(Date.parse(unlockAt)))) throw new Error("Data de abertura inválida.");
  if (!Array.isArray(v.items) || v.items.length > 100) throw new Error("Use até 100 itens por novidade.");
  const seen = new Set<string>();
  const items = v.items.map((input): SurpriseItem => {
    if (!input || typeof input !== "object") throw new Error("Item inválido.");
    const i = input as Record<string, unknown>;
    const id = str(i.id, 80);
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || seen.has(id)) throw new Error("Identificador repetido ou inválido.");
    seen.add(id);
    const image = str(i.image, 80), audio = str(i.audio, 80), date = str(i.date, 10), letter = str(i.letter, 20);
    if ((image && !isExistingPublicPhoto(image) && (!assetPattern.test(image) || !/\.(jpg|png|webp)$/.test(image))) || (audio && (!assetPattern.test(audio) || !/\.(mp3|m4a|ogg|wav|webm)$/.test(audio)))) throw new Error("Arquivo inválido. Use o envio pelo painel.");
    if (date && (!/^\d{4}-\d\d-\d\d$/.test(date) || !Number.isFinite(Date.parse(date)))) throw new Error("Data do item inválida.");
    if (!letterOptions.some((l) => l.id === letter)) throw new Error("Cartinha inválida.");
    if (typeof i.done !== "boolean" || typeof i.x !== "number" || typeof i.y !== "number" || !Number.isFinite(i.x) || !Number.isFinite(i.y) || i.x < 3 || i.x > 97 || i.y < 3 || i.y > 97) throw new Error("Posição da estrela inválida (3 a 97%).");
    return { id, title: str(i.title, 160), text: str(i.text, 12000), date, image, audio, letter, done: i.done, x: i.x, y: i.y };
  });
  if (v.timelineRevision !== undefined && (typeof v.timelineRevision !== "number" || !Number.isSafeInteger(v.timelineRevision) || v.timelineRevision < 0)) throw new Error("Revisão da linha do tempo inválida.");
  if (v.chaptersRevision !== undefined && (typeof v.chaptersRevision !== "number" || !Number.isSafeInteger(v.chaptersRevision) || v.chaptersRevision < 0)) throw new Error("Revisão dos próximos capítulos inválida.");
  return { title, intro, unlockAt, items, ...(v.timelineRevision === undefined ? {} : { timelineRevision: v.timelineRevision as number }), ...(v.chaptersRevision === undefined ? {} : { chaptersRevision: v.chaptersRevision as number }) };
}
export function validatePublication(id: SectionId, content: SurpriseContent) {
  if (!content.items.length) throw new Error("Adicione pelo menos um item antes de liberar.");
  if (id === "capsule" && !content.unlockAt) throw new Error("Escolha a data e o horário da cápsula.");
  for (const item of content.items) {
    if (!item.title && !item.text) throw new Error("Preencha um título ou uma mensagem em cada item.");
    if (id === "voice" && !item.audio) throw new Error("Envie o áudio de cada mensagem antes de liberar.");
    if (id === "timeline" && !item.date) throw new Error("Preencha a data de cada marco.");
  }
}
export function publicSnapshot(id: SectionId, value: SurpriseContent | null, now = Date.now()): PublicSurprise | null {
  if (!value) return null;
  const content = validateContent(value);
  if (id === "capsule" && content.unlockAt && Date.parse(content.unlockAt) > now) {
    // Neither the future letter nor its media IDs or intro are sent before the server clock permits it.
    return { id, locked: true, content: { title: content.title, intro: "", unlockAt: content.unlockAt, items: [] } };
  }
  return { id, content, locked: false };
}
export function referencedAssets(content: SurpriseContent) {
  return new Set(content.items.flatMap((item) => [item.image, item.audio]).filter(Boolean));
}
