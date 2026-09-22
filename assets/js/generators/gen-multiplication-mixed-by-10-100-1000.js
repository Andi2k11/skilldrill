// Generator for mixed multiplication by 10, 100 or 1000.
// The first factor is randomly either an integer or a decimal number.
window.multiplicationGenerators = window.multiplicationGenerators || {};

window.multiplicationGenerators['multiplication-mixed-by-10-100-1000'] = (function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomChoice(values) {
    return values[randInt(0, values.length - 1)];
  }

  function formatSwedishNumber(value) {
    return String(value).replace('.', ',');
  }

  function createInteger(min, max) {
    var value = randInt(min, max);

    return {
      type: 'integer',
      value: value,
      scaledValue: value,
      scale: 1,
      displayValue: String(value)
    };
  }

  function createDecimal(min, maxExclusive, minDecimalPlaces, maxDecimalPlaces) {
    var decimalPlaces = randInt(minDecimalPlaces, maxDecimalPlaces);
    var scale = Math.pow(10, decimalPlaces);
    var minScaled = Math.ceil(min * scale);
    var maxScaled = Math.ceil(maxExclusive * scale) - 1;
    var scaledValue;

    // The last decimal digit must not be zero. This ensures that the number
    // actually has the selected number of decimal places when displayed.
    do {
      scaledValue = randInt(minScaled, maxScaled);
    } while (scaledValue % 10 === 0);

    return {
      type: 'decimal',
      value: scaledValue / scale,
      scaledValue: scaledValue,
      scale: scale,
      displayValue: (scaledValue / scale)
        .toFixed(decimalPlaces)
        .replace('.', ',')
    };
  }

  return {
    generate: function (params) {
      var questions = [];
      var count = params.questionCount || 15;
      var integerMin = typeof params.integerMin === 'number' ? params.integerMin : 0;
      var integerMax = typeof params.integerMax === 'number' ? params.integerMax : 9999;
      var decimalMin = typeof params.decimalMin === 'number' ? params.decimalMin : 0;
      var decimalMaxExclusive = typeof params.decimalMaxExclusive === 'number'
        ? params.decimalMaxExclusive
        : 10;
      var minDecimalPlaces = typeof params.minDecimalPlaces === 'number'
        ? params.minDecimalPlaces
        : 1;
      var maxDecimalPlaces = typeof params.maxDecimalPlaces === 'number'
        ? params.maxDecimalPlaces
        : 4;
      var numberTypes = params.numberTypes && params.numberTypes.length
        ? params.numberTypes
        : ['integer', 'decimal'];
      var multipliers = params.multipliers && params.multipliers.length
        ? params.multipliers
        : [10, 100, 1000];
      var randomizeFactorOrder = params.randomizeFactorOrder !== false;

      for (var i = 0; i < count; i++) {
        var numberType = randomChoice(numberTypes);
        var factor;

        if (numberType === 'decimal') {
          factor = createDecimal(
            decimalMin,
            decimalMaxExclusive,
            minDecimalPlaces,
            maxDecimalPlaces
          );
        } else {
          factor = createInteger(integerMin, integerMax);
        }

        var multiplier = randomChoice(multipliers);
        var flip = randomizeFactorOrder && Math.random() < 0.5;
        var left = flip ? String(multiplier) : factor.displayValue;
        var right = flip ? factor.displayValue : String(multiplier);

        // Calculate from scaled integers to reduce floating-point errors.
        var answer = (factor.scaledValue * multiplier) / factor.scale;

        questions.push({
          numberType: factor.type,
          a: factor.value,
          b: multiplier,
          left: left,
          right: right,
          text: 'Beräkna ' + left + ' × ' + right + '.',
          answer: answer,
          answerDisplay: formatSwedishNumber(answer)
        });
      }

      return questions;
    }
  };
})();
