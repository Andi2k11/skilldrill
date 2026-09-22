// Generator for division of integers by 10, 100 or 1000.
window.divisionGenerators = window.divisionGenerators || {};
window.divisionGenerators['division-by-10-100-1000'] = (function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomChoice(values) {
    return values[randInt(0, values.length - 1)];
  }

  function formatAnswer(value, maxDecimalPlaces) {
    return value.toFixed(maxDecimalPlaces)
      .replace(/0+$/, '')
      .replace(/\.$/, '')
      .replace('.', ',');
  }

  return {
    generate: function (params) {
      var questions = [];
      var count = params.questionCount || 15;
      var min = typeof params.min === 'number' ? params.min : 0;
      var max = typeof params.max === 'number' ? params.max : 9999;
      var divisors = params.divisors && params.divisors.length ? params.divisors : [10, 100, 1000];

      for (var i = 0; i < count; i++) {
        var a = randInt(min, max);
        var b = randomChoice(divisors);
        var answer = a / b;
        questions.push({
          a: a,
          b: b,
          left: String(a),
          right: String(b),
          text: 'Beräkna ' + a + ' ÷ ' + b + '.',
          answer: answer,
          answerDisplay: formatAnswer(answer, 3)
        });
      }
      return questions;
    }
  };
})();
