import { Biosignatures } from "../types";

interface Props {
  bio: Biosignatures | null;
}

const MARKERS: Array<{
  key: keyof Omit<Biosignatures, "confidence" | "interpretation">;
  label: string;
  band: string;
}> = [
  { key: "chlorophyll", label: "Chlorophyll", band: "430 / 660 nm" },
  { key: "carotenoids", label: "Carotenoids", band: "450-550 nm" },
  { key: "organics", label: "Organics", band: "400-450 nm" },
];

export default function ConfidenceBadge({ bio }: Props) {
  return (
    <section className="panel p-6 md:p-8 h-full flex flex-col overflow-hidden relative">
      <div>
        <h2 className="display text-bone text-lg md:text-xl tracking-tight">
          Surface biosignals
        </h2>
        <div className="tick-rule mt-3 mb-4" />
        <ul className="grid grid-cols-3 gap-4">
          {MARKERS.map(({ key, label, band }) => {
            const present = bio?.[key];
            return (
              <li key={key} className="flex flex-col gap-1">
                <span
                  className={`mono text-[10px] tracking-[0.25em] uppercase ${
                    present ? "text-sage" : "text-ash"
                  }`}
                >
                  {present ? "\u25cf PRESENT" : "\u25cb ABSENT"}
                </span>
                <span className="display text-bone text-lg leading-tight">
                  {label}
                </span>
                <span className="mono text-[10px] tracking-wider text-ash">
                  {band}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
