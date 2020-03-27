export type FormatterTemplateMap = {
  layout: LayoutTemplate;
  entry: EntryTemplate;
};

export type LayoutTemplate = {
  (level: string, title: string, content: string): string;
};

export type EntryTemplate = {
  (ts: string, level: string, label: string, content: string): string;
};
