/**
 * Maps each wizard step to the page of the Afghanistan "Investing Beyond
 * Crisis" example document (client/public/afghanistan-example.pdf) that
 * illustrates it, so the side panel can show the source doc itself.
 */
export const REFERENCE_PAGES: Record<string, number> = {
  challenge: 1,
  realityCheck: 1,
  results: 1,
  advantage: 2,
  offerIntro: 2,
  offerBlocks: 2,
  investmentNarrative: 3,
  investmentTable: 3,
  roi: 4,
  contact: 4,
};

export function pageForStep(stepId: string): number | undefined {
  return REFERENCE_PAGES[stepId];
}
