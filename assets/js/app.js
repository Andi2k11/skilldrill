// app.js - module loader for small page scripts
// Intentionally kept minimal: it loads modular JS files via script tags when needed.
(function(){
  // no-op; kept as an entry point for future initialisation
})();

// Auto-start demo runner when page loads
document.addEventListener('DOMContentLoaded', function(){
  if(window.location.pathname.indexOf('index.html') !== -1 || window.location.pathname === '/' ){
    // read exercise parameter from URL: ?exercise=path-or-id
    var params = new URLSearchParams(location.search);
    var ex = params.get('exercise');
    var defaultPath = 'exercises/multiplication-by-10-100-1000.json';
    var path = defaultPath;

    if(!ex){
      // show a short default notice in the UI when no ?exercise= is provided
      try{
        var qt = document.querySelector('.question-card .question-title');
        var qs = document.querySelector('.question-card .question-text');
        if(qt) qt.textContent = 'Standardövning';
        if(qs) qs.textContent = 'Ingen övning angiven. Standardövning laddas automatiskt.';
      }catch(e){}
    }

    // Helper: load a script dynamically and resolve when loaded or reject on error
    function loadScript(src){
      return new Promise(function(resolve, reject){
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = function(){ resolve(); };
        s.onerror = function(e){ reject(new Error('Failed to load ' + src)); };
        document.head.appendChild(s);
      });
    }

    // Main flow: if an exercise is requested, resolve its path (via manifest or fallback) and load it
    if(ex){
      // Determine path: if ex is a JSON filename or absolute path, use directly; otherwise resolve via manifest then fallback
      if(ex.indexOf('.json') !== -1 || ex.charAt(0) === '/'){
        path = ex.indexOf('.json') !== -1 ? '/' + ex.replace(/^\//,'') : ex;
      } else {
        path = null; // will be resolved below
      }

      var ensureLoad = function(p){
        return fetch(p).then(function(res){ if(!res.ok) throw new Error('Failed to fetch exercise JSON'); return res.json(); });
      };

      var loadPromise;
      if(path){
        console.debug('[app] loading direct path:', path);
        loadPromise = ensureLoad(path).then(function(cfg){ return { cfg: cfg, path: path }; });
      } else {
        console.debug('[app] resolving via manifest or fallback for:', ex);
        loadPromise = fetch('exercises/manifest.json').then(function(r){ console.debug('[app] manifest fetch url:', r.url, 'status:', r.status); if(!r.ok) throw new Error('Failed to fetch manifest'); return r.json(); }).then(function(man){
          var entry = (man || []).find(function(it){ return it.id === ex || it.slug === ex; });
          if(entry && entry.path){ console.debug('[app] manifest matched entry:', entry); return ensureLoad(entry.path).then(function(cfg){ return { cfg: cfg, path: entry.path }; }); }
          console.debug('[app] manifest did not match, falling back to exercises/' + ex + '.json');
          return ensureLoad('exercises/' + ex + '.json').then(function(cfg){ return { cfg: cfg, path: 'exercises/' + ex + '.json' }; });
        });
      }

      loadPromise.then(function(res){
        var cfg = res.cfg;
        path = res.path;
        console.debug('[app] resolved exercise path ->', path);
        var gtype = cfg && cfg.generator && cfg.generator.type;
        if(gtype){
          var genExact = 'assets/js/generators/gen-' + gtype + '.js';
          var genPath1 = 'assets/js/generators/' + gtype + '.js';
          var genPath2 = 'assets/js/generators/' + gtype + '-generator.js';
          var genPathGenSuffix = 'assets/js/generators/' + gtype + '-gen.js';
          var fallbackBase = gtype.replace(/-by-.+$/,'-generator');
          var genPathFallback = 'assets/js/generators/' + fallbackBase + '.js';
          console.debug('[app] trying generator scripts:', genExact, genPath1, genPath2, genPathGenSuffix, genPathFallback);
          return loadScript(genExact)
            .then(function(){ console.debug('[app] loaded', genExact); })
            .catch(function(err){ console.debug('[app] failed to load', genExact, err); return loadScript(genPath1).then(function(){ console.debug('[app] loaded', genPath1); }).catch(function(err){ console.debug('[app] failed to load', genPath1, err); return loadScript(genPath2).then(function(){ console.debug('[app] loaded', genPath2); }).catch(function(err){ console.debug('[app] failed to load', genPath2, err); return loadScript(genPathGenSuffix).then(function(){ console.debug('[app] loaded', genPathGenSuffix); }).catch(function(err){ console.debug('[app] failed to load', genPathGenSuffix, err); return loadScript(genPathFallback).then(function(){ console.debug('[app] loaded', genPathFallback); }).catch(function(err){ console.debug('[app] failed to load', genPathFallback, err); throw err; }); }); }); });
            .then(function(){ return cfg; });
        }
        return cfg;
      }).then(function(cfg){
        var runner = new window.ExerciseRunner();
        runner.load(path).then(function(r){
          r.bind();
          r.render();
          window._currentRunner = r;
        }).catch(function(err){ console && console.error && console.error('Runner load error', err); });
      }).catch(function(err){
        console && console.error && console.error('Exercise init error', err);
        try{
          var runner = new window.ExerciseRunner();
          runner.load(defaultPath).then(function(r){ r.bind(); r.render(); window._currentRunner = r; });
        }catch(e){}
      });
    } else {
      var runner = new window.ExerciseRunner();
      runner.load(path).then(function(r){ r.bind(); r.render(); window._currentRunner = r; }).catch(function(err){ console && console.error && console.error('Runner load error', err); });
    }
  }
});
