// cachebust.js - append a short timestamp query to site CSS to bust cache
(function(){
  try{
    var link = document.getElementById('site-css');
    if(!link) return;
    var url = new URL(link.getAttribute('href'), location.origin);
    var ts = new Date();
    var ver = ts.getFullYear().toString() + ('0'+(ts.getMonth()+1)).slice(-2) + ('0'+ts.getDate()).slice(-2) + 'T' + ('0'+ts.getHours()).slice(-2) + ('0'+ts.getMinutes()).slice(-2);
    url.searchParams.set('v', ver);
    link.setAttribute('href', url.toString());
  }catch(e){console && console.warn && console.warn('cache-buster failed', e);} 
})();
