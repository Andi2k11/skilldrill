// calc.js - calculator button wiring for the .calc-grid and #answer-input
document.addEventListener('DOMContentLoaded', function(){
  var grid = document.querySelector('.calc-grid');
  var input = document.getElementById('answer-input');
  if(!grid || !input) return;

  var caretMode = false; // when true, next digits become superscript
  var supMap = {
    '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    '-':'⁻','+':'⁺',',':'·','(':'⁽',')':'⁾'
  };

  grid.addEventListener('click', function(e){
    var btn = e.target.closest('button');
    if(!btn) return;
    var val = btn.textContent.trim();

    if(val === '^'){
      // enter caret/superscript mode
      caretMode = true;
      return;
    }

    if(val === '⌫'){
      var pos = input.selectionStart || input.value.length;
      input.value = input.value.slice(0,pos-1) + input.value.slice(pos);
      input.selectionStart = input.selectionEnd = Math.max(0,pos-1);
      caretMode = false;
      return;
    }
    if(val === 'C'){
      input.value = '';
      caretMode = false;
      return;
    }
    if(val === '<'){
      input.selectionStart = Math.max(0,(input.selectionStart||0)-1);
      input.selectionEnd = input.selectionStart;
      caretMode = false;
      return;
    }
    if(val === '>'){
      input.selectionStart = Math.min(input.value.length,(input.selectionStart||0)+1);
      input.selectionEnd = input.selectionStart;
      caretMode = false;
      return;
    }
    if(val === 'Svar'){
      input.dispatchEvent(new CustomEvent('answer-submit',{bubbles:true}));
      caretMode = false;
      return;
    }

    var insert = val;
    // If in caretMode and user clicked a digit or supported char, insert superscript
    if(caretMode){
      if(val.length === 1 && supMap[val]){
        insert = supMap[val];
        // stay in caretMode to allow multiple superscript chars
      } else {
        // not a supported superscript char -> insert as-is and exit caretMode
        caretMode = false;
      }
    }

    var pos = input.selectionStart || input.value.length;
    input.value = input.value.slice(0,pos) + insert + input.value.slice(pos);
    input.selectionStart = input.selectionEnd = pos + insert.length;
  });
});
