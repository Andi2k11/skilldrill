// Alias file so dynamic loader can find generator by exact type name
// Reuse the canonical implementation in multiplication-decimal-generator.js
window.multiplicationGenerators = window.multiplicationGenerators || {};

// If implementation already registered, do nothing
if(!window.multiplicationGenerators['multiplication-decimal-by-10-100-1000']){
  var s = document.createElement('script');
  s.src = '/assets/js/generators/multiplication-decimal-generator.js';
  s.async = false;
  document.head.appendChild(s);
}
