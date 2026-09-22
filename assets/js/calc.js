// calc.js - calculator button wiring for the .calc-grid and #answer-input
document.addEventListener('DOMContentLoaded', function(){
  var grid = document.querySelector('.calc-grid');
  var input = document.getElementById('answer-input');
  if(!grid || !input) return;
  grid.addEventListener('click', function(e){
    var btn = e.target.closest('button');
    if(!btn) return;
    var val = btn.textContent.trim();
    if(val === '⌫'){
      var pos = input.selectionStart || input.value.length;
      input.value = input.value.slice(0,pos-1) + input.value.slice(pos);
      input.selectionStart = input.selectionEnd = Math.max(0,pos-1);
      return;
    }
    if(val === 'C'){
      input.value = '';
      return;
    }
    if(val === '<'){
      input.selectionStart = Math.max(0,(input.selectionStart||0)-1);
      input.selectionEnd = input.selectionStart;
      return;
    }
    if(val === '>'){
      input.selectionStart = Math.min(input.value.length,(input.selectionStart||0)+1);
      input.selectionEnd = input.selectionStart;
      return;
    }
    if(val === 'Svar'){
      input.dispatchEvent(new CustomEvent('answer-submit',{bubbles:true}));
      return;
    }
    var pos = input.selectionStart || input.value.length;
    input.value = input.value.slice(0,pos) + val + input.value.slice(pos);
    input.selectionStart = input.selectionEnd = pos + val.length;
  });
});
