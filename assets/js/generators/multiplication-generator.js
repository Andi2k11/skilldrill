// Simple generator for multiplication-by-10-100-1000
window.multiplicationGenerators = window.multiplicationGenerators || {};
window.multiplicationGenerators['multiplication-by-10-100-1000'] = (function(){
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  return {
    generate: function(params){
      var questions = [];
      var count = params.questionCount || 15;
      var min = (typeof params.min === 'number')?params.min:0;
      var max = (typeof params.max === 'number')?params.max:999;
      var multipliers = params.multipliers && params.multipliers.length? params.multipliers : [10,100,1000];
      for(var i=0;i<count;i++){
        var a = randInt(min,max);
        var b = multipliers[Math.floor(Math.random()*multipliers.length)];
        // Randomize order visually but answer same
        var flip = Math.random() < 0.5;
        var left = flip? b : a;
        var right = flip? a : b;
        var answer = a * b;
        questions.push({
          a: a,
          b: b,
          left: left,
          right: right,
          text: "Beräkna " + left + " × " + right + ".",
          answer: answer
        });
      }
      return questions;
    }
  };
})();
