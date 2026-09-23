window.divisibilityGenerators = window.divisibilityGenerators || {};

window.divisibilityGenerators['divisibility-rules'] = (function () {

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(array) {
    var a = array.slice();

    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }

    return a;
  }

  return {
    generate: function (params) {

      var questions = [];
      var count = params.questionCount || 15;

      var min = typeof params.min === 'number' ? params.min : 1;
      var max = typeof params.max === 'number' ? params.max : 399;

      var divisors = params.divisors && params.divisors.length
        ? params.divisors
        : [2, 3, 5, 10];

      while (questions.length < count) {

        var number = randInt(min, max);

        var correctAnswers = divisors
          .filter(function (d) {
            return number % d === 0;
          })
          .map(String);

        if (correctAnswers.length === 0) {
          continue;
        }

        questions.push({
          number: number,
          text: 'Vilka delbarhetsregler fungerar på talet ' + number + '?',
          options: shuffle(divisors.map(String)),
          answer: correctAnswers
        });
      }

      return questions;
    }
  };

})();
window.divisibilityGenerators = window.divisibilityGenerators || {};

window.divisibilityGenerators['divisibility-rules'] = (function () {

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(array) {
    var a = array.slice();

    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }

    return a;
  }

  return {
    generate: function (params) {

      var questions = [];
      var count = params.questionCount || 15;

      var min = typeof params.min === 'number' ? params.min : 1;
      var max = typeof params.max === 'number' ? params.max : 399;

      var divisors = params.divisors && params.divisors.length
        ? params.divisors
        : [2, 3, 5, 10];

      while (questions.length < count) {

        var number = randInt(min, max);

        var correctAnswers = divisors
          .filter(function (d) {
            return number % d === 0;
          })
          .map(String);

        if (correctAnswers.length === 0) {
          continue;
        }

        questions.push({
          number: number,
          text: 'Vilka delbarhetsregler fungerar på talet ' + number + '?',
          options: shuffle(divisors.map(String)),
          answer: correctAnswers
        });
      }

      return questions;
    }
  };

})();