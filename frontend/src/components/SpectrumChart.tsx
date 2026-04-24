import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SpectrumPayload } from "../types";

interface Props {
  spectrum: SpectrumPayload | null;
}

export default function SpectrumChart({ spectrum }: Props) {
  const data = useMemo(() => {
    if (!spectrum) return [];
    return spectrum.wavelengths.map((w, i) => ({
      wavelength: w,
      intensity: spectrum.intensities[i],
    }));
  }, [spectrum]);

  const peakCount = spectrum?.peak_wavelengths.length ?? 0;

  return (
    <section className="panel p-5 md:p-6 flex flex-col gap-4 h-full min-h-[360px]">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="eyebrow">SPEC/ 400-700 NM</div>
          <h2 className="display text-bone text-3xl md:text-4xl mt-2">
            Reflectance Signature
          </h2>
          <p className="mono text-[11px] tracking-wider text-ash mt-1">
            {spectrum
              ? `Sample ${spectrum.sample_id} - ${peakCount} peaks detected`
              : "Awaiting first acquisition"}
          </p>
        </div>
        <PeakLegend count={peakCount} />
      </header>

      <div className="tick-rule" />

      <div
        className="flex-1 chart-reveal"
        key={spectrum?.sample_id ?? "empty"}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 12, left: 0 }}
          >
            <CartesianGrid
              stroke="#3A2A1B"
              strokeDasharray="2 6"
              vertical={false}
            />
            <XAxis
              dataKey="wavelength"
              stroke="#6F5E4A"
              tick={{ fontFamily: "JetBrains Mono", fontSize: 10, fill: "#BEA888" }}
              tickFormatter={(v: number) => Math.round(v).toString()}
              tickLine={{ stroke: "#54402C" }}
              axisLine={{ stroke: "#3A2A1B" }}
              label={{
                value: "WAVELENGTH / NM",
                position: "insideBottom",
                offset: -4,
                fill: "#6F5E4A",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
                letterSpacing: "0.22em",
              }}
            />
            <YAxis
              stroke="#6F5E4A"
              tick={{ fontFamily: "JetBrains Mono", fontSize: 10, fill: "#BEA888" }}
              tickFormatter={(v: number) => v.toFixed(0)}
              tickLine={{ stroke: "#54402C" }}
              axisLine={{ stroke: "#3A2A1B" }}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: "#0B0806",
                border: "1px solid #54402C",
                borderRadius: 1,
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
              itemStyle={{ color: "#EFE3D0" }}
              labelStyle={{ color: "#BEA888" }}
              labelFormatter={(v: number) => `${v.toFixed(1)} nm`}
              formatter={(v: number) => v.toFixed(1)}
            />
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="#11BFB5"
              dot={false}
              strokeWidth={1.75}
              isAnimationActive={false}
            />
            {spectrum?.peak_wavelengths.map((wl, i) => (
              <ReferenceDot
                key={`${wl}-${i}`}
                x={wl}
                y={spectrum.peak_intensities[i]}
                r={3.5}
                fill="#EFE3D0"
                stroke="#11BFB5"
                strokeWidth={1.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function PeakLegend({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 text-right">
      <div>
        <div className="eyebrow-dim">Peaks</div>
        <div className="display text-bone text-3xl leading-none mt-1">
          {count.toString().padStart(2, "0")}
        </div>
      </div>
      <div className="w-px h-8 bg-dusk" />
      <div className="flex flex-col items-start gap-1">
        <span className="flex items-center gap-2 mono text-[10px] tracking-[0.22em] uppercase text-sand">
          <span className="w-4 h-px bg-rust" />
          Curve
        </span>
        <span className="flex items-center gap-2 mono text-[10px] tracking-[0.22em] uppercase text-sand">
          <span className="w-2 h-2 rounded-full border border-rust bg-bone" />
          Peak
        </span>
      </div>
    </div>
  );
}
