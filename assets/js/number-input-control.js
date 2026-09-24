// number-input-control.js - input control wiring for the .calc-grid and #answer-input
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

    // treat several representations of the exponent-toggle button as the same
    if(/^(\^|x\s*\u2079|x\s*n|xn)$/i.test(val)){
      // toggle caret/superscript mode
      caretMode = !caretMode;
      if(caretMode){
        grid.classList.add('sup-active');
        btn.classList.add('active');
      } else {
        grid.classList.remove('sup-active');
        btn.classList.remove('active');
      }
      return;
    }

    if(val === '⌫'){
      var pos = input.selectionStart || input.value.length;
      input.value = input.value.slice(0,pos-1) + input.value.slice(pos);
      input.selectionStart = input.selectionEnd = Math.max(0,pos-1);
      // keep caretMode if active (user asked: while active, continue inserting superscript)
      return;
    }
    if(val === 'C'){
      input.value = '';
      // keep caretMode
      return;
    }
    if(val === '<'){
      input.selectionStart = Math.max(0,(input.selectionStart||0)-1);
      input.selectionEnd = input.selectionStart;
      // keep caretMode
      return;
    }
    if(val === '>'){
      input.selectionStart = Math.min(input.value.length,(input.selectionStart||0)+1);
      input.selectionEnd = input.selectionStart;
      // keep caretMode
      return;
    }
    if(val === 'Svar'){
      input.dispatchEvent(new CustomEvent('answer-submit',{bubbles:true}));
      // clear caretMode and visual indicators when answer is sent
      caretMode = false;
      grid.classList.remove('sup-active');
      var activeBtn = grid.querySelector('.btn.active');
      if(activeBtn) activeBtn.classList.remove('active');
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

    // ensure input is focused so selectionStart/End behave predictably
    try{ input.focus(); }catch(e){}
    var pos = (typeof input.selectionStart === 'number') ? input.selectionStart : input.value.length;
    input.value = input.value.slice(0,pos) + insert + input.value.slice(pos);
    input.selectionStart = input.selectionEnd = pos + insert.length;
  });

  // submit on Enter in the input field
  try{
    var inputEl = document.getElementById('answer-input');
    if(inputEl){
      inputEl.addEventListener('keydown', function(ev){
        if(ev.key === 'Enter'){
          ev.preventDefault();
          inputEl.dispatchEvent(new CustomEvent('answer-submit',{bubbles:true}));
        }
      });
    }
  }catch(e){}
});
