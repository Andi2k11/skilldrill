window.powerGenerators = window.powerGenerators || {};
window.powerGenerators['exponent-to-power-of-ten'] = (function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return {
    generate: function (params) {
      var questions = [];
      var count = params.questionCount || 15;
      var minExponent = typeof params.minExponent === 'number' ? params.minExponent : 0;
      var maxExponent = typeof params.maxExponent === 'number' ? params.maxExponent : 12;
      for (var i = 0; i < count; i++) {
        var exponent = randInt(minExponent, maxExponent);
        var answer = Math.pow(10, exponent);
        questions.push({
          exponent: exponent,
          text: 'Skriv 10^' + exponent + ' som ett vanligt tal.',
          answer: answer,
          answerDisplay: String(answer)
        });
      }
      return questions;
    }
  };
})();