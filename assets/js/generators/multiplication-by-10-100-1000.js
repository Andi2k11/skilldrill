// Alias for multiplication generator so dynamic loader finds exact type filename
window.multiplicationGenerators = window.multiplicationGenerators || {};
if(!window.multiplicationGenerators['multiplication-by-10-100-1000']){
  var s = document.createElement('script');
  s.src = '/assets/js/generators/multiplication-generator.js';
  s.async = false;
  document.head.appendChild(s);
}
