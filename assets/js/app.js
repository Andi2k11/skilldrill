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
    var defaultPath = '/exercises/multiplication-by-10-100-1000.json';
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
    if(ex){
      // if user passed a filename with .json or an absolute path, use it; otherwise map id -> exercises/{id}.json
      if(ex.indexOf('.json') !== -1 || ex.charAt(0) === '/') path = ex;
      else path = '/exercises/' + ex + '.json';
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

    // Main flow: if an exercise is requested, fetch its JSON first to determine generator
    if(ex){
      fetch(path).then(function(res){
        if(!res.ok) throw new Error('Failed to fetch exercise JSON');
        return res.json();
      }).then(function(cfg){
        var gtype = cfg && cfg.generator && cfg.generator.type;
        if(gtype){
          // map generator type to expected script path
          var genPath = '/assets/js/generators/' + gtype + '.js';
          return loadScript(genPath).then(function(){ return cfg; });
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
        // fallback: still try to load default runner if possible
        try{
          var runner = new window.ExerciseRunner();
          runner.load(defaultPath).then(function(r){ r.bind(); r.render(); window._currentRunner = r; });
        }catch(e){}
      });
    } else {
      // No explicit exercise — do not auto-load generator; load default exercise instead
      var runner = new window.ExerciseRunner();
      runner.load(path).then(function(r){ r.bind(); r.render(); window._currentRunner = r; }).catch(function(err){ console && console.error && console.error('Runner load error', err); });
    }
  }
});
