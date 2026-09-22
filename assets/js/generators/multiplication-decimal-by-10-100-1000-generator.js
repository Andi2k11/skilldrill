// Wrapper generator file matching expected filename
window.multiplicationGenerators = window.multiplicationGenerators || {};

// Reuse implementation from multiplication-decimal-generator.js
(function(){
  // If the main implementation is already present, nothing to do.
  if(window.multiplicationGenerators['multiplication-decimal-by-10-100-1000']) return;

  // Fallback: load the implementation script dynamically
  var src = '/assets/js/generators/multiplication-decimal-generator.js';
  var s = document.createElement('script');
  s.src = src;
  s.async = false;
  document.head.appendChild(s);
})();
