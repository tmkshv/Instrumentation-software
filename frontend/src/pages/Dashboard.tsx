import { useEffect, useState } from "react";
import { api } from "../api/client";
import CameraFeed from "../components/CameraFeed";
import ChemPanel from "../components/ChemPanel";
import ConfidenceBadge from "../components/ConfidenceBadge";
import ControlBar, { ControlAction } from "../components/ControlBar";
import SpectrumChart from "../components/SpectrumChart";
import { usePolling } from "../hooks/usePolling";
import {
  CameraInfo,
  ChemReading,
  SpectrumPayload,
  SystemStatus,
} from "../types";

interface Envelope<T> {
  status: "ok" | "no_data";
  data?: T;
}

export default function Dashboard() {
  const [statusBump, setStatusBump] = useState(0);
  const [controlAction, setControlAction] = useState<ControlAction | null>(null);
  const [chemLatestEnv, setChemLatestEnv] = useState<Envelope<ChemReading> | null>(null);
  const [chemHistory, setChemHistory] = useState<ChemReading[]>([]);

  const cameras =
    usePolling(() => api.get<{ cameras: CameraInfo[] }>("/api/cameras"), 10_000) ?? {
      cameras: [],
    };

  const status = usePolling<SystemStatus>(
    () => api.get<SystemStatus>("/api/status"),
    2_000,
    [statusBump],
  );

  const spectrumEnv = usePolling<Envelope<SpectrumPayload>>(
    () => api.get<Envelope<SpectrumPayload>>("/api/spectrum/latest"),
    1_000,
  );
  const spectrum = spectrumEnv?.data ?? null;

  const isRunning = status?.status === "running";

  useEffect(() => {
    if (!isRunning) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const latestRes = await api.get<Envelope<ChemReading>>("/api/chem/latest");
        const histRes = await api.get<{ status: string; data: ChemReading[] }>(
          "/api/chem/history?minutes=5",
        );
        if (cancelled) return;
        setChemLatestEnv(latestRes);
        setChemHistory(histRes?.data ?? []);
      } catch {
        /* keep last values */
      }
    };
    tick();
    const id = window.setInterval(tick, 1_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!controlAction) return;
    if (controlAction !== "sample") {
      setControlAction(null);
      return;
    }
    if (status?.status === "running") {
      setControlAction(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const latestRes = await api.get<Envelope<ChemReading>>("/api/chem/latest");
        const reading = latestRes?.data ?? null;
        if (cancelled) return;
        setChemLatestEnv(latestRes);
        setChemHistory(reading ? [reading] : []);
      } catch {
        /* keep */
      } finally {
        if (!cancelled) setControlAction(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [controlAction, status?.status]);

  return (
    <div className="stagger flex flex-col gap-5" style={{ ["--stagger" as string]: "70ms" }}>
      <div style={{ ["--i" as string]: 0 }}>
        <ControlBar
          status={status}
          onChanged={(action) => {
            setStatusBump((n) => n + 1);
            setControlAction(action);
          }}
        />
      </div>

      {/* Hero: surface biosignals + spectrum in an asymmetric 5+7 column grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
        style={{ ["--i" as string]: 1 }}
      >
        <div className="lg:col-span-5 order-2 lg:order-1">
          <ConfidenceBadge bio={spectrum?.biosignatures ?? null} />
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2">
          <SpectrumChart spectrum={spectrum} />
        </div>
      </div>

      {/* Camera bank */}
      <div style={{ ["--i" as string]: 2 }}>
        <SectionHeader eyebrow="Optical / Live" title="Field of View" />
        {cameras.cameras.length === 0 ? (
          <EmptyCameras />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {cameras.cameras.map((c, i) => (
              <CameraFeed key={c.id} camera={c} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Chem strip */}
      <div style={{ ["--i" as string]: 3 }}>
        <ChemPanel latest={chemLatestEnv?.data ?? null} history={chemHistory} />
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="display text-bone text-2xl mt-1">{title}</h2>
    </div>
  );
}

function EmptyCameras() {
  return (
    <div className="panel p-6 text-sand">
      <div className="flex items-start gap-4">
        <div className="mono text-rust text-xl leading-none pt-1">[ ]</div>
        <div>
          <p className="display text-bone text-xl">No optical channels bound.</p>
          <p className="mono text-xs text-ash mt-2 tracking-wider">
            Set <code className="text-sand">HUSKY_CAMERAS</code> in{" "}
            <code className="text-sand">.env</code>
            , for example{" "}
            <code className="text-sand">microscope:0,overview:1</code>, then restart
            uvicorn.
          </p>
        </div>
      </div>
    </div>
  );
}
