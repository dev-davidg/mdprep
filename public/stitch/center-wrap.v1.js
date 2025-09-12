(function(){
  try{
    if (document.getElementById('stitch-center-wrap')) return;
    var body = document.body;
    var nav = document.getElementById('stitch-global-nav');
    var wrap = document.createElement('div');
    wrap.id = 'stitch-center-wrap';
    wrap.className = 'mx-force-center page-fade';

    var kids = Array.from(body.children);
    kids.forEach(function(node){
      if (node === nav) return;
      if (node.tagName && node.tagName.toLowerCase() === 'script') return;
      wrap.appendChild(node);
    });

    if (nav) body.insertBefore(wrap, nav);
    else body.appendChild(wrap);

    // Nudge SW to refresh itself (does nothing if not present)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(function(rs){ rs.forEach(function(r){ r && r.update && r.update(); }); });
    }
  }catch(e){}
})();
