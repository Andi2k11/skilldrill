// Generator for multiplication of decimal numbers by 10, 100 or 1000.
window.multiplicationGenerators = window.multiplicationGenerators || {};

window.multiplicationGenerators['multiplication-decimal-by-10-100-1000'] = (function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatSwedishNumber(value) {
    return String(value).replace('.', ',');
  }

  function createDecimal(min, maxExclusive, minDecimalPlaces, maxDecimalPlaces) {
    var decimalPlaces = randInt(minDecimalPlaces, maxDecimalPlaces);
    var scale = Math.pow(10, decimalPlaces);
    var minScaled = Math.ceil(min * scale);
    var maxScaled = Math.ceil(maxExclusive * scale) - 1;
    var scaledValue;

    // The final digit must not be zero. This ensures that the generated
    // number actually has the selected number of decimal places.
    do {
      scaledValue = randInt(minScaled, maxScaled);
    } while (scaledValue % 10 === 0);

    return {
      value: scaledValue / scale,
      scaledValue: scaledValue,
      scale: scale,
      displayValue: (scaledValue / scale).toFixed(decimalPlaces).replace('.', ',')
    };
  }

  return {
    generate: function (params) {
      var questions = [];
      var count = params.questionCount || 15;
      var min = typeof params.min === 'number' ? params.min : 0;
      var maxExclusive = typeof params.maxExclusive === 'number' ? params.maxExclusive : 10;
      var minDecimalPlaces = typeof params.minDecimalPlaces === 'number' ? params.minDecimalPlaces : 1;
      var maxDecimalPlaces = typeof params.maxDecimalPlaces === 'number' ? params.maxDecimalPlaces : 4;
      var multipliers = params.multipliers && params.multipliers.length
        ? params.multipliers
        : [10, 100, 1000];
      var randomizeFactorOrder = params.randomizeFactorOrder !== false;

      for (var i = 0; i < count; i++) {
        var decimal = createDecimal(
          min,
          maxExclusive,
          minDecimalPlaces,
          maxDecimalPlaces
        );
        var multiplier = multipliers[randInt(0, multipliers.length - 1)];
        var flip = randomizeFactorOrder && Math.random() < 0.5;
        var left = flip ? String(multiplier) : decimal.displayValue;
        var right = flip ? decimal.displayValue : String(multiplier);

        // Calculate from the scaled integer to reduce floating-point errors.
        var answer = (decimal.scaledValue * multiplier) / decimal.scale;

        questions.push({
          a: decimal.value,
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
