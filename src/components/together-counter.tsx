"use client";

import { useSyncExternalStore } from "react";
import { timeTogether } from "@/lib/anniversary";

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const getServerSnapshot = () => null;

export function TogetherCounter() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const time = now === null ? null : timeTogether(now);
  const units = [
    ...(time && time.years > 0 ? [{ value: time.years, label: "anos" }] : []),
    { value: time?.months, label: "meses" }, { value: time?.days, label: "dias" },
    { value: time?.hours, label: "horas" }, { value: time?.minutes, label: "minutos" },
    { value: time?.seconds, label: "segundos" },
  ];

  return <div className="together-counter" role="group" aria-label="Tempo juntos desde 26 de junho de 2026">
    {units.map(({ value, label }) => <div key={label} className="counter-unit"><span className="counter-number">{value === undefined ? "—" : String(value).padStart(2, "0")}</span><span className="counter-label">{label}</span></div>)}
  </div>;
}
