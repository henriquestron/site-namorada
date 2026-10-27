// Vitor authorized this starting content to be public, including in the repository.
// Existing letters are kept verbatim in story.ts. No audio or future letter is fabricated.
import { emptyContent, emptyItem, sectionIds, type AdminSurprise, type PublicSurprise, type SectionId, type SurpriseContent, type SurpriseItem } from "./surprises.ts";
import { letters } from "./story.ts";

function item(id: string, values: Partial<SurpriseItem>): SurpriseItem { return { ...emptyItem(id), ...values }; }
function section(id: SectionId, values: Partial<SurpriseContent>): PublicSurprise {
  return { id, locked: false, content: { ...emptyContent(id), ...values } };
}
export const publicStartingSections: PublicSurprise[] = [
  section("timeline", { intro: "Cada pedacinho da nossa história merece ficar guardado.", items: [
    item("nosso-comeco", { title: "O começo da nossa história", date: "2026-06-26", text: "Desde a nossa primeira conversa, eu senti uma conexão tão forte e inexplicável que logo me veio um pensamento: é ela." }),
    item("nosso-sim", { title: "O nosso sim, em Corumbá", date: "2026-09-19", text: letters.find((letter) => letter.id === "nos")!.paragraphs[0], image: "/memorias/foto-pedido.webp" }),
  ] }),
  section("stars", { intro: "Algumas estrelas guardam um carinho. Toque nelas para descobrir.", items: [
    item("estrela-saudade", { title: "Um carinho para você", text: letters[0].paragraphs[2], x: 6, y: 24 }),
    item("estrela-sorriso", { title: "Minha morena cacheada", text: letters[2].paragraphs[1], x: 94, y: 51 }),
    item("estrela-nos", { title: "Mais um pedacinho de nós", text: letters[3].paragraphs[1], x: 7, y: 81 }),
  ] }),
  section("capsule", { intro: "Um lugar para guardar uma carta e reencontrar esse carinho no futuro." }),
  section("voice", { intro: "Um cantinho para os recados que também podem ser ouvidos." }),
  section("chapters", { intro: "Ainda temos tanta história pela frente.", items: [
    item("viajar-juntos", { title: "Conhecer novos lugares", text: "Quero crescer ao seu lado, construir a nossa história e viajar o mundo com você." }),
    item("momentos-simples", { title: "Continuar vivendo os nossos momentos", text: "Um cantinho só nosso. Para guardar o que vivemos, lembrar do que sentimos e sonhar com o que vem." }),
  ] }),
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
  return sectionIds.map((id) => overrides.find((entry) => entry.id === id) ?? publicStartingSections.find((entry) => entry.id === id)!);
}
