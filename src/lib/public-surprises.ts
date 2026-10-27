// Vitor authorized this starting content to be public, including in the repository.
// Existing letters are kept verbatim in story.ts. The future letter below is Vitor's text.
import { emptyContent, emptyItem, sectionIds, type AdminSurprise, type PublicSurprise, type SectionId, type SurpriseContent, type SurpriseItem } from "./surprises.ts";
import { letters } from "./story.ts";

function item(id: string, values: Partial<SurpriseItem>): SurpriseItem { return { ...emptyItem(id), ...values }; }
function section(id: SectionId, values: Partial<SurpriseContent>): PublicSurprise {
  return { id, locked: false, content: { ...emptyContent(id), ...values } };
}
const timelineRevision = 1;
const chaptersRevision = 1;
const capsuleRevision = 1;
const futureLetter = item("carta-para-o-futuro", {
  title: "Uma carta para o nosso futuro.",
  text: "Para o nosso futuro quero que todos os nossos sonhos se realizem juntos. Quero casar com você meu amor, viajar o mundo inteiro, ter os nossos filhos e a nossa casinha. Desejo passar todos os dias da minha vida ao seu lado.\nTe amo muito ❤️",
});
const nextChapters: SurpriseItem[] = [
  item("concursados-juntos", { title: "Concursados ano que vem", text: "Se Deus quiser vamos ser concursados ano que vem" }),
  item("praia-em-julho", { title: "Praia em julho", text: "Se Deus quiser vamos conhecer a praia em julho e comemorar que passamos no concurso em grande estilo juntos" }),
];
const addedTimelineMoments: SurpriseItem[] = [
  item("segundo-encontro", { title: "Nosso segundo encontro", date: "2026-07-03", text: "Quando saímos pela segunda vez em uma sexta." }),
  item("passeio-vaca-brava", { title: "Nosso passeio no Vaca Brava", date: "2026-07-09", text: "Dia 9 quando fizemos nosso passeio no parque vaca brava" }),
  item("primeira-academia-juntos", { title: "A primeira academia juntos", date: "2026-07-11", text: "Dia 11 primeira vez que fomos para a academia juntos" }),
  item("conhecendo-sua-familia", { title: "Conhecendo sua família", date: "2026-08-07", text: "Dia 7 de agosto a primeira vez que conheci a sua família e sua mãe me chamou de genro a primeira vez kkkkkk" }),
  item("festa-da-familia", { title: "Nossa festa da família", date: "2026-09-07", text: "Dia 7 de setembro quando vc conheceu a família toda da minha mãe na festa da família" }),
];

// Bring these five moments into previously saved timelines once. Persisting the revision
// lets later edits and removals in the panel remain intentional, without resurrecting items.
export function includeTimelineMoments(content: SurpriseContent): SurpriseContent {
  if ((content.timelineRevision ?? 0) >= timelineRevision) return content;
  const missing = addedTimelineMoments.filter((addition) => !content.items.some((saved) =>
    saved.id === addition.id || (saved.date === addition.date && (saved.title === addition.title || saved.text.trim() === addition.text.trim()))));
  return {
    ...content,
    timelineRevision,
    items: [...content.items, ...structuredClone(missing)].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")),
  };
}
// Update older saved content once; later edits in the panel stay intact.
export function includeSectionUpdates(id: SectionId, content: SurpriseContent): SurpriseContent {
  if (id === "timeline") return includeTimelineMoments(content);
  if (id === "chapters" && (content.chaptersRevision ?? 0) < chaptersRevision) {
    return { ...content, chaptersRevision, items: structuredClone(nextChapters) };
  }
  if (id === "capsule" && (content.capsuleRevision ?? 0) < capsuleRevision) {
    // No opening date was requested: this letter is visible immediately.
    return { ...content, capsuleRevision, unlockAt: "", items: [structuredClone(futureLetter)] };
  }
  return content;
}
export const publicStartingSections: PublicSurprise[] = [
  section("timeline", { intro: "Cada pedacinho da nossa história merece ficar guardado.", timelineRevision, items: [
    item("nosso-comeco", { title: "O começo da nossa história", date: "2026-06-26", text: "Desde a nossa primeira conversa, eu senti uma conexão tão forte e inexplicável que logo me veio um pensamento: é ela." }),
    ...addedTimelineMoments,
    item("nosso-sim", { title: "O nosso sim, em Corumbá", date: "2026-09-19", text: letters.find((letter) => letter.id === "nos")!.paragraphs[0], image: "/memorias/foto-pedido.webp" }),
  ] }),
  section("capsule", { intro: "Um lugar para guardar os sonhos que queremos viver juntos.", capsuleRevision, items: [futureLetter] }),
  section("chapters", { intro: "Ainda temos tanta história pela frente.", chaptersRevision, items: nextChapters }),
  section("reasons", { intro: "Um detalhe seu de cada vez.", items: [
    item("seu-olhar", { title: "Seu olhar", text: "É incrível como o seu olhar é tão apaixonante… chega a me deixar todo bobinho e me faz esquecer de tudo ao redor." }),
    item("nossa-conexao", { title: "Nossa conexão", text: "A forma como a gente se entende, se apoia e combina em absolutamente tudo, com uma sintonia absurda." }),
    item("seu-jeitinho", { title: "Seu jeitinho", text: "A maneira única como você enxerga a vida e cuida de mim, me fazendo querer ser alguém melhor todos os dias." }),
  ] }),
];

export function startingContent(id: SectionId): SurpriseContent {
  return structuredClone(publicStartingSections.find((entry) => entry.id === id)!.content);
}
export function hasSavedContent(row: Pick<AdminSurprise, "version" | "draft">) {
  return row.version > 0 || row.draft.items.length > 0 || Boolean(row.draft.intro || row.draft.unlockAt);
}
export function mergePublicSections(overrides: PublicSurprise[]) {
  return sectionIds.map((id) => {
    const selected = overrides.find((entry) => entry.id === id) ?? publicStartingSections.find((entry) => entry.id === id)!;
    // A locked capsule is already a redacted public response, not editable source content.
    return selected.locked ? selected : { ...selected, content: includeSectionUpdates(id, selected.content) };
  });
}
