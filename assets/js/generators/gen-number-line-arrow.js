window.numberLineGenerators = window.numberLineGenerators || {};

window.numberLineGenerators['number-line-arrow'] = (function () {
  'use strict';

  /**
   * Slumpar ett heltal mellan min och max.
   * Både min och max kan väljas.
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Väljer ett slumpmässigt värde ur en array.
   */
  function choice(values) {
    return values[randInt(0, values.length - 1)];
  }

  /**
   * Blandar en array utan att ändra originalet.
   */
  function shuffle(values) {
    var result = values.slice();
    var i;
    var j;
    var temporaryValue;

    for (i = result.length - 1; i > 0; i--) {
      j = randInt(0, i);

      temporaryValue = result[i];
      result[i] = result[j];
      result[j] = temporaryValue;
    }

    return result;
  }

  /**
   * Säkerställer att text som placeras i SVG inte kan
   * tolkas som HTML- eller SVG-kod.
   */
  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Formaterar ett tal med svenskt decimaltecken.
   */
  function formatSwedish(units, decimalPlaces) {
    var divisor = Math.pow(10, decimalPlaces);
    var value = units / divisor;

    if (decimalPlaces === 0) {
      return String(value);
    }

    return value
      .toFixed(decimalPlaces)
      .replace('.', ',');
  }

  function isWholeNumber(units, decimalPlaces) {
    var unitsPerWholeNumber = Math.pow(10, decimalPlaces);

    return units % unitsPerWholeNumber === 0;
  }

  function createNumberLineSvg(settings) {
    var width = 800;
    var height = 230;

    var left = 70;
    var right = 730;

    var axisY = 130;

    var startUnits = settings.startUnits;
    var endUnits = settings.endUnits;
    var stepUnits = settings.stepUnits;
    var targetUnits = settings.targetUnits;
    var decimalPlaces = settings.decimalPlaces;

    var totalUnits = endUnits - startUnits;
    var tickCount = Math.round(totalUnits / stepUnits);

    var svg = [];
    var i;

    svg.push(
      '<svg ' +
        'xmlns="http://www.w3.org/2000/svg" ' +
        'viewBox="0 0 ' + width + ' ' + height + '" ' +
        'role="img" ' +
        'aria-label="Tallinje med en röd pil" ' +
        'style="display:block;width:100%;height:auto;">'
    );

    svg.push(
      '<rect ' +
        'x="0" ' +
        'y="0" ' +
        'width="' + width + '" ' +
        'height="' + height + '" ' +
        'fill="#ffffff" />'
    );

    svg.push(
      '<line ' +
        'x1="' + left + '" ' +
        'y1="' + axisY + '" ' +
        'x2="' + right + '" ' +
        'y2="' + axisY + '" ' +
        'stroke="#111827" ' +
        'stroke-width="3" ' +
        'stroke-linecap="round" />'
    );

    for (i = 0; i <= tickCount; i++) {
      var currentUnits = startUnits + i * stepUnits;

      var x =
        left +
        ((currentUnits - startUnits) / totalUnits) *
          (right - left);

      var isEndpoint = i === 0 || i === tickCount;
      var isWhole = isWholeNumber(
        currentUnits,
        decimalPlaces
      );

      var tickLength;
      var strokeWidth;

      if (isEndpoint) {
        tickLength = 32;
        strokeWidth = 3;
      } else if (isWhole) {
        tickLength = 26;
        strokeWidth = 3;
      } else {
        tickLength = 16;
        strokeWidth = 2;
      }

      svg.push(
        '<line ' +
          'x1="' + x.toFixed(2) + '" ' +
          'y1="' + (axisY - tickLength / 2) + '" ' +
          'x2="' + x.toFixed(2) + '" ' +
          'y2="' + (axisY + tickLength / 2) + '" ' +
          'stroke="#111827" ' +
          'stroke-width="' + strokeWidth + '" />'
      );
    }

    svg.push(
      '<text ' +
        'x="' + left + '" ' +
        'y="' + (axisY + 52) + '" ' +
        'text-anchor="middle" ' +
        'font-family="Arial, sans-serif" ' +
        'font-size="24" ' +
        'font-weight="600" ' +
        'fill="#111827">' +
        escapeXml(
          formatSwedish(startUnits, decimalPlaces)
        ) +
      '</text>'
    );

    svg.push(
      '<text ' +
        'x="' + right + '" ' +
        'y="' + (axisY + 52) + '" ' +
        'text-anchor="middle" ' +
        'font-family="Arial, sans-serif" ' +
        'font-size="24" ' +
        'font-weight="600" ' +
        'fill="#111827">' +
        escapeXml(
          formatSwedish(endUnits, decimalPlaces)
        ) +
      '</text>'
    );

    var targetX =
      left +
      ((targetUnits - startUnits) / totalUnits) *
        (right - left);

    svg.push(
      '<line ' +
        'x1="' + targetX.toFixed(2) + '" ' +
        'y1="35" ' +
        'x2="' + targetX.toFixed(2) + '" ' +
        'y2="' + (axisY - 30) + '" ' +
        'stroke="#dc2626" ' +
        'stroke-width="6" ' +
        'stroke-linecap="round" />'
    );

    svg.push(
      '<polygon ' +
        'points="' +
          (targetX - 13).toFixed(2) + ',' +
          (axisY - 34) + ' ' +
          (targetX + 13).toFixed(2) + ',' +
          (axisY - 34) + ' ' +
          targetX.toFixed(2) + ',' +
          (axisY - 13) +
        '" ' +
        'fill="#dc2626" />'
    );

    svg.push('</svg>');

    return svg.join('');
  }

  function generateIntegerQuestion(parameters) {
    var settings = parameters.integerRange || {};

    var startMin =
      typeof settings.startMin === 'number'
        ? settings.startMin
        : 0;

    var startMax =
      typeof settings.startMax === 'number'
        ? settings.startMax
        : 9;

    var range =
      typeof settings.range === 'number'
        ? settings.range
        : 2;

    var scales =
      settings.scales && settings.scales.length
        ? settings.scales
        : [0.1, 0.2];

    var decimalPlaces = 1;
    var factor = 10;

    var startUnits = randInt(startMin, startMax) * factor;
    var endUnits = startUnits + Math.round(range * factor);

    var selectedScale = choice(scales);
    var stepUnits = Math.round(selectedScale * factor);

    var tickCount =
      Math.round((endUnits - startUnits) / stepUnits);

    var targetIndex = randInt(1, tickCount - 1);
    var targetUnits =
      startUnits + targetIndex * stepUnits;

    return createQuestion({
      type: 'integer-range',
      startUnits: startUnits,
      endUnits: endUnits,
      stepUnits: stepUnits,
      targetUnits: targetUnits,
      decimalPlaces: decimalPlaces
    });
  }

  function generateTenthsQuestion(parameters) {
    var settings = parameters.tenths || {};

    var startMin =
      typeof settings.startMin === 'number'
        ? settings.startMin
        : 0;

    var startMax =
      typeof settings.startMax === 'number'
        ? settings.startMax
        : 10;

    var range =
      typeof settings.range === 'number'
        ? settings.range
        : 2;

    var scales =
      settings.scales && settings.scales.length
        ? settings.scales
        : [0.1, 0.2];

    var decimalPlaces = 1;
    var factor = 10;

    var startUnits = randInt(
      Math.round(startMin * factor),
      Math.round(startMax * factor)
    );

    var endUnits = startUnits + Math.round(range * factor);

    var selectedScale = choice(scales);
    var stepUnits = Math.round(selectedScale * factor);

    var tickCount =
      Math.round((endUnits - startUnits) / stepUnits);

    var targetIndex = randInt(1, tickCount - 1);
    var targetUnits =
      startUnits + targetIndex * stepUnits;

    return createQuestion({
      type: 'tenths',
      startUnits: startUnits,
      endUnits: endUnits,
      stepUnits: stepUnits,
      targetUnits: targetUnits,
      decimalPlaces: decimalPlaces
    });
  }

  function generateHundredthsQuestion(parameters) {
    var settings = parameters.hundredths || {};

    var startMin =
      typeof settings.startMin === 'number'
        ? settings.startMin
        : 0;

    var startMax =
      typeof settings.startMax === 'number'
        ? settings.startMax
        : 10;

    var range =
      typeof settings.range === 'number'
        ? settings.range
        : 0.2;

    var scales =
      settings.scales && settings.scales.length
        ? settings.scales
        : [0.01, 0.02];

    var decimalPlaces = 2;
    var factor = 100;

    var startUnits = randInt(
      Math.round(startMin * factor),
      Math.round(startMax * factor)
    );

    var endUnits = startUnits + Math.round(range * factor);

    var selectedScale = choice(scales);
    var stepUnits = Math.round(selectedScale * factor);

    var tickCount =
      Math.round((endUnits - startUnits) / stepUnits);

    var targetIndex = randInt(1, tickCount - 1);
    var targetUnits =
      startUnits + targetIndex * stepUnits;

    return createQuestion({
      type: 'hundredths',
      startUnits: startUnits,
      endUnits: endUnits,
      stepUnits: stepUnits,
      targetUnits: targetUnits,
      decimalPlaces: decimalPlaces
    });
  }

  function createQuestion(settings) {
    var factor = Math.pow(
      10,
      settings.decimalPlaces
    );

    var start = settings.startUnits / factor;
    var end = settings.endUnits / factor;
    var step = settings.stepUnits / factor;
    var target = settings.targetUnits / factor;

    var svg = createNumberLineSvg(settings);

    return {
      type: settings.type,

      text: 'Vilket tal pekar pilen på?',

      prompt:
        'Skriv talet som den röda pilen pekar på.',

      start: start,
      end: end,
      step: step,
      target: target,

      decimalPlaces: settings.decimalPlaces,

      svg: svg,

      visual: {
        type: 'svg',
        content: svg,
        alt:
          'Tallinje från ' +
          formatSwedish(
            settings.startUnits,
            settings.decimalPlaces
          ) +
          ' till ' +
          formatSwedish(
            settings.endUnits,
            settings.decimalPlaces
          ) +
          ' med en röd pil.'
      },

      answer: target,

      answerDisplay: formatSwedish(
        settings.targetUnits,
        settings.decimalPlaces
      )
    };
  }

  return {
    generate: function (parameters) {
      parameters = parameters || {};

      var questions = [];

      var questionCount =
        parameters.questionCount || 15;

      var types =
        parameters.types && parameters.types.length
          ? parameters.types
          : [
              'integer-range',
              'tenths',
              'hundredths'
            ];

      var typeOrder = [];

      while (typeOrder.length < questionCount) {
        typeOrder = typeOrder.concat(
          shuffle(types)
        );
      }

      typeOrder = typeOrder.slice(
        0,
        questionCount
      );

      var usedQuestions = {};
      var attempts = 0;
      var maximumAttempts = questionCount * 100;

      while (
        questions.length < questionCount &&
        attempts < maximumAttempts
      ) {
        var type = typeOrder[questions.length];
        var question;

        if (type === 'integer-range') {
          question =
            generateIntegerQuestion(parameters);
        } else if (type === 'tenths') {
          question =
            generateTenthsQuestion(parameters);
        } else if (type === 'hundredths') {
          question =
            generateHundredthsQuestion(parameters);
        } else {
          question =
            generateIntegerQuestion(parameters);
        }

        var uniqueKey =
          question.type +
          '|' +
          question.start +
          '|' +
          question.end +
          '|' +
          question.step +
          '|' +
          question.target;

        attempts += 1;

        if (!usedQuestions[uniqueKey]) {
          usedQuestions[uniqueKey] = true;
          questions.push(question);
        }
      }

      return questions;
    }
  };
})();
