// exercise-runner.js - minimal loader/runner for exercises
(function(window){
  function loadJSON(path){
    return fetch(path).then(function(r){ if(!r.ok) throw new Error('Fetch failed'); return r.json(); });
  }

  function parseNumberAnswer(str){
    if(typeof str !== 'string') return null;
    var s = str.trim().replace(/\s/g,'').replace(',', '.');
    var n = parseFloat(s);
    if(Number.isFinite(n)) return Math.round(n);
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
      var gen = window.multiplicationGenerators && window.multiplicationGenerators[gtype];
      if(!gen) throw new Error('Generator not found: '+gtype);
      self.questions = gen.generate(cfg.generator.parameters || {});
      self.index = 0;
      return self;
    });
  };

  Runner.prototype.render = function(){
    var q = this.questions[this.index];
    if(!q) return;
    var qs = document.querySelector(this.selectors.question);
    var qt = document.querySelector(this.selectors.title);
    if(qs) qs.textContent = q.text;
    if(qt) qt.textContent = 'Fråga ' + (this.index+1) + ' / ' + this.questions.length;
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
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    }
    return ok;
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
