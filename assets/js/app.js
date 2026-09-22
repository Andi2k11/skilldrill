// app.js - module loader for small page scripts
// Intentionally kept minimal: it loads modular JS files via script tags when needed.
(function(){
  // no-op; kept as an entry point for future initialisation
})();

// Auto-start demo runner when page loads
document.addEventListener('DOMContentLoaded', function(){
  if(window.location.pathname.indexOf('index.html') !== -1 || window.location.pathname === '/' ){
    var runner = new window.ExerciseRunner();
    // read exercise parameter from URL: ?exercise=path-or-id
    var params = new URLSearchParams(location.search);
    var ex = params.get('exercise');
    var path = '/exercises/multiplication-by-10-100-1000.json';
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
    runner.load(path).then(function(r){
      r.bind();
      r.render();
      // expose for debug
      window._currentRunner = r;
    }).catch(function(err){ console && console.error && console.error('Runner load error', err); });
  }
});
