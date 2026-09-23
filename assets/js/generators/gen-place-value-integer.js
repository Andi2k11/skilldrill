window.placeValueGenerators = window.placeValueGenerators || {};

window.placeValueGenerators['place-value-integer'] = (function () {
  'use strict';

  var positionData = {
    ones: { index: 4, name: 'ental' },
    tens: { index: 3, name: 'tiotal' },
    hundreds: { index: 2, name: 'hundratal' },
    thousands: { index: 1, name: 'tusental' }
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

  function uniqueIntegerDigits() {
    var first = String(randInt(1, 9));
    var available = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      .filter(function (digit) { return digit !== first; });
    available = shuffle(available);
    return first + available.slice(0, 4).join('');
  }

  return {
    generate: function (params) {
      params = params || {};
      var questions = [];
      var count = params.questionCount || 15;
      var positions = params.positions || ['ones', 'tens', 'hundreds', 'thousands'];
      var used = {};

      while (questions.length < count) {
        var digits = uniqueIntegerDigits();
        var position = choice(positions);
        var data = positionData[position];
        var digit = digits.charAt(data.index);
        var key = digits + '|' + position;

        if (!used[key]) {
          used[key] = true;
          questions.push({
            number: Number(digits),
            numberDisplay: digits,
            digit: digit,
            position: position,
            text: 'Vilket platsvärde har siffran ' + digit + ' i talet ' + digits + '?',
            options: shuffle(['ental', 'tiotal', 'hundratal', 'tusental']),
            answer: data.name
          });
        }
      }
      return questions;
    }
  };
})();
