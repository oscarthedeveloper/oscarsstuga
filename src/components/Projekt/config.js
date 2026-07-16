// Delad konfiguration för teknik och status (färger, ordning).
export const TECH = [
  { id: 'React', color: '#149eca' },
  { id: 'Next.js', color: '#111111' },
  { id: 'Docusaurus', color: '#2e8555' },
  { id: 'Annat', color: '#8080a0' },
];

export const STATUS = [
  { id: 'Idé', color: '#8a8a8a' },
  { id: 'Pågår', color: '#0b00cb' },
  { id: 'Live', color: '#2ea043' },
  { id: 'Pausad', color: '#d98200' },
  { id: 'Arkiverad', color: '#9aa0a6' },
];

export function techColor(id) {
  return (TECH.find((t) => t.id === id) || TECH[3]).color;
}
export function statusColor(id) {
  return (STATUS.find((s) => s.id === id) || STATUS[0]).color;
}
