// Generator for mixed division of integers and decimal numbers by 10, 100 or 1000.
window.divisionGenerators = window.divisionGenerators || {};
window.divisionGenerators['division-mixed-by-10-100-1000'] = (function () {
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

  function createDecimal(min, maxExclusive, minDecimalPlaces, maxDecimalPlaces) {
    var decimalPlaces = randInt(minDecimalPlaces, maxDecimalPlaces);
    var scale = Math.pow(10, decimalPlaces);
    var minScaled = Math.ceil(min * scale);
    var maxScaled = Math.ceil(maxExclusive * scale) - 1;
    var scaledValue;

    do {
      scaledValue = randInt(minScaled, maxScaled);
    } while (scaledValue % 10 === 0);

    return {
      type: 'decimal',
      value: scaledValue / scale,
      scaledValue: scaledValue,
      scale: scale,
      decimalPlaces: decimalPlaces,
      displayValue: (scaledValue / scale).toFixed(decimalPlaces).replace('.', ',')
    };
  }

  function createInteger(min, max) {
    var value = randInt(min, max);
    return {
      type: 'integer', value: value, scaledValue: value, scale: 1,
      decimalPlaces: 0, displayValue: String(value)
    };
  }

  return {
    generate: function (params) {
      var questions = [];
      var count = params.questionCount || 15;
      var integerMin = typeof params.integerMin === 'number' ? params.integerMin : 0;
      var integerMax = typeof params.integerMax === 'number' ? params.integerMax : 9999;
      var decimalMin = typeof params.decimalMin === 'number' ? params.decimalMin : 0;
      var decimalMaxExclusive = typeof params.decimalMaxExclusive === 'number' ? params.decimalMaxExclusive : 10;
      var minDecimalPlaces = typeof params.minDecimalPlaces === 'number' ? params.minDecimalPlaces : 1;
      var maxDecimalPlaces = typeof params.maxDecimalPlaces === 'number' ? params.maxDecimalPlaces : 4;
      var numberTypes = params.numberTypes && params.numberTypes.length ? params.numberTypes : ['integer', 'decimal'];
      var divisors = params.divisors && params.divisors.length ? params.divisors : [10, 100, 1000];

      for (var i = 0; i < count; i++) {
        var numberType = randomChoice(numberTypes);
        var dividend = numberType === 'decimal'
          ? createDecimal(decimalMin, decimalMaxExclusive, minDecimalPlaces, maxDecimalPlaces)
          : createInteger(integerMin, integerMax);
        var divisor = randomChoice(divisors);
        var answer = dividend.scaledValue / (dividend.scale * divisor);
        var divisorDigits = Math.log10(divisor);
        questions.push({
          numberType: dividend.type,
          a: dividend.value,
          b: divisor,
          left: dividend.displayValue,
          right: String(divisor),
          text: 'Beräkna ' + dividend.displayValue + ' ÷ ' + divisor + '.',
          answer: answer,
          answerDisplay: formatAnswer(answer, dividend.decimalPlaces + divisorDigits)
        });
      }
      return questions;
    }
  };
})();
