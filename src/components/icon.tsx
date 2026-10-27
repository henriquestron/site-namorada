import type { SVGProps } from "react";

type IconName = "heart" | "star" | "arrow" | "down" | "play" | "pause" | "close" | "previous" | "next" | "mail" | "music" | "expand" | "orbit";

const paths: Record<IconName, React.ReactNode> = {
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  star: <path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z" />,
  arrow: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  down: <path d="M12 4v16m-6-6 6 6 6-6" />,
  play: <path d="m8 4 12 8-12 8V4Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  previous: <path d="m15 5-7 7 7 7" />,
  next: <path d="m9 5 7 7-7 7" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  music: <><path d="M9 17V5l12-2v12M9 9l12-2" /><ellipse cx="6" cy="18" rx="3" ry="3" /><ellipse cx="18" cy="16" rx="3" ry="3" /></>,
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  orbit: <><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)" /><circle cx="19.7" cy="6.4" r="1.5" fill="currentColor" stroke="none" /></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
