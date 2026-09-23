window.placeValueGenerators = window.placeValueGenerators || {};

window.placeValueGenerators['place-value-decimal'] = (function () {
  'use strict';

  var positionData = {
    ones: { index: 0, name: 'ental' },
    tenths: { index: 1, name: 'tiondel' },
    hundredths: { index: 2, name: 'hundradel' },
    thousandths: { index: 3, name: 'tusendel' }
  };

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(values) {
    return values[randInt(0, values.length - 1)];
  }

  function shuffle(values) {
    var result = values.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  function uniqueDigits() {
    return shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
      .slice(0, 5)
      .join('');
  }

  return {
    generate: function (params) {
      params = params || {};
      var questions = [];
      var count = params.questionCount || 15;
      var positions = params.positions || ['ones', 'tenths', 'hundredths', 'thousandths'];
      var used = {};

      while (questions.length < count) {
        var digits = uniqueDigits();
        var numberDisplay = digits.charAt(0) + ',' + digits.slice(1);
        var position = choice(positions);
        var data = positionData[position];
        var digit = digits.charAt(data.index);
        var key = digits + '|' + position;

        if (!used[key]) {
          used[key] = true;
          questions.push({
            number: Number(digits.charAt(0) + '.' + digits.slice(1)),
            numberDisplay: numberDisplay,
            digit: digit,
            position: position,
            text: 'Vilket platsvärde har siffran ' + digit + ' i talet ' + numberDisplay + '?',
            options: shuffle(['ental', 'tiondel', 'hundradel', 'tusendel']),
            answer: data.name
          });
        }
      }
      return questions;
    }
  };
})();
