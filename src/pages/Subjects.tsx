import Shell from "@/layouts/Shell";
export default function Subjects(){
  const items = [
    {name:"Anatómia", seen:40, total:100},
    {name:"Fyziológia", seen:22, total:80},
    {name:"Biochémia", seen:55, total:120},
  ];
  return (
    <Shell title="Predmety">
      <div className="grid grid-cols-1 gap-3">
        {items.map(x=>{
          const pct = Math.round(x.seen*100/x.total);
          return (
            <section key={x.name} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{x.name}</p>
                <span className="text-sm font-bold text-gray-900">{pct}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:`${pct}%`}} />
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
