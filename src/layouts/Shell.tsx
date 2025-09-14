import { PropsWithChildren } from "react";
import NavBar from "@/components/NavBar";
import { Link } from "react-router-dom";

type Props = { title: string; rightLink?: { to:string; label:string } };
export default function Shell({ title, rightLink, children }: PropsWithChildren<Props>){
  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl p-4 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold leading-tight tracking-tight">{title}</h1>
          {rightLink ? <Link className="text-sm font-semibold text-[var(--md-primary-blue)] hover:underline" to={rightLink.to}>{rightLink.label}</Link> : <span />}
        </div>
      </header>
      <main className="mx-auto max-w-4xl w-full p-4 space-y-6">{children}</main>
      <div style={{height:72}} />
      <NavBar/>
    </div>
  );
}
