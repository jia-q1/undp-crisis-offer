export interface SectionDef {
  id: string;
  label: string;
}

export const SECTIONS: SectionDef[] = [
  { id: "about", label: "About you" },
  { id: "situation", label: "Situation on the ground" },
  { id: "advantage", label: "UNDP's advantage" },
  { id: "offer", label: "Our offer" },
  { id: "investment", label: "The investment" },
  { id: "roi", label: "Return on investment" },
  { id: "contact", label: "Contact" },
  { id: "review", label: "Review & submit" },
];
