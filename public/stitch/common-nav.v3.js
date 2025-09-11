(function(){
  try{
    if (document.getElementById('stitch-global-nav')) return;

    const p = (location.pathname || '').toLowerCase();

    const isSettings = /\/stitch\/settings(?:\.html)?$/.test(p);
    const isHome     = /\/stitch\/home(?:\.html)?$/.test(p) || /\/stitch\/$/.test(p);
    const isLearn    = /(subjects|mode|learning|test|results|review)\.html$/.test(p) || /(subjects|mode|learning|test|results|review)\/?$/.test(p);

    let active = '';
    if (isSettings) active = 'settings';
    else if (isLearn) active = 'learn';
    else if (isHome) active = 'home';

    const base   = 'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl border transition';
    const activeC   = 'border-blue-600 text-blue-700 bg-blue-50';
    const inactiveC = 'border-transparent text-gray-600 hover:bg-gray-50';

    const ac = (k) => (active === k ? activeC : inactiveC);
    const aria = (k) => (active === k ? 'aria-current="page"' : '');

    const nav = document.createElement('nav');
    nav.id = 'stitch-global-nav';
    nav.className = 'fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200';
    nav.innerHTML = `
      <div class="mx-auto max-w-4xl px-4">
        <div class="grid grid-cols-3 gap-2 py-2">
          <a href="/stitch/home.html" ${aria('home')} class="${base} ${ac('home')}" data-tab="home">
            <span class="text-sm font-semibold">Domov</span>
          </a>
          <a href="/stitch/mode.html" ${aria('learn')} class="${base} ${ac('learn')}" data-tab="learn">
            <span class="text-sm font-semibold">Učenie/Test</span>
          </a>
          <a href="/stitch/settings.html" ${aria('settings')} class="${base} ${ac('settings')}" data-tab="settings">
            <span class="text-sm font-semibold">Nastavenia</span>
          </a>
        </div>
      </div>
    `;

    // Avoid overlapping other fixed elements near bottom
    document.body.style.paddingBottom = '84px';
    document.body.appendChild(nav);
  }catch(e){
    console && console.error && console.error('common-nav init failed:', e);
  }
})();
