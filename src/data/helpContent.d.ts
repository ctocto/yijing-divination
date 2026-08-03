export interface HelpTerm {
  k: string;
  v: string;
}

export type HelpBlock =
  | { type: 'para'; text: string }
  | { type: 'steps'; title: string; steps: string[] }
  | { type: 'terms'; title: string; items: HelpTerm[] }
  | { type: 'table'; title: string; head: string[]; rows: string[][] }
  | { type: 'note'; text: string }
  | { type: 'list'; items: string[] };

export interface HelpChapter {
  id: string;
  title: string;
  blocks: HelpBlock[];
}

export const GUIDE: HelpChapter[];
