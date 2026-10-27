"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicSurprise } from "@/lib/surprises";
import { mergePublicSections, publicStartingSections } from "@/lib/public-surprises";
import { SurpriseView } from "./surprise-view";

const ReleasedContext = createContext<{ sections: PublicSurprise[]; refresh: () => void }>({ sections: [], refresh: () => {} });
export function ReleasedSurprisesProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<PublicSurprise[]>(publicStartingSections);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/surprises", { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json(); setSections(mergePublicSections(body.sections));
    } catch { /* Keep the public content visible if the optional database is unavailable. */ }
  }, []);
  useEffect(() => {
    let live = true;
    const update = () => { if (live && document.visibilityState === "visible") void refresh(); };
    update();
    const timer = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => { live = false; window.clearInterval(timer); window.removeEventListener("focus", update); };
  }, [refresh]);
  useEffect(() => {
    // Keep a single audio source playing at a time.
    const solo = (event: Event) => {
      if (!(event.target instanceof HTMLAudioElement)) return;
      document.querySelectorAll("audio").forEach((audio) => { if (audio !== event.target) audio.pause(); });
    };
    document.addEventListener("play", solo, true);
    return () => document.removeEventListener("play", solo, true);
  }, []);
  return <ReleasedContext.Provider value={{ sections, refresh }}>{children}</ReleasedContext.Provider>;
}
export function ReleasedSurprises() {
  const { sections, refresh } = useContext(ReleasedContext);
  if (!sections.length) return null;
  return <div className="wrap released-surprises">{sections.map((section) => <SurpriseView key={section.id} section={section} refresh={refresh} />)}</div>;
}
