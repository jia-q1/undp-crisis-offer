import type { ComponentType } from "react";
import { TextField, TextAreaField, NumberField } from "../components/TextField";
import { RepeatableStatList } from "../components/RepeatableStatList";
import { OfferMatrixEditor } from "../components/OfferMatrixEditor";
import { InvestmentTableEditor } from "../components/InvestmentTableEditor";
import { OutcomeGroupsEditor } from "../components/OutcomeGroupsEditor";
import { ReviewStep } from "../components/ReviewStep";

export interface StepDef {
  id: string;
  sectionId: string;
  heading: string;
  helper?: string;
  fields: string[];
  Component: ComponentType;
}

function AboutStep() {
  return (
    <>
      <TextField name="meta.country" label="Country" example="Afghanistan" />
      <TextField name="meta.submittedByName" label="Your name" example="Jane Doe" />
      <TextField name="meta.submittedByRole" label="Your role / representation" example="Resident Representative, UNDP Afghanistan" />
      <TextField name="meta.submittedByEmail" label="Your email" type="email" example="jane.doe@undp.org" />
    </>
  );
}

function ChallengeStep() {
  return (
    <TextAreaField
      name="situation.challenge"
      label="The challenge, and why it matters now"
      example="Afghanistan is facing overlapping, mutually reinforcing crises that are pushing communities and local systems to a breaking point..."
    />
  );
}

function RealityCheckStep() {
  return (
    <RepeatableStatList
      name="situation.realityCheck"
      itemLabel="Stat"
      headlineExample="Basic needs under severe pressure."
      detailExample="3 in 4 Afghans (28.9 million people) cannot meet basic needs."
    />
  );
}

function ResultsStep() {
  return (
    <RepeatableStatList
      name="situation.results"
      itemLabel="Result"
      headlineExample="Supporting women-led businesses."
      detailExample="Since 2022, UNDP has continuously supported over 83,000 women-led enterprises."
    />
  );
}

function AdvantageStep() {
  return (
    <TextAreaField
      name="advantage.narrative"
      label="Why UNDP, why now"
      example="UNDP's comparative advantage lies in connecting immediate support with local recovery and longer-term stability..."
    />
  );
}

function OfferIntroStep() {
  return (
    <TextAreaField
      name="offer.intro"
      label="Introduce your offer"
      example="In [Country], UNDP adapts its global beyond crisis framework into a 2x2 operational crisis model tailored to country realities."
    />
  );
}

function OfferBlocksStep() {
  return <OfferMatrixEditor />;
}

function InvestmentNarrativeStep() {
  return (
    <>
      <NumberField name="investment.totalAmountUsdMillions" label="Total investment needed (US$ millions)" example="350" />
      <TextField name="investment.durationLabel" label="Duration" example="over three years (mid-2026 to mid-2029)" />
      <TextField name="investment.districtsLabel" label="Number of districts" example="200-250" />
      <TextField name="investment.provincesLabel" label="Provinces" example="24 provinces" />
      <TextAreaField
        name="investment.selectionCriteria"
        label="How will priority areas be selected?"
        example="These will be selected based on return pressures, poverty, service deficits, climate and disaster risks..."
      />
    </>
  );
}

function InvestmentTableStep() {
  return <InvestmentTableEditor />;
}

function RoiOverallStep() {
  return (
    <TextAreaField
      name="returnOnInvestment.overallImpact"
      label="Overall impact"
      example="Overall, the investment is expected to directly benefit approximately 7 million people across the four operational components..."
    />
  );
}

function RoiGroupsStep() {
  return <OutcomeGroupsEditor />;
}

function ContactStep() {
  return (
    <>
      <TextField name="contact.name" label="Contact name" example="UNDP Afghanistan" />
      <TextField name="contact.email" label="Contact email" type="email" example="registry.af@undp.org" />
      <TextField name="contact.link" label="Contact link (optional)" example="https://www.undp.org/afghanistan" />
    </>
  );
}

export const STEPS: StepDef[] = [
  { id: "about", sectionId: "about", heading: "Who's submitting this offer?", fields: [
      "meta.country", "meta.submittedByName", "meta.submittedByRole", "meta.submittedByEmail",
    ], Component: AboutStep },
  { id: "challenge", sectionId: "situation", heading: "The situation on the ground", fields: ["situation.challenge"], Component: ChallengeStep },
  { id: "realityCheck", sectionId: "situation", heading: "At a glance: reality check", helper: "Add the key stats that show the scale of the crisis.", fields: ["situation.realityCheck"], Component: RealityCheckStep },
  { id: "results", sectionId: "situation", heading: "Results speak for themselves", helper: "Include at least one concrete example of UNDP's results.", fields: ["situation.results"], Component: ResultsStep },
  { id: "advantage", sectionId: "advantage", heading: "UNDP's advantage", fields: ["advantage.narrative"], Component: AdvantageStep },
  { id: "offerIntro", sectionId: "offer", heading: "The offer: introduction", fields: ["offer.intro"], Component: OfferIntroStep },
  { id: "offerBlocks", sectionId: "offer", heading: "The offer: four components", helper: "Prepare & Prevent / Respond & Recover, each across essential services and livelihoods.", fields: ["offer.blocks"], Component: OfferBlocksStep },
  { id: "investmentNarrative", sectionId: "investment", heading: "The investment", fields: [
      "investment.totalAmountUsdMillions", "investment.durationLabel", "investment.districtsLabel", "investment.provincesLabel", "investment.selectionCriteria",
    ], Component: InvestmentNarrativeStep },
  { id: "investmentTable", sectionId: "investment", heading: "Indicative investment allocation", helper: "Totals are calculated automatically.", fields: ["investment.periodLabels", "investment.rows"], Component: InvestmentTableStep },
  { id: "roiOverall", sectionId: "roi", heading: "What success looks like in 24-36 months", fields: ["returnOnInvestment.overallImpact"], Component: RoiOverallStep },
  { id: "roiGroups", sectionId: "roi", heading: "Return on investment: outcome groups", fields: ["returnOnInvestment.outcomeGroups"], Component: RoiGroupsStep },
  { id: "contact", sectionId: "contact", heading: "For more information, contact...", fields: ["contact.name", "contact.email", "contact.link"], Component: ContactStep },
  { id: "review", sectionId: "review", heading: "Review your submission", fields: [], Component: ReviewStep },
];

export function firstStepIndexForSection(sectionId: string): number {
  return STEPS.findIndex((s) => s.sectionId === sectionId);
}
