import Shell from "@/layouts/Shell";

export default function Home(){
  return (
    <Shell title="Domov" rightLink={{to:"/settings", label:"Nastavenia"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-start gap-4">
          <img src="https://via.placeholder.com/80x80.png?text=JA" alt="Profil" className="h-20 w-20 rounded-full object-cover border border-gray-200"/>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Ahoj,</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">Ján Novák</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <p className="text-xs text-gray-600">Predplatné</p>
                <p className="text-sm font-semibold text-green-700">Aktívne</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <p className="text-xs text-gray-600">Platné do</p>
                <p className="text-sm font-semibold text-gray-900">31. 12. 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Postup učenia</h2>
        <div className="flex items-center gap-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:"42%"}} />
          </div>
          <span className="text-sm font-semibold text-gray-900">42%</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Videli ste <span className="font-semibold text-gray-900">420</span> z <span className="font-semibold text-gray-900">1000</span> otázok.
          Zostáva <span className="font-semibold text-gray-900">580</span> otázok (58%).
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Priemerné skóre (posledných 5 testov)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {s:"Anatómia",v:86},
            {s:"Fyziológia",v:74},
            {s:"Biochémia",v:68},
            {s:"Patológia",v:92},
          ].map(x=>(
            <div key={x.s} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{x.s}</p>
                <span className="text-sm font-bold text-gray-900">{x.v}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:`${x.v}%`}} />
              </div>
              <p className="mt-2 text-xs text-gray-600">Počítané z posledných 5 písomiek.</p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
