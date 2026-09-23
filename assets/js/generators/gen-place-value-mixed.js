window.placeValueGenerators = window.placeValueGenerators || {};

window.placeValueGenerators['place-value-mixed'] = (function () {
  'use strict';

  var integerPositions = {
    ones: { index: 4, name: 'ental' },
    tens: { index: 3, name: 'tiotal' },
    hundreds: { index: 2, name: 'hundratal' },
    thousands: { index: 1, name: 'tusental' }
  };

  var decimalPositions = {
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

  function makeIntegerQuestion(positions) {
    var first = String(randInt(1, 9));
    var available = shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      .filter(function (digit) { return digit !== first; }));
    var digits = first + available.slice(0, 4).join('');
    var position = choice(positions);
    var data = integerPositions[position];
    var digit = digits.charAt(data.index);

    return {
      type: 'integer',
      number: Number(digits),
      numberDisplay: digits,
      digit: digit,
      position: position,
      text: 'Vilket platsvärde har siffran ' + digit + ' i talet ' + digits + '?',
      options: shuffle(['ental', 'tiotal', 'hundratal', 'tusental']),
      answer: data.name
    };
  }

  function makeDecimalQuestion(positions) {
    var digits = shuffle(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
      .slice(0, 5)
      .join('');
    var numberDisplay = digits.charAt(0) + ',' + digits.slice(1);
    var position = choice(positions);
    var data = decimalPositions[position];
    var digit = digits.charAt(data.index);

    return {
      type: 'decimal',
      number: Number(digits.charAt(0) + '.' + digits.slice(1)),
      numberDisplay: numberDisplay,
      digit: digit,
      position: position,
      text: 'Vilket platsvärde har siffran ' + digit + ' i talet ' + numberDisplay + '?',
      options: shuffle(['ental', 'tiondel', 'hundradel', 'tusendel']),
      answer: data.name
    };
  }

  return {
    generate: function (params) {
      params = params || {};
      var questions = [];
      var count = params.questionCount || 15;
      var intPositions = params.integerPositions || ['ones', 'tens', 'hundreds', 'thousands'];
      var decPositions = params.decimalPositions || ['ones', 'tenths', 'hundredths', 'thousandths'];
      var used = {};
      var index = 0;

      while (questions.length < count) {
        var question = index % 2 === 0
          ? makeIntegerQuestion(intPositions)
          : makeDecimalQuestion(decPositions);
        var key = question.type + '|' + question.numberDisplay + '|' + question.position;
        index += 1;

        if (!used[key]) {
          used[key] = true;
          questions.push(question);
        }
      }
      return questions;
    }
  };
})();
