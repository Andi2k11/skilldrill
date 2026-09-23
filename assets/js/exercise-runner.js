// exercise-runner.js - minimal loader/runner for exercises
(function(window){
  function loadJSON(path){
    return fetch(path).then(function(r){ if(!r.ok) throw new Error('Fetch failed'); return r.json(); });
  }

  function parseNumberAnswer(str){
    if(typeof str !== 'string') return null;
    var s = str.trim().replace(/\s/g,'').replace(',', '.');
    var n = parseFloat(s);
    if(Number.isFinite(n)) return n;
    return null;
  }

  function Runner(containerSelectors){
    this.config = null;
    this.questions = [];
    this.index = 0;
    this.selectors = containerSelectors || { question: '.question-card .question-text', title: '.question-card .question-title', input: '#answer-input' };
  }

  function shuffle(array){
    var a = array.slice();
    for(var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var tmp = a[i]; a[i]=a[j]; a[j]=tmp;
    }
    return a;
  }

  Runner.prototype.load = function(exerciseJsonPath){
    var self = this;
    return loadJSON(exerciseJsonPath).then(function(cfg){
      self.config = cfg;
      var gtype = cfg.generator && cfg.generator.type;
      // look up generator in known registries; include roundingGenerators and any other registries present
      var gen = null;
      var registries = [ 'multiplicationGenerators', 'divisionGenerators', 'roundingGenerators', 'divisibilityGenerators', 'placeValueGenerators' ];
      for(var i=0;i<registries.length && !gen;i++){
        var r = window[registries[i]];
        if(r && r[gtype]) gen = r[gtype];
      }
      // final generic fallback: scan window for any object that ends with 'Generators'
      if(!gen){
        for(var k in window){
          if(!window.hasOwnProperty(k)) continue;
          if(k.length>10 && k.slice(-10) === 'Generators'){
            var obj = window[k];
            if(obj && obj[gtype]){ gen = obj[gtype]; break; }
          }
        }
      }
      if(!gen) throw new Error('Generator not found: '+gtype);
      self.questions = gen.generate(cfg.generator.parameters || {});
      // If config.question.type is multiple-select but generator provided a single correct answer
      // normalize question type per-question so UI can treat it as single-choice.
      if(self.config && self.config.question && self.config.question.type === 'multiple-select'){
        self.questions.forEach(function(q){
          var ans = q.answer;
          if(typeof ans === 'string' || (Array.isArray(ans) && ans.length===1)){
            q._renderType = 'multiple-choice';
          }
        });
      }
      self.index = 0;
      self.correctCount = 0;
      self.ended = false;
      return self;
    });
  };

  Runner.prototype.render = function(){
    var q = this.questions[this.index];
    if(!q) return;
    var qs = document.querySelector(this.selectors.question);
    var qt = document.querySelector(this.selectors.title);
    var answerCard = document.querySelector('.answer-card .card-body');
    var input = document.querySelector(this.selectors.input);
    // ensure calc-grid visibility reset
    try{ document.querySelector('.calc-grid').classList.remove('multiple-select-hide'); }catch(e){}
    // If exercise JSON contains a question.title, show that as task-specific header
    var taskTitle = (this.config && this.config.question && this.config.question.title) ? this.config.question.title : ('Fråga ' + (this.index+1) + ' / ' + this.questions.length);
    if(qs) {
      try{
        var gtype = (this.config && this.config.generator && this.config.generator.type) || '';
        if(typeof katex !== 'undefined' && gtype.indexOf('division') === 0){
          // render division as a LaTeX fraction: use the displayed left and right values
          // convert Swedish comma to dot for numeric latex, but keep display as numbers
          var left = (q.left || q.a || '').toString().replace(',', '.');
          var right = (q.right || q.b || '').toString().replace(',', '.');
          var latex = '\\dfrac{' + left + '}{' + right + '}';
          qs.innerHTML = '';
          katex.render(latex, qs, {throwOnError:false});
        } else {
          qs.textContent = q.text;
        }
      }catch(e){ qs.textContent = q.text; }
    }
    if(qt) qt.textContent = taskTitle;
    // If question provides an inline SVG visual, render it into the UI.
    try{
      var questionCard = document.querySelector('.question-card');
      if(q.visual && q.visual.type === 'svg'){
        if(questionCard) questionCard.classList.add('has-visual');
        // prefer explicit svg content, fallback to q.svg
        var svgHtml = q.visual.content || q.svg || '';
        // find or create a container for visuals
        var visualContainer = document.querySelector('.question-visual');
        if(!visualContainer){
          visualContainer = document.createElement('div');
          visualContainer.className = 'question-visual mb-3';
          // insert after the title if possible, else before the question text
          if(qt && qt.parentNode){ qt.parentNode.insertBefore(visualContainer, qt.nextSibling); }
          else if(qs && qs.parentNode){ qs.parentNode.insertBefore(visualContainer, qs); }
          else { if(qs) qs.parentNode.appendChild(visualContainer); }
        }
        // If the exercise JSON used a source placeholder like "{{svg}}", the generator
        // typically places the SVG string on `q.svg` or `q.visual.content`.
        if(svgHtml){
          // Insert SVG into the visual container under the title (in-flow),
          // but render it scaled by default so it doesn't push surrounding layout.
          visualContainer.innerHTML = '';
          var svgWrap = document.createElement('div');
          svgWrap.className = 'visual-overlay-inner';
          svgWrap.innerHTML = svgHtml;
          visualContainer.appendChild(svgWrap);
        } else {
          visualContainer.innerHTML = '';
        }
      } else {
        if(questionCard) questionCard.classList.remove('has-visual');
        // ensure visual container removed when no visual
        var existing = document.querySelector('.question-visual');
        if(existing) existing.parentNode.removeChild(existing);
      }
    }catch(e){ /* ignore visual rendering errors */ }
    // Render answer controls depending on question type
    try{
      var qtype = (this.config && this.config.question && this.config.question.type) || '';
      // allow per-question override set during load
      if(this.questions[this.index] && this.questions[this.index]._renderType){
        qtype = this.questions[this.index]._renderType;
      }
      if(qtype === 'multiple-select' || qtype === 'multiple-choice'){
        if(answerCard){
          // clear existing
          answerCard.innerHTML = '';
          var opts = q.options || (this.config.question.answer && this.config.question.answer.options) || [];
          // shuffle answers unless the exercise explicitly disables it
          var shouldShuffle = true;
          if(this.config && this.config.question && typeof this.config.question.shuffleAnswers !== 'undefined'){
            shouldShuffle = !!this.config.question.shuffleAnswers;
          }
          if(shouldShuffle){ opts = shuffle(opts); }
          var btnGroup = document.createElement('div');
          btnGroup.className = 'd-flex flex-wrap gap-2 multiple-select-group';
          opts.forEach(function(opt){
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-outline-primary ms-option';
            b.textContent = opt;
            b.setAttribute('data-option', opt);
            if(qtype === 'multiple-choice') b.classList.add('single-choice');
            btnGroup.appendChild(b);
          });
          answerCard.appendChild(btnGroup);
          // if this is single-choice, hide the main Svar button to avoid confusion
          try{
            var calcGrid = document.querySelector('.calc-grid');
            if(calcGrid){
              var svarBtn = calcGrid.querySelector('button.btn-primary');
              if(qtype === 'multiple-choice'){
                if(svarBtn) svarBtn.style.display = 'none';
              } else {
                if(svarBtn) svarBtn.style.display = '';
              }
            }
          }catch(e){}
          // normalize widths: set all buttons to the width of the widest button
          try{
            var tempBtns = Array.from(btnGroup.querySelectorAll('button'));
            var maxW = 0;
            tempBtns.forEach(function(b){
              // ensure natural width measurement
              b.style.width = 'auto';
              var w = b.getBoundingClientRect().width;
              if(w > maxW) maxW = w;
            });
            if(maxW > 0){
              tempBtns.forEach(function(b){ b.style.minWidth = Math.ceil(maxW) + 'px'; });
            }
          }catch(e){}
            // hide calc-grid buttons except Svar
            try{ document.querySelector('.calc-grid').classList.add('multiple-select-hide'); }catch(e){}
        }
      } else {
        if(input){ input.focus(); }
      }
    }catch(e){}
  };

  Runner.prototype.bind = function(){
    var self = this;
    var input = document.querySelector(this.selectors.input);
    if(!input) return;
    input.addEventListener('answer-submit', function(){ self.submit(); });
    // delegate clicks for multiple-select options
    var answerCard = document.querySelector('.answer-card .card-body');
    if(answerCard){
      answerCard.addEventListener('click', function(ev){
        var btn = ev.target.closest('button.ms-option');
        if(!btn) return;
        if(btn.classList.contains('single-choice')){
          Array.from(answerCard.querySelectorAll('button.ms-option')).forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          // submit immediately for single-choice buttons
          try{ self.submit(); }catch(e){}
        } else {
          btn.classList.toggle('active');
        }
      });
    }
  };

  Runner.prototype.submit = function(){
    var q = this.questions[this.index];
    var qtype = (this.config && this.config.question && this.config.question.type) || '';
    var self = this;
    if(qtype === 'multiple-select' || qtype === 'multiple-choice'){
      var answerCard = document.querySelector('.answer-card .card-body');
      if(!answerCard) return false;
      var btns = Array.from(answerCard.querySelectorAll('button.ms-option'));
      var selected = btns.filter(function(b){ return b.classList.contains('active'); }).map(function(b){ return b.getAttribute('data-option'); });
      var correct = q.answer;
      if(typeof correct === 'undefined' || correct === null) correct = [];
      else if(typeof correct === 'string') correct = [correct];
      else if(!Array.isArray(correct)) correct = [String(correct)];
      correct = correct.slice().map(String);
      // determine correctness
      var allSelectedCorrect = selected.length > 0 && selected.every(function(s){ return correct.indexOf(s) !== -1; });
      var missed = correct.filter(function(c){ return selected.indexOf(c) === -1; });
      // apply visual feedback: green for correct selections, red for incorrect selections, yellow if some missed
      btns.forEach(function(b){
        var opt = b.getAttribute('data-option');
        b.classList.remove('btn-success','btn-danger','btn-warning','btn-outline-primary','active');
        // reset to outline style
        b.classList.add('btn-outline-primary');
        if(selected.indexOf(opt) !== -1){
          if(correct.indexOf(opt) !== -1){ b.classList.remove('btn-outline-primary'); b.classList.add('btn-success'); }
          else { b.classList.remove('btn-outline-primary'); b.classList.add('btn-danger'); }
        } else {
          if(correct.indexOf(opt) !== -1 && missed.length>0){ b.classList.remove('btn-outline-primary'); b.classList.add('btn-warning'); }
        }
      });
      var ok = (missed.length === 0) && selected.every(function(s){ return correct.indexOf(s) !== -1; });
      if(ok) this.correctCount = (this.correctCount||0) + 1;
      // after delay, advance
      setTimeout(function(){ if(self.index < self.questions.length-1){ self.next(); } else { self.end(); } },1500);
      return ok;
    } else {
      var input = document.querySelector(this.selectors.input);
      var val = parseNumberAnswer(input.value || '');
      var ok = (val === q.answer);
      // simple feedback
      if(ok){
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        this.correctCount = (this.correctCount||0) + 1;
      } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
      }
      var self = this;
      setTimeout(function(){ if(self.index < self.questions.length-1){ self.next(); } else { self.end(); } },1500);
      return ok;
    }
  };

  Runner.prototype.end = function(){
    this.ended = true;
    var total = this.questions.length;
    var correct = this.correctCount||0;
    // render a simple summary into question area
    var qs = document.querySelector(this.selectors.question);
    var qt = document.querySelector(this.selectors.title);
    if(qs) qs.textContent = Math.round((correct / total) * 100) + " %";
    if(qt) qt.textContent = 'Klar';
    var input = document.querySelector(this.selectors.input);
    if(input){ input.value=''; input.classList.remove('is-valid','is-invalid'); }
    // add a restart button to start the same exercise again
    try{
      var container = (qt && qt.parentNode) ? qt.parentNode : (qs && qs.parentNode);
      if(container){
        // remove existing restart button if any
        var old = container.querySelector('.exercise-restart-btn');
        if(old) old.parentNode.removeChild(old);
        var btn = document.createElement('button');
        btn.type = 'button';
        // Use Bootstrap button classes to match site style
        btn.className = 'btn btn-primary exercise-restart-btn';
        btn.textContent = 'Börja om';
        btn.addEventListener('click', (function(self){ return function(){ self.restart(); }; })(this));
        container.appendChild(btn);
      }
    }catch(e){}
  };

  Runner.prototype.restart = function(){
    this.index = 0;
    this.correctCount = 0;
    this.ended = false;
    // remove restart button if present
    try{
      var qt = document.querySelector(this.selectors.title);
      var container = (qt && qt.parentNode) ? qt.parentNode : null;
      if(container){
        var old = container.querySelector('.exercise-restart-btn');
        if(old) old.parentNode.removeChild(old);
      }
    }catch(e){}
    this.render();
    var input = document.querySelector(this.selectors.input);
    if(input) input.focus();
  };

  Runner.prototype.next = function(){
    if(this.index < this.questions.length-1) this.index++;
    else this.index = 0;
    var input = document.querySelector(this.selectors.input);
    if(input){ input.value=''; input.classList.remove('is-valid','is-invalid'); }
    this.render();
  };

  window.ExerciseRunner = Runner;
})(window);
