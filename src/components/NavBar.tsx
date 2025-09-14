import { NavLink } from "react-router-dom";

const item = "flex flex-col items-center justify-center py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold";
const active = "text-[var(--md-primary-blue)] border-blue-200 bg-blue-50";

export default function NavBar(){
  const link = (to:string, label:string) => (
    <NavLink
      to={to}
      className={({isActive}) => `${item} ${isActive ? active : ""}`}
    >{label}</NavLink>
  );
  return (
    <nav id="stitch-global-nav" className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200">
      <div className="mx-auto max-w-4xl p-3 grid grid-cols-3 gap-3">
        {link("/home","Domov")}
        {link("/mode","Učenie/Test")}
        {link("/settings","Nastavenia")}
      </div>
    </nav>
  );
}
