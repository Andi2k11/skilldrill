window.powerGenerators = window.powerGenerators || {};
window.powerGenerators['power-of-ten-to-exponent'] = (function () {
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
        var number = Math.pow(10, exponent);
        questions.push({
          exponent: exponent,
          number: String(number),
          text: 'Skriv ' + number + ' som en tiopotens.',
          answer: exponent,
          answerDisplay: '10^' + exponent
        });
      }
      return questions;
    }
  };
})();