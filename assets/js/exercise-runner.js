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

  Runner.prototype.load = function(exerciseJsonPath){
    var self = this;
    return loadJSON(exerciseJsonPath).then(function(cfg){
      self.config = cfg;
      var gtype = cfg.generator && cfg.generator.type;
      // look up generator in known registries; include roundingGenerators and any other registries present
      var gen = null;
      var registries = [ 'multiplicationGenerators', 'divisionGenerators', 'roundingGenerators', 'divisibilityGenerators' ];
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
    // focus input for the new question
    try{ var input = document.querySelector(this.selectors.input); if(input) input.focus(); }catch(e){}
  };

  Runner.prototype.bind = function(){
    var self = this;
    var input = document.querySelector(this.selectors.input);
    if(!input) return;
    input.addEventListener('answer-submit', function(){ self.submit(); });
  };

  Runner.prototype.submit = function(){
    var input = document.querySelector(this.selectors.input);
    var val = parseNumberAnswer(input.value || '');
    var q = this.questions[this.index];
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
    // after 1.5s go to next question or finish
    setTimeout(function(){
      if(self.index < self.questions.length-1){ self.next(); }
      else { self.end(); }
    },1500);
    return ok;
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
