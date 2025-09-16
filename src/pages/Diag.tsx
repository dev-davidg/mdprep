import { useEffect, useState } from "react";
import Shell from "@/layouts/Shell";
import { supabase } from "@/lib/supabase";

type Row = { id:string; name:string; description?:string|null };

export default function Diag(){
  const [envOk, setEnvOk] = useState<{hasUrl:boolean; hasKey:boolean; urlHost:string|null}>({hasUrl:false, hasKey:false, urlHost:null});
  const [authState, setAuthState] = useState<{userId:string|null; error:string|null}>({userId:null, error:null});
  const [cats, setCats] = useState<{rows:Row[]; error:string|null; status:string}>({rows:[], error:null, status:"not-run"});

  useEffect(()=>{
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    let host: string | null = null;
    try { host = url ? new URL(url).host : null; } catch {}
    setEnvOk({ hasUrl: !!url, hasKey: !!key, urlHost: host });

    (async ()=>{
      // Auth block
      if (!supabase) {
        setAuthState({ userId: null, error: "supabase client is NULL (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY?)" });
      } else {
        try {
          const { data, error } = await supabase.auth.getUser();
          setAuthState({ userId: data.user?.id ?? null, error: error?.message ?? null });
        } catch (e:any) {
          setAuthState({ userId: null, error: e?.message ?? String(e) });
        }
      }

      // Categories block
      if (!supabase) {
        setCats({ rows:[], error: "supabase client is NULL", status:"skipped" });
      } else {
        try {
          const { data, error, status } = await supabase.from("categories").select("id,name,description").order("name");
          if (error) setCats({ rows:[], error: error.message, status: String(status) });
          else setCats({ rows:(data as Row[]) ?? [], error:null, status: String(status) });
        } catch (e:any) {
          setCats({ rows:[], error: e?.message ?? String(e), status: "thrown" });
        }
      }
    })();
  },[]);

  return (
    <Shell title="Diagnostika" rightLink={{to:"/mode", label:"Späť na výber"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Env</h2>
        <ul className="text-sm text-gray-800 space-y-1">
          <li><b>VITE_SUPABASE_URL present:</b> {String(envOk.hasUrl)} {envOk.urlHost ? `(${envOk.urlHost})` : ""}</li>
          <li><b>VITE_SUPABASE_ANON_KEY present:</b> {String(envOk.hasKey)}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Auth</h2>
        <ul className="text-sm text-gray-800 space-y-1">
          <li><b>userId:</b> {authState.userId ?? "null"}</li>
          <li><b>error:</b> {authState.error ?? "null"}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Categories query</h2>
        <ul className="text-sm text-gray-800 space-y-1">
          <li><b>status:</b> {cats.status}</li>
          <li><b>error:</b> {cats.error ?? "null"}</li>
          <li><b>rows:</b> {cats.rows.length}</li>
        </ul>
        <pre className="mt-2 bg-gray-50 rounded p-2 text-xs overflow-auto">{JSON.stringify(cats.rows, null, 2)}</pre>
      </section>
    </Shell>
  );
}
