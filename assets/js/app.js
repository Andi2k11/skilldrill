// app.js - module loader for small page scripts
// Intentionally kept minimal: it loads modular JS files via script tags when needed.
(function(){
  // no-op; kept as an entry point for future initialisation
})();

// Auto-start demo runner when page loads
document.addEventListener('DOMContentLoaded', function(){
  if(window.location.pathname.indexOf('index.html') !== -1 || window.location.pathname === '/' ){
    var runner = new window.ExerciseRunner();
    // load the exercise JSON we added
    runner.load('/exercises/multiplication-by-10-100-1000.json').then(function(r){
      r.bind();
      r.render();
      // expose for debug
      window._currentRunner = r;
    }).catch(function(err){ console && console.error && console.error('Runner load error', err); });
  }
});
