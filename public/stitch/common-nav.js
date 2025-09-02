(function () {
  // Don't show nav on the Auth screen
  if (/\/stitch\/auth\.html$/.test(location.pathname)) return;

  // Remove existing bottom navs (if any) to avoid duplicates
  try {
    Array.from(document.querySelectorAll('nav')).forEach(function (n) {
      var cs = getComputedStyle(n);
      var isBottom =
        (cs.position === 'fixed' || cs.position === 'sticky') &&
        (n.className.includes('bottom-0') || cs.bottom === '0px');
      if (isBottom) n.remove();
    });
  } catch (e) {}

  // Work out which tab is active
  var p = location.pathname;
  var active = 'home';
  if (p.includes('/profile')) active = 'settings';
  else if (
    p.includes('/subjects') ||
    p.includes('/mode') ||
    p.includes('/learning') ||
    p.includes('/test') ||
    p.includes('/results') ||
    p.includes('/home') // treat Home as its own tab, but keep practice active on practice pages
  ) {
    active = p.includes('/home') ? 'home' : 'practice';
  }

  // Build standardized 3-item nav
  var aBase = 'flex flex-col items-center justify-center gap-1';
  var activeWrap = 'rounded-t-lg bg-blue-500 px-3 text-white';
  function tab(href, isActive, label, svg) {
    return (
      '<a href="' + href + '" class="' +
      aBase + ' ' + (isActive ? activeWrap : 'text-gray-600 hover:text-blue-600') +
      '" aria-current="' + (isActive ? 'page' : 'false') + '">' +
      svg +
      '<span class="text-xs ' + (isActive ? 'font-bold' : 'font-medium') + '">' + label + '</span>' +
      '</a>'
    );
  }

  var homeSvg = '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="m3 12 8-8 8 8v8a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/></svg>';
  var practiceSvg = '<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>';
  var settingsSvg = '<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z"/></svg>';

  var nav = document.createElement('nav');
  nav.id = 'stitch-global-nav';
  nav.className = 'fixed bottom-0 z-50 w-full border-t border-gray-200 bg-white';
  nav.innerHTML =
    '<div class="max-w-3xl mx-auto h-16 flex justify-around">' +
      tab('/stitch/home.html', active === 'home', 'Domov', homeSvg) +
      tab('/stitch/mode.html', active === 'practice', 'Učenie/Test', practiceSvg) +
      tab('/stitch/profile.html', active === 'settings', 'Nastavenia', settingsSvg) +
    '</div>';

  document.body.appendChild(nav);

  // Add spacing so content isn't covered by the fixed nav
  var spacer = document.createElement('div');
  spacer.style.height = '4rem';
  document.body.appendChild(spacer);
})();
