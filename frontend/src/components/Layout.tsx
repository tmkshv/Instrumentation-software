import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Callsign from "./deco/Callsign";

export default function Layout() {
  const { logout, authRequired } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `mono text-[11.5px] tracking-[0.22em] uppercase px-3 py-1 border-b transition-colors ${
      isActive
        ? "text-bone border-rust"
        : "text-ash border-transparent hover:text-sand hover:border-dusk"
    }`;

  return (
    <div className="min-h-full flex flex-col relative">
      {/* Brand bar */}
      <header className="relative z-10 px-6 md:px-10 pt-5 pb-3">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <img
              src="/husky-logo.png"
              alt="Husky Robotics"
              className="brand-mark w-16 h-16 object-contain shrink-0"
            />
            <div className="hidden sm:block">
              <div className="eyebrow">URC 2025 / Science</div>
              <div className="mono text-[11px] tracking-[0.22em] uppercase text-sand mt-1">
                Operator Console
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Deck
            </NavLink>
            <NavLink to="/sessions" className={linkClass}>
              Log
            </NavLink>
            {authRequired && (
              <button
                onClick={logout}
                className="mono text-[11.5px] tracking-[0.22em] uppercase px-3 py-1 text-ash hover:text-blood ml-2"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Callsign strip - ticker under the brand */}
      <div className="px-6 md:px-10 pb-3">
        <div className="tick-rule mb-2" />
        <Callsign />
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 px-6 md:px-10 pb-10">
        <Outlet />
      </main>

      {/* Footer callsign */}
      <footer className="relative z-10 px-6 md:px-10 pb-5">
        <div className="tick-rule mb-2" />
        <div className="flex items-center justify-between text-ash mono text-[10px] tracking-[0.3em] uppercase">
          <span>Biosignature Survey / Mars Analog</span>
          <span>Husky Robotics / v0.1</span>
        </div>
      </footer>
    </div>
  );
}
