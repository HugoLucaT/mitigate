import { g as getContext, f as ensure_array_like, h as attr, i as stringify, e as escape_html, b as pop, p as push, j as bind_props } from './index-CLMi6z2J.js';
import './main-D8K-05aP.js';
import './client-CjdeEz1m.js';
import './exports-DuWZopOC.js';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

/*
 * anime.js v3.2.2
 * (c) 2023 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

// Defaults

var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

// Caching

var cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) { return Array.isArray(a); },
  obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
  pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
  svg: function (a) { return a instanceof SVGElement; },
  inp: function (a) { return a instanceof HTMLInputElement; },
  dom: function (a) { return a.nodeType || is.svg(a); },
  str: function (a) { return typeof a === 'string'; },
  fnc: function (a) { return typeof a === 'function'; },
  und: function (a) { return typeof a === 'undefined'; },
  nil: function (a) { return is.und(a) || a === null; },
  hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
  rgb: function (a) { return /^rgb/.test(a); },
  hsl: function (a) { return /^hsl/.test(a); },
  col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
  key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; },
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) { return t; }
    return 1 - progress;
  }

  function getDuration() {
    var cached = cache.springs[string];
    if (cached) { return cached; }
    var frame = 1/6;
    var elapsed = 0;
    var rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) { break; }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if ( steps === void 0 ) steps = 10;

  return function (t) { return Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps); };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = (function () {

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
  function C(aA1)      { return 3.0 * aA1 }

  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) { return aGuessT; }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) { return x; }
      if (x === 0 || x === 1) { return x; }
      return calcBezier(getTForX(x), mY1, mY2);
    }

  }

  return bezier;

})();

var penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = { linear: function () { return function (t) { return t; }; } };

  var functionEasings = {
    Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
    Expo: function () { return function (t) { return t ? Math.pow(2, 10 * t - 10) : 0; }; },
    Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
    Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
    Bounce: function () { return function (t) {
      var pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    }; },
    Elastic: function (amplitude, period) {
      if ( amplitude === void 0 ) amplitude = 1;
      if ( period === void 0 ) period = .5;

      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
  });

  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
    eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
      1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
    eases['easeOutIn' + name] = function (a, b) { return function (t) { return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : 
      (easeIn(a, b)(t * 2 - 1) + 1) / 2; }; };
  });

  return eases;

})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) { return easing; }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps, args);
    default : return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch(e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
}

function toArray(o) {
  if (is.arr(o)) { return o; }
  if (is.str(o)) { o = selectString(o) || o; }
  if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) { return a === val; });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) { clone[p] = o[p]; }
  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val) {
  if (is.rgb(val)) { return rgbToRgba(val); }
  if (is.hex(val)) { return hexToRgba(val); }
  if (is.hsl(val)) { return hslToRgba(val); }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) { return split[1]; }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) { return val; }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) { return cached; }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))) { return 'attribute'; }
  if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
  if (el[prop] != null) { return 'object'; }
}

function getElementTransforms(el) {
  if (!is.dom(el)) { return; }
  var str = el.style.transform || '';
  var reg  = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return getAttribute(target, propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) { return to; }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) { return colorToRgb(val); }
  if (/\s/g.test(val)) { return val; }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) { return unitLess + unit; }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0 ; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) { return el.getTotalLength(); }
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) { break; }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width,
    h: height,
    vW: viewBox[2],
    vH: viewBox[3]
  }
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathProgress(path, progress, isPathTargetInsideSVG) {
  function point(offset) {
    if ( offset === void 0 ) offset = 0;

    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
  var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
  switch (path.property) {
    case 'x': return (p.x - svg.x) * scaleX;
    case 'y': return (p.y - svg.y) * scaleY;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  }
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
    return obj;
  }).map(function (k) { return mergeObjects(k, settings); });
}


function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
  .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
  var properties = {};
  var loop = function ( i ) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) { newKey.value = key[p]; }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop( i );
  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) { return getFunctionValue(v, animatable); });
      if (value.length === 1) { value = value[0]; }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) { to = previousValue; }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) { tween.round = 1; }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) { return t.style[p] = v; },
  attribute: function (t, p, v) { return t.setAttribute(p, v); },
  object: function (t, p, v) { return t[p] = v; },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    }
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) { return !is.und(a); });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];

var engine = (function () {
  var raf;

  function play() {
    if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) {
      raf = requestAnimationFrame(step);
    }
  }
  function step(t) {
    // memo on algorithm issue:
    // dangerous iteration over mutable `activeInstances`
    // (that collection may be updated from within callbacks of `tick`-ed animation instances)
    var activeInstancesLength = activeInstances.length;
    var i = 0;
    while (i < activeInstancesLength) {
      var activeInstance = activeInstances[i];
      if (!activeInstance.paused) {
        activeInstance.tick(t);
        i++;
      } else {
        activeInstances.splice(i, 1);
        activeInstancesLength--;
      }
    }
    raf = i > 0 ? requestAnimationFrame(step) : undefined;
  }

  function handleVisibilityChange() {
    if (!anime.suspendWhenDocumentHidden) { return; }

    if (isDocumentHidden()) {
      // suspend ticks
      raf = cancelAnimationFrame(raf);
    } else { // is back to active tab
      // first adjust animations to consider the time that ticks were suspended
      activeInstances.forEach(
        function (instance) { return instance ._onDocumentVisibility(); }
      );
      engine();
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return play;
})();

function isDocumentHidden() {
  return !!document && document.hidden;
}

// Public Instance

function anime(params) {
  if ( params === void 0 ) params = {};


  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) { return child.reversed = instance.reversed; });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) { child.seek(time - child.timelineOffset); }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
    } else {
      for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = (void 0);
      for (var n = 0; n < toNumbersLength; n++) {
        var value = (void 0);
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) { syncInstanceChildren(insTime); }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) { setCallback('update'); }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) { instance.children[i].reset(); }
    if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
  instance._onDocumentVisibility = resetTime;

  // Set Value helper

  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function(t) {
    now = t;
    if (!startTime) { startTime = now; }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };

  instance.play = function() {
    if (!instance.paused) { return; }
    if (instance.completed) { instance.reset(); }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    engine();
  };

  instance.reverse = function() {
    toggleInstanceDirection();
    instance.completed = instance.reversed ? false : true;
    resetTime();
  };

  instance.restart = function() {
    instance.reset();
    instance.play();
  };

  instance.remove = function(targets) {
    var targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, instance);
  };

  instance.reset();

  if (instance.autoplay) { instance.play(); }

  return instance;

}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargetsFromInstance(targetsArray, instance) {
  var animations = instance.animations;
  var children = instance.children;
  removeTargetsFromAnimations(targetsArray, animations);
  for (var c = children.length; c--;) {
    var child = children[c];
    var childAnimations = child.animations;
    removeTargetsFromAnimations(targetsArray, childAnimations);
    if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
  }
  if (!animations.length && !children.length) { instance.pause(); }
}

function removeTargetsFromActiveInstances(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    removeTargetsFromInstance(targetsArray, instance);
  }
}

// Stagger helpers

function stagger(val, params) {
  if ( params === void 0 ) params = {};

  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) { fromIndex = 0; }
    if (fromCenter) { fromIndex = (t - 1) / 2; }
    if (fromLast) { fromIndex = t - 1; }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
          var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
          var toX = index%grid[0];
          var toY = Math.floor(index/grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') { value = -distanceX; }
          if (axis === 'y') { value = -distanceY; }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
      if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  }
}

// Timeline

function timeline(params) {
  if ( params === void 0 ) params = {};

  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
    function passThrough(ins) { ins.passThrough = true; }
    for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) { tl.play(); }
    return tl;
  };
  return tl;
}

anime.version = '3.2.1';
anime.speed = 1;
// TODO:#review: naming, documentation
anime.suspendWhenDocumentHidden = true;
anime.running = activeInstances;
anime.remove = removeTargetsFromActiveInstances;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

var canUseDom;
var hasRequiredCanUseDom;

function requireCanUseDom () {
	if (hasRequiredCanUseDom) return canUseDom;
	hasRequiredCanUseDom = 1;
	var canUseDOM = !!(
	  typeof window !== 'undefined' &&
	  window.document &&
	  window.document.createElement
	);

	canUseDom = canUseDOM;
	return canUseDom;
}

var canUseDomExports = requireCanUseDom();
var canUseDOM = /*@__PURE__*/getDefaultExportFromCjs(canUseDomExports);

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used to match a single whitespace character. */
var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * simplebar-core - v1.2.5
 * Scrollbars, simpler.
 * https://grsmto.github.io/simplebar/
 *
 * Made by Adrien Denat from a fork by Jonathan Nicol
 * Under MIT License
 */


/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var cachedScrollbarWidth = null;
var cachedDevicePixelRatio = null;
if (canUseDOM) {
    window.addEventListener('resize', function () {
        if (cachedDevicePixelRatio !== window.devicePixelRatio) {
            cachedDevicePixelRatio = window.devicePixelRatio;
            cachedScrollbarWidth = null;
        }
    });
}
function scrollbarWidth() {
    if (cachedScrollbarWidth === null) {
        if (typeof document === 'undefined') {
            cachedScrollbarWidth = 0;
            return cachedScrollbarWidth;
        }
        var body = document.body;
        var box = document.createElement('div');
        box.classList.add('simplebar-hide-scrollbar');
        body.appendChild(box);
        var width = box.getBoundingClientRect().right;
        body.removeChild(box);
        cachedScrollbarWidth = width;
    }
    return cachedScrollbarWidth;
}

function getElementWindow$1(element) {
    if (!element ||
        !element.ownerDocument ||
        !element.ownerDocument.defaultView) {
        return window;
    }
    return element.ownerDocument.defaultView;
}
function getElementDocument$1(element) {
    if (!element || !element.ownerDocument) {
        return document;
    }
    return element.ownerDocument;
}
// Helper function to retrieve options from element attributes
var getOptions$1 = function (obj) {
    var initialObj = {};
    var options = Array.prototype.reduce.call(obj, function (acc, attribute) {
        var option = attribute.name.match(/data-simplebar-(.+)/);
        if (option) {
            var key = option[1].replace(/\W+(.)/g, function (_, chr) { return chr.toUpperCase(); });
            switch (attribute.value) {
                case 'true':
                    acc[key] = true;
                    break;
                case 'false':
                    acc[key] = false;
                    break;
                case undefined:
                    acc[key] = true;
                    break;
                default:
                    acc[key] = attribute.value;
            }
        }
        return acc;
    }, initialObj);
    return options;
};
function addClasses$1(el, classes) {
    var _a;
    if (!el)
        return;
    (_a = el.classList).add.apply(_a, classes.split(' '));
}
function removeClasses$1(el, classes) {
    if (!el)
        return;
    classes.split(' ').forEach(function (className) {
        el.classList.remove(className);
    });
}
function classNamesToQuery$1(classNames) {
    return ".".concat(classNames.split(' ').join('.'));
}

var helpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    addClasses: addClasses$1,
    classNamesToQuery: classNamesToQuery$1,
    getElementDocument: getElementDocument$1,
    getElementWindow: getElementWindow$1,
    getOptions: getOptions$1,
    removeClasses: removeClasses$1
});

var getElementWindow = getElementWindow$1, getElementDocument = getElementDocument$1, getOptions$2 = getOptions$1, addClasses$2 = addClasses$1, removeClasses = removeClasses$1, classNamesToQuery = classNamesToQuery$1;
var SimpleBarCore = /** @class */ (function () {
    function SimpleBarCore(element, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.removePreventClickId = null;
        this.minScrollbarWidth = 20;
        this.stopScrollDelay = 175;
        this.isScrolling = false;
        this.isMouseEntering = false;
        this.isDragging = false;
        this.scrollXTicking = false;
        this.scrollYTicking = false;
        this.wrapperEl = null;
        this.contentWrapperEl = null;
        this.contentEl = null;
        this.offsetEl = null;
        this.maskEl = null;
        this.placeholderEl = null;
        this.heightAutoObserverWrapperEl = null;
        this.heightAutoObserverEl = null;
        this.rtlHelpers = null;
        this.scrollbarWidth = 0;
        this.resizeObserver = null;
        this.mutationObserver = null;
        this.elStyles = null;
        this.isRtl = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.onMouseMove = function () { };
        this.onWindowResize = function () { };
        this.onStopScrolling = function () { };
        this.onMouseEntered = function () { };
        /**
         * On scroll event handling
         */
        this.onScroll = function () {
            var elWindow = getElementWindow(_this.el);
            if (!_this.scrollXTicking) {
                elWindow.requestAnimationFrame(_this.scrollX);
                _this.scrollXTicking = true;
            }
            if (!_this.scrollYTicking) {
                elWindow.requestAnimationFrame(_this.scrollY);
                _this.scrollYTicking = true;
            }
            if (!_this.isScrolling) {
                _this.isScrolling = true;
                addClasses$2(_this.el, _this.classNames.scrolling);
            }
            _this.showScrollbar('x');
            _this.showScrollbar('y');
            _this.onStopScrolling();
        };
        this.scrollX = function () {
            if (_this.axis.x.isOverflowing) {
                _this.positionScrollbar('x');
            }
            _this.scrollXTicking = false;
        };
        this.scrollY = function () {
            if (_this.axis.y.isOverflowing) {
                _this.positionScrollbar('y');
            }
            _this.scrollYTicking = false;
        };
        this._onStopScrolling = function () {
            removeClasses(_this.el, _this.classNames.scrolling);
            if (_this.options.autoHide) {
                _this.hideScrollbar('x');
                _this.hideScrollbar('y');
            }
            _this.isScrolling = false;
        };
        this.onMouseEnter = function () {
            if (!_this.isMouseEntering) {
                addClasses$2(_this.el, _this.classNames.mouseEntered);
                _this.showScrollbar('x');
                _this.showScrollbar('y');
                _this.isMouseEntering = true;
            }
            _this.onMouseEntered();
        };
        this._onMouseEntered = function () {
            removeClasses(_this.el, _this.classNames.mouseEntered);
            if (_this.options.autoHide) {
                _this.hideScrollbar('x');
                _this.hideScrollbar('y');
            }
            _this.isMouseEntering = false;
        };
        this._onMouseMove = function (e) {
            _this.mouseX = e.clientX;
            _this.mouseY = e.clientY;
            if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
                _this.onMouseMoveForAxis('x');
            }
            if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
                _this.onMouseMoveForAxis('y');
            }
        };
        this.onMouseLeave = function () {
            _this.onMouseMove.cancel();
            if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
                _this.onMouseLeaveForAxis('x');
            }
            if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
                _this.onMouseLeaveForAxis('y');
            }
            _this.mouseX = -1;
            _this.mouseY = -1;
        };
        this._onWindowResize = function () {
            // Recalculate scrollbarWidth in case it's a zoom
            _this.scrollbarWidth = _this.getScrollbarWidth();
            _this.hideNativeScrollbar();
        };
        this.onPointerEvent = function (e) {
            if (!_this.axis.x.track.el ||
                !_this.axis.y.track.el ||
                !_this.axis.x.scrollbar.el ||
                !_this.axis.y.scrollbar.el)
                return;
            var isWithinTrackXBounds, isWithinTrackYBounds;
            _this.axis.x.track.rect = _this.axis.x.track.el.getBoundingClientRect();
            _this.axis.y.track.rect = _this.axis.y.track.el.getBoundingClientRect();
            if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
                isWithinTrackXBounds = _this.isWithinBounds(_this.axis.x.track.rect);
            }
            if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
                isWithinTrackYBounds = _this.isWithinBounds(_this.axis.y.track.rect);
            }
            // If any pointer event is called on the scrollbar
            if (isWithinTrackXBounds || isWithinTrackYBounds) {
                // Prevent event leaking
                e.stopPropagation();
                if (e.type === 'pointerdown' && e.pointerType !== 'touch') {
                    if (isWithinTrackXBounds) {
                        _this.axis.x.scrollbar.rect =
                            _this.axis.x.scrollbar.el.getBoundingClientRect();
                        if (_this.isWithinBounds(_this.axis.x.scrollbar.rect)) {
                            _this.onDragStart(e, 'x');
                        }
                        else {
                            _this.onTrackClick(e, 'x');
                        }
                    }
                    if (isWithinTrackYBounds) {
                        _this.axis.y.scrollbar.rect =
                            _this.axis.y.scrollbar.el.getBoundingClientRect();
                        if (_this.isWithinBounds(_this.axis.y.scrollbar.rect)) {
                            _this.onDragStart(e, 'y');
                        }
                        else {
                            _this.onTrackClick(e, 'y');
                        }
                    }
                }
            }
        };
        /**
         * Drag scrollbar handle
         */
        this.drag = function (e) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            if (!_this.draggedAxis || !_this.contentWrapperEl)
                return;
            var eventOffset;
            var track = _this.axis[_this.draggedAxis].track;
            var trackSize = (_b = (_a = track.rect) === null || _a === void 0 ? void 0 : _a[_this.axis[_this.draggedAxis].sizeAttr]) !== null && _b !== void 0 ? _b : 0;
            var scrollbar = _this.axis[_this.draggedAxis].scrollbar;
            var contentSize = (_d = (_c = _this.contentWrapperEl) === null || _c === void 0 ? void 0 : _c[_this.axis[_this.draggedAxis].scrollSizeAttr]) !== null && _d !== void 0 ? _d : 0;
            var hostSize = parseInt((_f = (_e = _this.elStyles) === null || _e === void 0 ? void 0 : _e[_this.axis[_this.draggedAxis].sizeAttr]) !== null && _f !== void 0 ? _f : '0px', 10);
            e.preventDefault();
            e.stopPropagation();
            if (_this.draggedAxis === 'y') {
                eventOffset = e.pageY;
            }
            else {
                eventOffset = e.pageX;
            }
            // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).
            var dragPos = eventOffset -
                ((_h = (_g = track.rect) === null || _g === void 0 ? void 0 : _g[_this.axis[_this.draggedAxis].offsetAttr]) !== null && _h !== void 0 ? _h : 0) -
                _this.axis[_this.draggedAxis].dragOffset;
            dragPos = _this.draggedAxis === 'x' && _this.isRtl
                ? ((_k = (_j = track.rect) === null || _j === void 0 ? void 0 : _j[_this.axis[_this.draggedAxis].sizeAttr]) !== null && _k !== void 0 ? _k : 0) -
                    scrollbar.size -
                    dragPos
                : dragPos;
            // Convert the mouse position into a percentage of the scrollbar height/width.
            var dragPerc = dragPos / (trackSize - scrollbar.size);
            // Scroll the content by the same percentage.
            var scrollPos = dragPerc * (contentSize - hostSize);
            // Fix browsers inconsistency on RTL
            if (_this.draggedAxis === 'x' && _this.isRtl) {
                scrollPos = ((_l = SimpleBarCore.getRtlHelpers()) === null || _l === void 0 ? void 0 : _l.isScrollingToNegative)
                    ? -scrollPos
                    : scrollPos;
            }
            _this.contentWrapperEl[_this.axis[_this.draggedAxis].scrollOffsetAttr] =
                scrollPos;
        };
        /**
         * End scroll handle drag
         */
        this.onEndDrag = function (e) {
            _this.isDragging = false;
            var elDocument = getElementDocument(_this.el);
            var elWindow = getElementWindow(_this.el);
            e.preventDefault();
            e.stopPropagation();
            removeClasses(_this.el, _this.classNames.dragging);
            _this.onStopScrolling();
            elDocument.removeEventListener('mousemove', _this.drag, true);
            elDocument.removeEventListener('mouseup', _this.onEndDrag, true);
            _this.removePreventClickId = elWindow.setTimeout(function () {
                // Remove these asynchronously so we still suppress click events
                // generated simultaneously with mouseup.
                elDocument.removeEventListener('click', _this.preventClick, true);
                elDocument.removeEventListener('dblclick', _this.preventClick, true);
                _this.removePreventClickId = null;
            });
        };
        /**
         * Handler to ignore click events during drag
         */
        this.preventClick = function (e) {
            e.preventDefault();
            e.stopPropagation();
        };
        this.el = element;
        this.options = __assign(__assign({}, SimpleBarCore.defaultOptions), options);
        this.classNames = __assign(__assign({}, SimpleBarCore.defaultOptions.classNames), options.classNames);
        this.axis = {
            x: {
                scrollOffsetAttr: 'scrollLeft',
                sizeAttr: 'width',
                scrollSizeAttr: 'scrollWidth',
                offsetSizeAttr: 'offsetWidth',
                offsetAttr: 'left',
                overflowAttr: 'overflowX',
                dragOffset: 0,
                isOverflowing: true,
                forceVisible: false,
                track: { size: null, el: null, rect: null, isVisible: false },
                scrollbar: { size: null, el: null, rect: null, isVisible: false }
            },
            y: {
                scrollOffsetAttr: 'scrollTop',
                sizeAttr: 'height',
                scrollSizeAttr: 'scrollHeight',
                offsetSizeAttr: 'offsetHeight',
                offsetAttr: 'top',
                overflowAttr: 'overflowY',
                dragOffset: 0,
                isOverflowing: true,
                forceVisible: false,
                track: { size: null, el: null, rect: null, isVisible: false },
                scrollbar: { size: null, el: null, rect: null, isVisible: false }
            }
        };
        if (typeof this.el !== 'object' || !this.el.nodeName) {
            throw new Error("Argument passed to SimpleBar must be an HTML element instead of ".concat(this.el));
        }
        this.onMouseMove = throttle(this._onMouseMove, 64);
        this.onWindowResize = debounce(this._onWindowResize, 64, { leading: true });
        this.onStopScrolling = debounce(this._onStopScrolling, this.stopScrollDelay);
        this.onMouseEntered = debounce(this._onMouseEntered, this.stopScrollDelay);
        this.init();
    }
    /**
     * Helper to fix browsers inconsistency on RTL:
     *  - Firefox inverts the scrollbar initial position
     *  - IE11 inverts both scrollbar position and scrolling offset
     * Directly inspired by @KingSora's OverlayScrollbars https://github.com/KingSora/OverlayScrollbars/blob/master/js/OverlayScrollbars.js#L1634
     */
    SimpleBarCore.getRtlHelpers = function () {
        if (SimpleBarCore.rtlHelpers) {
            return SimpleBarCore.rtlHelpers;
        }
        var dummyDiv = document.createElement('div');
        dummyDiv.innerHTML =
            '<div class="simplebar-dummy-scrollbar-size"><div></div></div>';
        var scrollbarDummyEl = dummyDiv.firstElementChild;
        var dummyChild = scrollbarDummyEl === null || scrollbarDummyEl === void 0 ? void 0 : scrollbarDummyEl.firstElementChild;
        if (!dummyChild)
            return null;
        document.body.appendChild(scrollbarDummyEl);
        scrollbarDummyEl.scrollLeft = 0;
        var dummyContainerOffset = SimpleBarCore.getOffset(scrollbarDummyEl);
        var dummyChildOffset = SimpleBarCore.getOffset(dummyChild);
        scrollbarDummyEl.scrollLeft = -999;
        var dummyChildOffsetAfterScroll = SimpleBarCore.getOffset(dummyChild);
        document.body.removeChild(scrollbarDummyEl);
        SimpleBarCore.rtlHelpers = {
            // determines if the scrolling is responding with negative values
            isScrollOriginAtZero: dummyContainerOffset.left !== dummyChildOffset.left,
            // determines if the origin scrollbar position is inverted or not (positioned on left or right)
            isScrollingToNegative: dummyChildOffset.left !== dummyChildOffsetAfterScroll.left
        };
        return SimpleBarCore.rtlHelpers;
    };
    SimpleBarCore.prototype.getScrollbarWidth = function () {
        // Try/catch for FF 56 throwing on undefined computedStyles
        try {
            // Detect browsers supporting CSS scrollbar styling and do not calculate
            if ((this.contentWrapperEl &&
                getComputedStyle(this.contentWrapperEl, '::-webkit-scrollbar')
                    .display === 'none') ||
                'scrollbarWidth' in document.documentElement.style ||
                '-ms-overflow-style' in document.documentElement.style) {
                return 0;
            }
            else {
                return scrollbarWidth();
            }
        }
        catch (e) {
            return scrollbarWidth();
        }
    };
    SimpleBarCore.getOffset = function (el) {
        var rect = el.getBoundingClientRect();
        var elDocument = getElementDocument(el);
        var elWindow = getElementWindow(el);
        return {
            top: rect.top +
                (elWindow.pageYOffset || elDocument.documentElement.scrollTop),
            left: rect.left +
                (elWindow.pageXOffset || elDocument.documentElement.scrollLeft)
        };
    };
    SimpleBarCore.prototype.init = function () {
        // We stop here on server-side
        if (canUseDOM) {
            this.initDOM();
            this.rtlHelpers = SimpleBarCore.getRtlHelpers();
            this.scrollbarWidth = this.getScrollbarWidth();
            this.recalculate();
            this.initListeners();
        }
    };
    SimpleBarCore.prototype.initDOM = function () {
        var _a, _b;
        // assume that element has his DOM already initiated
        this.wrapperEl = this.el.querySelector(classNamesToQuery(this.classNames.wrapper));
        this.contentWrapperEl =
            this.options.scrollableNode ||
                this.el.querySelector(classNamesToQuery(this.classNames.contentWrapper));
        this.contentEl =
            this.options.contentNode ||
                this.el.querySelector(classNamesToQuery(this.classNames.contentEl));
        this.offsetEl = this.el.querySelector(classNamesToQuery(this.classNames.offset));
        this.maskEl = this.el.querySelector(classNamesToQuery(this.classNames.mask));
        this.placeholderEl = this.findChild(this.wrapperEl, classNamesToQuery(this.classNames.placeholder));
        this.heightAutoObserverWrapperEl = this.el.querySelector(classNamesToQuery(this.classNames.heightAutoObserverWrapperEl));
        this.heightAutoObserverEl = this.el.querySelector(classNamesToQuery(this.classNames.heightAutoObserverEl));
        this.axis.x.track.el = this.findChild(this.el, "".concat(classNamesToQuery(this.classNames.track)).concat(classNamesToQuery(this.classNames.horizontal)));
        this.axis.y.track.el = this.findChild(this.el, "".concat(classNamesToQuery(this.classNames.track)).concat(classNamesToQuery(this.classNames.vertical)));
        this.axis.x.scrollbar.el =
            ((_a = this.axis.x.track.el) === null || _a === void 0 ? void 0 : _a.querySelector(classNamesToQuery(this.classNames.scrollbar))) || null;
        this.axis.y.scrollbar.el =
            ((_b = this.axis.y.track.el) === null || _b === void 0 ? void 0 : _b.querySelector(classNamesToQuery(this.classNames.scrollbar))) || null;
        if (!this.options.autoHide) {
            addClasses$2(this.axis.x.scrollbar.el, this.classNames.visible);
            addClasses$2(this.axis.y.scrollbar.el, this.classNames.visible);
        }
    };
    SimpleBarCore.prototype.initListeners = function () {
        var _this = this;
        var _a;
        var elWindow = getElementWindow(this.el);
        // Event listeners
        this.el.addEventListener('mouseenter', this.onMouseEnter);
        this.el.addEventListener('pointerdown', this.onPointerEvent, true);
        this.el.addEventListener('mousemove', this.onMouseMove);
        this.el.addEventListener('mouseleave', this.onMouseLeave);
        (_a = this.contentWrapperEl) === null || _a === void 0 ? void 0 : _a.addEventListener('scroll', this.onScroll);
        // Browser zoom triggers a window resize
        elWindow.addEventListener('resize', this.onWindowResize);
        if (!this.contentEl)
            return;
        if (window.ResizeObserver) {
            // Hack for https://github.com/WICG/ResizeObserver/issues/38
            var resizeObserverStarted_1 = false;
            var resizeObserver = elWindow.ResizeObserver || ResizeObserver;
            this.resizeObserver = new resizeObserver(function () {
                if (!resizeObserverStarted_1)
                    return;
                elWindow.requestAnimationFrame(function () {
                    _this.recalculate();
                });
            });
            this.resizeObserver.observe(this.el);
            this.resizeObserver.observe(this.contentEl);
            elWindow.requestAnimationFrame(function () {
                resizeObserverStarted_1 = true;
            });
        }
        // This is required to detect horizontal scroll. Vertical scroll only needs the resizeObserver.
        this.mutationObserver = new elWindow.MutationObserver(function () {
            elWindow.requestAnimationFrame(function () {
                _this.recalculate();
            });
        });
        this.mutationObserver.observe(this.contentEl, {
            childList: true,
            subtree: true,
            characterData: true
        });
    };
    SimpleBarCore.prototype.recalculate = function () {
        if (!this.heightAutoObserverEl ||
            !this.contentEl ||
            !this.contentWrapperEl ||
            !this.wrapperEl ||
            !this.placeholderEl)
            return;
        var elWindow = getElementWindow(this.el);
        this.elStyles = elWindow.getComputedStyle(this.el);
        this.isRtl = this.elStyles.direction === 'rtl';
        var contentElOffsetWidth = this.contentEl.offsetWidth;
        var isHeightAuto = this.heightAutoObserverEl.offsetHeight <= 1;
        var isWidthAuto = this.heightAutoObserverEl.offsetWidth <= 1 || contentElOffsetWidth > 0;
        var contentWrapperElOffsetWidth = this.contentWrapperEl.offsetWidth;
        var elOverflowX = this.elStyles.overflowX;
        var elOverflowY = this.elStyles.overflowY;
        this.contentEl.style.padding = "".concat(this.elStyles.paddingTop, " ").concat(this.elStyles.paddingRight, " ").concat(this.elStyles.paddingBottom, " ").concat(this.elStyles.paddingLeft);
        this.wrapperEl.style.margin = "-".concat(this.elStyles.paddingTop, " -").concat(this.elStyles.paddingRight, " -").concat(this.elStyles.paddingBottom, " -").concat(this.elStyles.paddingLeft);
        var contentElScrollHeight = this.contentEl.scrollHeight;
        var contentElScrollWidth = this.contentEl.scrollWidth;
        this.contentWrapperEl.style.height = isHeightAuto ? 'auto' : '100%';
        // Determine placeholder size
        this.placeholderEl.style.width = isWidthAuto
            ? "".concat(contentElOffsetWidth || contentElScrollWidth, "px")
            : 'auto';
        this.placeholderEl.style.height = "".concat(contentElScrollHeight, "px");
        var contentWrapperElOffsetHeight = this.contentWrapperEl.offsetHeight;
        this.axis.x.isOverflowing =
            contentElOffsetWidth !== 0 && contentElScrollWidth > contentElOffsetWidth;
        this.axis.y.isOverflowing =
            contentElScrollHeight > contentWrapperElOffsetHeight;
        // Set isOverflowing to false if user explicitely set hidden overflow
        this.axis.x.isOverflowing =
            elOverflowX === 'hidden' ? false : this.axis.x.isOverflowing;
        this.axis.y.isOverflowing =
            elOverflowY === 'hidden' ? false : this.axis.y.isOverflowing;
        this.axis.x.forceVisible =
            this.options.forceVisible === 'x' || this.options.forceVisible === true;
        this.axis.y.forceVisible =
            this.options.forceVisible === 'y' || this.options.forceVisible === true;
        this.hideNativeScrollbar();
        // Set isOverflowing to false if scrollbar is not necessary (content is shorter than offset)
        var offsetForXScrollbar = this.axis.x.isOverflowing
            ? this.scrollbarWidth
            : 0;
        var offsetForYScrollbar = this.axis.y.isOverflowing
            ? this.scrollbarWidth
            : 0;
        this.axis.x.isOverflowing =
            this.axis.x.isOverflowing &&
                contentElScrollWidth > contentWrapperElOffsetWidth - offsetForYScrollbar;
        this.axis.y.isOverflowing =
            this.axis.y.isOverflowing &&
                contentElScrollHeight >
                    contentWrapperElOffsetHeight - offsetForXScrollbar;
        this.axis.x.scrollbar.size = this.getScrollbarSize('x');
        this.axis.y.scrollbar.size = this.getScrollbarSize('y');
        if (this.axis.x.scrollbar.el)
            this.axis.x.scrollbar.el.style.width = "".concat(this.axis.x.scrollbar.size, "px");
        if (this.axis.y.scrollbar.el)
            this.axis.y.scrollbar.el.style.height = "".concat(this.axis.y.scrollbar.size, "px");
        this.positionScrollbar('x');
        this.positionScrollbar('y');
        this.toggleTrackVisibility('x');
        this.toggleTrackVisibility('y');
    };
    /**
     * Calculate scrollbar size
     */
    SimpleBarCore.prototype.getScrollbarSize = function (axis) {
        var _a, _b;
        if (axis === void 0) { axis = 'y'; }
        if (!this.axis[axis].isOverflowing || !this.contentEl) {
            return 0;
        }
        var contentSize = this.contentEl[this.axis[axis].scrollSizeAttr];
        var trackSize = (_b = (_a = this.axis[axis].track.el) === null || _a === void 0 ? void 0 : _a[this.axis[axis].offsetSizeAttr]) !== null && _b !== void 0 ? _b : 0;
        var scrollbarRatio = trackSize / contentSize;
        var scrollbarSize;
        // Calculate new height/position of drag handle.
        scrollbarSize = Math.max(~~(scrollbarRatio * trackSize), this.options.scrollbarMinSize);
        if (this.options.scrollbarMaxSize) {
            scrollbarSize = Math.min(scrollbarSize, this.options.scrollbarMaxSize);
        }
        return scrollbarSize;
    };
    SimpleBarCore.prototype.positionScrollbar = function (axis) {
        var _a, _b, _c;
        if (axis === void 0) { axis = 'y'; }
        var scrollbar = this.axis[axis].scrollbar;
        if (!this.axis[axis].isOverflowing ||
            !this.contentWrapperEl ||
            !scrollbar.el ||
            !this.elStyles) {
            return;
        }
        var contentSize = this.contentWrapperEl[this.axis[axis].scrollSizeAttr];
        var trackSize = ((_a = this.axis[axis].track.el) === null || _a === void 0 ? void 0 : _a[this.axis[axis].offsetSizeAttr]) || 0;
        var hostSize = parseInt(this.elStyles[this.axis[axis].sizeAttr], 10);
        var scrollOffset = this.contentWrapperEl[this.axis[axis].scrollOffsetAttr];
        scrollOffset =
            axis === 'x' &&
                this.isRtl &&
                ((_b = SimpleBarCore.getRtlHelpers()) === null || _b === void 0 ? void 0 : _b.isScrollOriginAtZero)
                ? -scrollOffset
                : scrollOffset;
        if (axis === 'x' && this.isRtl) {
            scrollOffset = ((_c = SimpleBarCore.getRtlHelpers()) === null || _c === void 0 ? void 0 : _c.isScrollingToNegative)
                ? scrollOffset
                : -scrollOffset;
        }
        var scrollPourcent = scrollOffset / (contentSize - hostSize);
        var handleOffset = ~~((trackSize - scrollbar.size) * scrollPourcent);
        handleOffset =
            axis === 'x' && this.isRtl
                ? -handleOffset + (trackSize - scrollbar.size)
                : handleOffset;
        scrollbar.el.style.transform =
            axis === 'x'
                ? "translate3d(".concat(handleOffset, "px, 0, 0)")
                : "translate3d(0, ".concat(handleOffset, "px, 0)");
    };
    SimpleBarCore.prototype.toggleTrackVisibility = function (axis) {
        if (axis === void 0) { axis = 'y'; }
        var track = this.axis[axis].track.el;
        var scrollbar = this.axis[axis].scrollbar.el;
        if (!track || !scrollbar || !this.contentWrapperEl)
            return;
        if (this.axis[axis].isOverflowing || this.axis[axis].forceVisible) {
            track.style.visibility = 'visible';
            this.contentWrapperEl.style[this.axis[axis].overflowAttr] = 'scroll';
            this.el.classList.add("".concat(this.classNames.scrollable, "-").concat(axis));
        }
        else {
            track.style.visibility = 'hidden';
            this.contentWrapperEl.style[this.axis[axis].overflowAttr] = 'hidden';
            this.el.classList.remove("".concat(this.classNames.scrollable, "-").concat(axis));
        }
        // Even if forceVisible is enabled, scrollbar itself should be hidden
        if (this.axis[axis].isOverflowing) {
            scrollbar.style.display = 'block';
        }
        else {
            scrollbar.style.display = 'none';
        }
    };
    SimpleBarCore.prototype.showScrollbar = function (axis) {
        if (axis === void 0) { axis = 'y'; }
        if (this.axis[axis].isOverflowing && !this.axis[axis].scrollbar.isVisible) {
            addClasses$2(this.axis[axis].scrollbar.el, this.classNames.visible);
            this.axis[axis].scrollbar.isVisible = true;
        }
    };
    SimpleBarCore.prototype.hideScrollbar = function (axis) {
        if (axis === void 0) { axis = 'y'; }
        if (this.isDragging)
            return;
        if (this.axis[axis].isOverflowing && this.axis[axis].scrollbar.isVisible) {
            removeClasses(this.axis[axis].scrollbar.el, this.classNames.visible);
            this.axis[axis].scrollbar.isVisible = false;
        }
    };
    SimpleBarCore.prototype.hideNativeScrollbar = function () {
        if (!this.offsetEl)
            return;
        this.offsetEl.style[this.isRtl ? 'left' : 'right'] =
            this.axis.y.isOverflowing || this.axis.y.forceVisible
                ? "-".concat(this.scrollbarWidth, "px")
                : '0px';
        this.offsetEl.style.bottom =
            this.axis.x.isOverflowing || this.axis.x.forceVisible
                ? "-".concat(this.scrollbarWidth, "px")
                : '0px';
    };
    SimpleBarCore.prototype.onMouseMoveForAxis = function (axis) {
        if (axis === void 0) { axis = 'y'; }
        var currentAxis = this.axis[axis];
        if (!currentAxis.track.el || !currentAxis.scrollbar.el)
            return;
        currentAxis.track.rect = currentAxis.track.el.getBoundingClientRect();
        currentAxis.scrollbar.rect =
            currentAxis.scrollbar.el.getBoundingClientRect();
        if (this.isWithinBounds(currentAxis.track.rect)) {
            this.showScrollbar(axis);
            addClasses$2(currentAxis.track.el, this.classNames.hover);
            if (this.isWithinBounds(currentAxis.scrollbar.rect)) {
                addClasses$2(currentAxis.scrollbar.el, this.classNames.hover);
            }
            else {
                removeClasses(currentAxis.scrollbar.el, this.classNames.hover);
            }
        }
        else {
            removeClasses(currentAxis.track.el, this.classNames.hover);
            if (this.options.autoHide) {
                this.hideScrollbar(axis);
            }
        }
    };
    SimpleBarCore.prototype.onMouseLeaveForAxis = function (axis) {
        if (axis === void 0) { axis = 'y'; }
        removeClasses(this.axis[axis].track.el, this.classNames.hover);
        removeClasses(this.axis[axis].scrollbar.el, this.classNames.hover);
        if (this.options.autoHide) {
            this.hideScrollbar(axis);
        }
    };
    /**
     * on scrollbar handle drag movement starts
     */
    SimpleBarCore.prototype.onDragStart = function (e, axis) {
        var _a;
        if (axis === void 0) { axis = 'y'; }
        this.isDragging = true;
        var elDocument = getElementDocument(this.el);
        var elWindow = getElementWindow(this.el);
        var scrollbar = this.axis[axis].scrollbar;
        // Measure how far the user's mouse is from the top of the scrollbar drag handle.
        var eventOffset = axis === 'y' ? e.pageY : e.pageX;
        this.axis[axis].dragOffset =
            eventOffset - (((_a = scrollbar.rect) === null || _a === void 0 ? void 0 : _a[this.axis[axis].offsetAttr]) || 0);
        this.draggedAxis = axis;
        addClasses$2(this.el, this.classNames.dragging);
        elDocument.addEventListener('mousemove', this.drag, true);
        elDocument.addEventListener('mouseup', this.onEndDrag, true);
        if (this.removePreventClickId === null) {
            elDocument.addEventListener('click', this.preventClick, true);
            elDocument.addEventListener('dblclick', this.preventClick, true);
        }
        else {
            elWindow.clearTimeout(this.removePreventClickId);
            this.removePreventClickId = null;
        }
    };
    SimpleBarCore.prototype.onTrackClick = function (e, axis) {
        var _this = this;
        var _a, _b, _c, _d;
        if (axis === void 0) { axis = 'y'; }
        var currentAxis = this.axis[axis];
        if (!this.options.clickOnTrack ||
            !currentAxis.scrollbar.el ||
            !this.contentWrapperEl)
            return;
        // Preventing the event's default to trigger click underneath
        e.preventDefault();
        var elWindow = getElementWindow(this.el);
        this.axis[axis].scrollbar.rect =
            currentAxis.scrollbar.el.getBoundingClientRect();
        var scrollbar = this.axis[axis].scrollbar;
        var scrollbarOffset = (_b = (_a = scrollbar.rect) === null || _a === void 0 ? void 0 : _a[this.axis[axis].offsetAttr]) !== null && _b !== void 0 ? _b : 0;
        var hostSize = parseInt((_d = (_c = this.elStyles) === null || _c === void 0 ? void 0 : _c[this.axis[axis].sizeAttr]) !== null && _d !== void 0 ? _d : '0px', 10);
        var scrolled = this.contentWrapperEl[this.axis[axis].scrollOffsetAttr];
        var t = axis === 'y'
            ? this.mouseY - scrollbarOffset
            : this.mouseX - scrollbarOffset;
        var dir = t < 0 ? -1 : 1;
        var scrollSize = dir === -1 ? scrolled - hostSize : scrolled + hostSize;
        var speed = 40;
        var scrollTo = function () {
            if (!_this.contentWrapperEl)
                return;
            if (dir === -1) {
                if (scrolled > scrollSize) {
                    scrolled -= speed;
                    _this.contentWrapperEl[_this.axis[axis].scrollOffsetAttr] = scrolled;
                    elWindow.requestAnimationFrame(scrollTo);
                }
            }
            else {
                if (scrolled < scrollSize) {
                    scrolled += speed;
                    _this.contentWrapperEl[_this.axis[axis].scrollOffsetAttr] = scrolled;
                    elWindow.requestAnimationFrame(scrollTo);
                }
            }
        };
        scrollTo();
    };
    /**
     * Getter for content element
     */
    SimpleBarCore.prototype.getContentElement = function () {
        return this.contentEl;
    };
    /**
     * Getter for original scrolling element
     */
    SimpleBarCore.prototype.getScrollElement = function () {
        return this.contentWrapperEl;
    };
    SimpleBarCore.prototype.removeListeners = function () {
        var elWindow = getElementWindow(this.el);
        // Event listeners
        this.el.removeEventListener('mouseenter', this.onMouseEnter);
        this.el.removeEventListener('pointerdown', this.onPointerEvent, true);
        this.el.removeEventListener('mousemove', this.onMouseMove);
        this.el.removeEventListener('mouseleave', this.onMouseLeave);
        if (this.contentWrapperEl) {
            this.contentWrapperEl.removeEventListener('scroll', this.onScroll);
        }
        elWindow.removeEventListener('resize', this.onWindowResize);
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        // Cancel all debounced functions
        this.onMouseMove.cancel();
        this.onWindowResize.cancel();
        this.onStopScrolling.cancel();
        this.onMouseEntered.cancel();
    };
    /**
     * Remove all listeners from DOM nodes
     */
    SimpleBarCore.prototype.unMount = function () {
        this.removeListeners();
    };
    /**
     * Check if mouse is within bounds
     */
    SimpleBarCore.prototype.isWithinBounds = function (bbox) {
        return (this.mouseX >= bbox.left &&
            this.mouseX <= bbox.left + bbox.width &&
            this.mouseY >= bbox.top &&
            this.mouseY <= bbox.top + bbox.height);
    };
    /**
     * Find element children matches query
     */
    SimpleBarCore.prototype.findChild = function (el, query) {
        var matches = el.matches ||
            el.webkitMatchesSelector ||
            el.mozMatchesSelector ||
            el.msMatchesSelector;
        return Array.prototype.filter.call(el.children, function (child) {
            return matches.call(child, query);
        })[0];
    };
    SimpleBarCore.rtlHelpers = null;
    SimpleBarCore.defaultOptions = {
        forceVisible: false,
        clickOnTrack: true,
        scrollbarMinSize: 25,
        scrollbarMaxSize: 0,
        ariaLabel: 'scrollable content',
        classNames: {
            contentEl: 'simplebar-content',
            contentWrapper: 'simplebar-content-wrapper',
            offset: 'simplebar-offset',
            mask: 'simplebar-mask',
            wrapper: 'simplebar-wrapper',
            placeholder: 'simplebar-placeholder',
            scrollbar: 'simplebar-scrollbar',
            track: 'simplebar-track',
            heightAutoObserverWrapperEl: 'simplebar-height-auto-observer-wrapper',
            heightAutoObserverEl: 'simplebar-height-auto-observer',
            visible: 'simplebar-visible',
            horizontal: 'simplebar-horizontal',
            vertical: 'simplebar-vertical',
            hover: 'simplebar-hover',
            dragging: 'simplebar-dragging',
            scrolling: 'simplebar-scrolling',
            scrollable: 'simplebar-scrollable',
            mouseEntered: 'simplebar-mouse-entered'
        },
        scrollableNode: null,
        contentNode: null,
        autoHide: true
    };
    /**
     * Static functions
     */
    SimpleBarCore.getOptions = getOptions$2;
    SimpleBarCore.helpers = helpers;
    return SimpleBarCore;
}());

/**
 * simplebar - v6.2.6
 * Scrollbars, simpler.
 * https://grsmto.github.io/simplebar/
 *
 * Made by Adrien Denat from a fork by Jonathan Nicol
 * Under MIT License
 */


/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var _a = SimpleBarCore.helpers, getOptions = _a.getOptions, addClasses = _a.addClasses;
var SimpleBar = /** @class */ (function (_super) {
    __extends(SimpleBar, _super);
    function SimpleBar() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        // // Save a reference to the instance, so we know this DOM node has already been instancied
        SimpleBar.instances.set(args[0], _this);
        return _this;
    }
    SimpleBar.initDOMLoadedElements = function () {
        document.removeEventListener('DOMContentLoaded', this.initDOMLoadedElements);
        window.removeEventListener('load', this.initDOMLoadedElements);
        Array.prototype.forEach.call(document.querySelectorAll('[data-simplebar]'), function (el) {
            if (el.getAttribute('data-simplebar') !== 'init' &&
                !SimpleBar.instances.has(el))
                new SimpleBar(el, getOptions(el.attributes));
        });
    };
    SimpleBar.removeObserver = function () {
        var _a;
        (_a = SimpleBar.globalObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
    };
    SimpleBar.prototype.initDOM = function () {
        var _this = this;
        var _a, _b, _c;
        // make sure this element doesn't have the elements yet
        if (!Array.prototype.filter.call(this.el.children, function (child) {
            return child.classList.contains(_this.classNames.wrapper);
        }).length) {
            // Prepare DOM
            this.wrapperEl = document.createElement('div');
            this.contentWrapperEl = document.createElement('div');
            this.offsetEl = document.createElement('div');
            this.maskEl = document.createElement('div');
            this.contentEl = document.createElement('div');
            this.placeholderEl = document.createElement('div');
            this.heightAutoObserverWrapperEl = document.createElement('div');
            this.heightAutoObserverEl = document.createElement('div');
            addClasses(this.wrapperEl, this.classNames.wrapper);
            addClasses(this.contentWrapperEl, this.classNames.contentWrapper);
            addClasses(this.offsetEl, this.classNames.offset);
            addClasses(this.maskEl, this.classNames.mask);
            addClasses(this.contentEl, this.classNames.contentEl);
            addClasses(this.placeholderEl, this.classNames.placeholder);
            addClasses(this.heightAutoObserverWrapperEl, this.classNames.heightAutoObserverWrapperEl);
            addClasses(this.heightAutoObserverEl, this.classNames.heightAutoObserverEl);
            while (this.el.firstChild) {
                this.contentEl.appendChild(this.el.firstChild);
            }
            this.contentWrapperEl.appendChild(this.contentEl);
            this.offsetEl.appendChild(this.contentWrapperEl);
            this.maskEl.appendChild(this.offsetEl);
            this.heightAutoObserverWrapperEl.appendChild(this.heightAutoObserverEl);
            this.wrapperEl.appendChild(this.heightAutoObserverWrapperEl);
            this.wrapperEl.appendChild(this.maskEl);
            this.wrapperEl.appendChild(this.placeholderEl);
            this.el.appendChild(this.wrapperEl);
            (_a = this.contentWrapperEl) === null || _a === void 0 ? void 0 : _a.setAttribute('tabindex', '0');
            (_b = this.contentWrapperEl) === null || _b === void 0 ? void 0 : _b.setAttribute('role', 'region');
            (_c = this.contentWrapperEl) === null || _c === void 0 ? void 0 : _c.setAttribute('aria-label', this.options.ariaLabel);
        }
        if (!this.axis.x.track.el || !this.axis.y.track.el) {
            var track = document.createElement('div');
            var scrollbar = document.createElement('div');
            addClasses(track, this.classNames.track);
            addClasses(scrollbar, this.classNames.scrollbar);
            track.appendChild(scrollbar);
            this.axis.x.track.el = track.cloneNode(true);
            addClasses(this.axis.x.track.el, this.classNames.horizontal);
            this.axis.y.track.el = track.cloneNode(true);
            addClasses(this.axis.y.track.el, this.classNames.vertical);
            this.el.appendChild(this.axis.x.track.el);
            this.el.appendChild(this.axis.y.track.el);
        }
        SimpleBarCore.prototype.initDOM.call(this);
        this.el.setAttribute('data-simplebar', 'init');
    };
    SimpleBar.prototype.unMount = function () {
        SimpleBarCore.prototype.unMount.call(this);
        SimpleBar.instances["delete"](this.el);
    };
    SimpleBar.initHtmlApi = function () {
        this.initDOMLoadedElements = this.initDOMLoadedElements.bind(this);
        // MutationObserver is IE11+
        if (typeof MutationObserver !== 'undefined') {
            // Mutation observer to observe dynamically added elements
            this.globalObserver = new MutationObserver(SimpleBar.handleMutations);
            this.globalObserver.observe(document, { childList: true, subtree: true });
        }
        // Taken from jQuery `ready` function
        // Instantiate elements already present on the page
        if (document.readyState === 'complete' || // @ts-ignore: IE specific
            (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
            // Handle it asynchronously to allow scripts the opportunity to delay init
            window.setTimeout(this.initDOMLoadedElements);
        }
        else {
            document.addEventListener('DOMContentLoaded', this.initDOMLoadedElements);
            window.addEventListener('load', this.initDOMLoadedElements);
        }
    };
    SimpleBar.handleMutations = function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (addedNode) {
                if (addedNode.nodeType === 1) {
                    if (addedNode.hasAttribute('data-simplebar')) {
                        !SimpleBar.instances.has(addedNode) &&
                            document.documentElement.contains(addedNode) &&
                            new SimpleBar(addedNode, getOptions(addedNode.attributes));
                    }
                    else {
                        addedNode
                            .querySelectorAll('[data-simplebar]')
                            .forEach(function (el) {
                            if (el.getAttribute('data-simplebar') !== 'init' &&
                                !SimpleBar.instances.has(el) &&
                                document.documentElement.contains(el))
                                new SimpleBar(el, getOptions(el.attributes));
                        });
                    }
                }
            });
            mutation.removedNodes.forEach(function (removedNode) {
                var _a;
                if (removedNode.nodeType === 1) {
                    if (removedNode.getAttribute('data-simplebar') === 'init') {
                        !document.documentElement.contains(removedNode) &&
                            ((_a = SimpleBar.instances.get(removedNode)) === null || _a === void 0 ? void 0 : _a.unMount());
                    }
                    else {
                        Array.prototype.forEach.call(removedNode.querySelectorAll('[data-simplebar="init"]'), function (el) {
                            var _a;
                            !document.documentElement.contains(el) &&
                                ((_a = SimpleBar.instances.get(el)) === null || _a === void 0 ? void 0 : _a.unMount());
                        });
                    }
                }
            });
        });
    };
    SimpleBar.instances = new WeakMap();
    return SimpleBar;
}(SimpleBarCore));
/**
 * HTML API
 * Called only in a browser env.
 */
if (canUseDOM) {
    SimpleBar.initHtmlApi();
}

const initialCardState = {
  selectedActionCardId: null,
  selectedHandCardId: null,
  cardConnections: []
};
function getStoredState() {
  if (typeof localStorage !== "undefined") {
    const storedState = localStorage.getItem("cardState");
    if (storedState) {
      try {
        return JSON.parse(storedState);
      } catch (e) {
        console.error("Error parsing cardState from localStorage", e);
      }
    }
  }
  return initialCardState;
}
const cardState = getStoredState();
if (typeof localStorage !== "undefined") {
  localStorage.setItem("cardState", JSON.stringify(cardState));
}
function RiskCard($$payload, $$props) {
  push();
  let { riskCard } = $$props;
  $$payload.out += `<svg${attr("id", `RiskCard_${stringify(riskCard.id)}`)} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 353.2 490.96" style="width: inherit; height: inherit;"><defs><linearGradient id="RiskCard_linear-gradient" x1="1.2" y1="245.48" x2="337.67" y2="245.48" gradientTransform="translate(-76.05 414.91) rotate(-90)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#43466e"></stop><stop offset="1" stop-color="#585e81"></stop></linearGradient><linearGradient id="RiskCard_linear-gradient-2" x1="61.71" y1="17.65" x2="78.66" y2="17.65" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fa6b49"></stop><stop offset="1" stop-color="#feb749"></stop></linearGradient><linearGradient id="RiskCard_linear-gradient-3" x1="84.98" x2="101.93" xlink:href="#RiskCard_linear-gradient-2"></linearGradient><linearGradient id="RiskCard_linear-gradient-4" x1="236.94" x2="253.88" xlink:href="#RiskCard_linear-gradient-2"></linearGradient><linearGradient id="linear-gradient-5" x1="260.2" x2="277.15" xlink:href="#RiskCard_linear-gradient-2"></linearGradient><clipPath id="RiskCard_clippath"><path d="M48.39,48.31h242.7c8.89,0,16.1,7.22,16.1,16.1v180.51c0,9.02-7.33,16.35-16.35,16.35H48.81c-9.13,0-16.53-7.41-16.53-16.53V64.42c0-8.9,7.22-16.12,16.12-16.12Z" fill="none" stroke-width="0"></path></clipPath></defs><rect x="-74.85" y="77.24" width="488.56" height="336.47" rx="25.88" ry="25.88" transform="translate(414.91 76.05) rotate(90)" fill="url(#RiskCard_linear-gradient)" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="2.4"></rect><rect x="-54.63" y="97.46" width="448.12" height="312.72" rx="16.58" ry="16.58" transform="translate(423.26 84.39) rotate(90)" fill="#40406b" stroke-width="0"></rect><rect x="16.04" y="32.73" width="306.79" height="442.19" rx="15.62" ry="15.62" fill="#282844" stroke-width="0"></rect><path d="M290.14,22.97h-2.6c-.74,0-1.26-.74-1.01-1.44l4.11-11.35c.15-.43.56-.71,1.01-.71h2.6c.74,0,1.26.74,1.01,1.44l-4.11,11.35c-.15.43-.56.71-1.01.71Z" fill="#282844" stroke-width="0"></path><path d="M298.61,22.97h-2.6c-.74,0-1.26-.74-1.01-1.44l4.11-11.35c.15-.43.56-.71,1.01-.71h2.6c.74,0,1.26.74,1.01,1.44l-4.11,11.35c-.15.43-.56.71-1.01.71Z" fill="#282844" stroke-width="0"></path><path d="M307.09,22.97h-2.6c-.74,0-1.26-.74-1.01-1.44l4.11-11.35c.15-.43.56-.71,1.01-.71h2.6c.74,0,1.26.74,1.01,1.44l-4.11,11.35c-.15.43-.56.71-1.01.71Z" fill="#282844" stroke-width="0"></path><path d="M48.72,22.97h2.6c.74,0,1.26-.74,1.01-1.44l-4.11-11.35c-.15-.43-.56-.71-1.01-.71h-2.6c-.74,0-1.26.74-1.01,1.44l4.11,11.35c.15.43.56.71,1.01.71Z" fill="#282844" stroke-width="0"></path><path d="M40.25,22.97h2.6c.74,0,1.26-.74,1.01-1.44l-4.11-11.35c-.15-.43-.56-.71-1.01-.71h-2.6c-.74,0-1.26.74-1.01,1.44l4.11,11.35c.15.43.56.71,1.01.71Z" fill="#282844" stroke-width="0"></path><path d="M31.78,22.97h2.6c.74,0,1.26-.74,1.01-1.44l-4.11-11.35c-.15-.43-.56-.71-1.01-.71h-2.6c-.74,0-1.26.74-1.01,1.44l4.11,11.35c.15.43.56.71,1.01.71Z" fill="#282844" stroke-width="0"></path><path d="M323.22,20.72c0,.78-.63,1.41-1.41,1.41s-1.41-.63-1.41-1.41.63-1.41,1.41-1.41,1.41.63,1.41,1.41Z" fill="#282844" stroke-width="0"></path><path d="M322.98,20.72c0,.65-.53,1.18-1.18,1.18s-1.18-.53-1.18-1.18.53-1.18,1.18-1.18,1.18.53,1.18,1.18Z" fill="#28bbff" stroke-width="0"></path><path d="M18.47,20.72c0,.78-.63,1.41-1.41,1.41s-1.41-.63-1.41-1.41.63-1.41,1.41-1.41,1.41.63,1.41,1.41Z" fill="#282844" stroke-width="0"></path><path d="M18.24,20.72c0,.65-.53,1.18-1.18,1.18s-1.18-.53-1.18-1.18.53-1.18,1.18-1.18,1.18.53,1.18,1.18Z" fill="#28bbff" stroke-width="0"></path><path d="M63.5,13.92c2.89-.36,8.75-.9,13.47-.11.98.16,1.69,1.02,1.69,2.01v3.87c0,1.09-.86,1.99-1.95,2.03-2.99.12-8.82.29-13.1.06-1.07-.06-1.9-.95-1.9-2.03v-3.81c0-1.03.76-1.89,1.78-2.02Z" fill="url(#RiskCard_linear-gradient-2)" stroke-width="0"></path><path d="M86.76,13.92c2.89-.36,8.75-.9,13.47-.11.98.16,1.69,1.02,1.69,2.01v3.87c0,1.09-.86,1.99-1.95,2.03-2.99.12-8.82.29-13.1.06-1.07-.06-1.9-.95-1.9-2.03v-3.81c0-1.03.76-1.89,1.78-2.02Z" fill="url(#RiskCard_linear-gradient-3)" stroke-width="0"></path><path d="M238.72,13.92c2.89-.36,8.75-.9,13.47-.11.98.16,1.69,1.02,1.69,2.01v3.87c0,1.09-.86,1.99-1.95,2.03-2.99.12-8.82.29-13.1.06-1.07-.06-1.9-.95-1.9-2.03v-3.81c0-1.03.76-1.89,1.78-2.02Z" fill="url(#RiskCard_linear-gradient-4)" stroke-width="0"></path><path d="M261.99,13.92c2.89-.36,8.75-.9,13.47-.11.98.16,1.69,1.02,1.69,2.01v3.87c0,1.09-.86,1.99-1.95,2.03-2.99.12-8.82.29-13.1.06-1.07-.06-1.9-.95-1.9-2.03v-3.81c0-1.03.76-1.89,1.78-2.02Z" fill="url(#RiskCard_linear-gradient-5)" stroke-width="0"></path><rect x="31.02" y="47.27" width="276.82" height="214.99" rx="17.52" ry="17.52" fill="none" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="1.78"></rect><text transform="translate(125.11 23.25)" fill="#ff9d00" font-family="ChangaOne, 'Changa One'" font-size="19.16"><tspan x="0" y="0">Risk Card</tspan></text><foreignObject x="40" y="270" width="260" height="60"><div class="font-['Change One'] size-full content-center text-center text-[19px] font-bold text-white">${escape_html(riskCard.title)}</div></foreignObject><foreignObject x="30" y="320" width="280" height="140"><div class="size-full text-center font-['Lato'] text-[15px] text-white">${escape_html(riskCard.description)}</div></foreignObject><g clip-path="url(#RiskCard_clippath)"><image width="1515" height="906" transform="translate(-68 44) scale(.31 .24)"${attr("xlink:href", `/assets/Pictures/RiskCards/${stringify(riskCard.id)}.jpg`)}></image></g></svg>`;
  pop();
}
function CardHand($$payload, $$props) {
  push();
  let risks = [];
  getContext("Notification");
  getContext("Objectives");
  const each_array = ensure_array_like(risks);
  $$payload.out += `<div class="handbg mb-3 ml-3 mr-3 mt-3 flex size-full content-center text-center svelte-1d3s9r"><!--[-->`;
  for (let cardIndex = 0; cardIndex < each_array.length; cardIndex++) {
    const card = each_array[cardIndex];
    $$payload.out += "<!--[-->";
    $$payload.out += `<div${attr("class", `card-container card-wrapper ${stringify(cardState.selectedActionCardId === null ? "disabled" : "")} svelte-1d3s9r ${stringify([
      cardState.selectedHandCardId === cardIndex ? "selected" : ""
    ].filter(Boolean).join(" "))}`)} role="button" tabindex="0"><!--[-->`;
    if (cardState.cardConnections.find((conn) => conn.handCardId === card.attributes.cost)) {
      $$payload.out += `<div class="action-card">ActionCard ${escape_html(cardState.cardConnections.find((conn) => conn.handCardId === card.attributes.cost)?.actionCardId)}</div>`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += ` <div class="card svelte-1d3s9r"${attr("id", card.id)}><!--[-->`;
    RiskCard($$payload, { riskCard: card });
    $$payload.out += `<!--]--></div></div>`;
    $$payload.out += "<!--]-->";
  }
  $$payload.out += "<!--]-->";
  $$payload.out += `</div>`;
  pop();
}
function EndTurnSVG($$payload) {
  $$payload.out += `<svg id="EndTurn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 125.04 32.83" style="height: inherit; width: inherit;"><rect id="EndTurn_shadow" x="47.41" y="-44.79" width="30.21" height="125.04" rx="14.42" ry="14.42" transform="translate(80.24 -44.79) rotate(90)" fill="#00a33b" stroke-width="0"></rect><rect id="EndTurn_border" x="47.41" y="-47.41" width="30.21" height="125.04" rx="14.42" ry="14.42" transform="translate(77.62 -47.41) rotate(90)" fill="#bdf9c9" stroke-width="0"></rect><rect id="EndTurn_background" x="1.9" y="1.9" width="121.23" height="26.41" rx="11.39" ry="11.39" fill="#3ef46f" stroke-width="0"></rect><rect id="EndTurn_strip" x="18.84" y="30.21" width="87.83" height="2.62" fill="#058854" stroke-width="0"></rect><text transform="translate(11.5 20.49)" fill="#f7ffec" font-family="ChangaOne, 'Changa One'" font-size="15.88" stroke="#282844" stroke-linecap="round" stroke-linejoin="round" stroke-width=".51"><tspan x="0" y="0">Finish the turn</tspan></text></svg>`;
}
function GameOverModal($$payload, $$props) {
  push();
  const { show } = $$props;
  $$payload.out += `<!--[-->`;
  if (show) {
    $$payload.out += `<div class="modal-overlay svelte-bzdy3p"><div class="modal-content svelte-bzdy3p"><div class="modal-header svelte-bzdy3p"><h2 class="svelte-bzdy3p">Game Over</h2></div> <div class="modal-body svelte-bzdy3p"><p class="svelte-bzdy3p">You have lost the game.</p></div> <div class="modal-footer svelte-bzdy3p"><button class="restart-button svelte-bzdy3p">Restart</button> <button class="main-menu-button svelte-bzdy3p">Main Menu</button></div></div></div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  pop();
}
function GameWonModal($$payload, $$props) {
  push();
  const { show } = $$props;
  let score = void 0;
  $$payload.out += `<!--[-->`;
  if (show) {
    $$payload.out += `<div class="modal-overlay svelte-kshyj4"><div class="modal-content svelte-kshyj4"><div class="modal-header svelte-kshyj4"><h2 class="svelte-kshyj4">You Win!</h2></div> <div class="modal-body svelte-kshyj4"><p class="svelte-kshyj4">Congratulations! You have successfully managed all risks.</p> <p class="svelte-kshyj4">Score: ${escape_html(score)} / 100</p></div> <div class="modal-footer svelte-kshyj4"><button class="main-menu-button svelte-kshyj4">Restart</button> <button class="main-menu-button svelte-kshyj4">Main Menu</button></div></div></div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  pop();
}
function EndTurn_1($$payload, $$props) {
  push();
  getContext("Notification");
  getContext("Timeline");
  getContext("RiskCards");
  getContext("MitigateCards");
  getContext("EndTurn");
  getContext("Objectives");
  getContext("RiskLogs");
  let gameOver = false;
  let gameWon = false;
  $$payload.out += `<!--[-->`;
  GameOverModal($$payload, { show: gameOver });
  $$payload.out += `<!--]--> <!--[-->`;
  GameWonModal($$payload, { show: gameWon });
  $$payload.out += `<!--]--> <button id="EndTurn_button" class="flex size-full items-center justify-center"><!--[-->`;
  EndTurnSVG($$payload);
  $$payload.out += `<!--]--></button>`;
  pop();
}
function MenuRestartSVG($$payload) {
  let color = "#8E56DC";
  $$payload.out += `<svg width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 8C14.5523 8 15 8.44772 15 9L15 15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15L13 9C13 8.44772 13.4477 8 14 8ZM10 8C10.5523 8 11 8.44772 11 9L11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15L9 9C9 8.44772 9.44772 8 10 8ZM7.25007 2.38782C8.54878 2.0992 10.1243 2 12 2C13.8757 2 15.4512 2.0992 16.7499 2.38782C18.06 2.67897 19.1488 3.176 19.9864 4.01358C20.824 4.85116 21.321 5.94002 21.6122 7.25007C21.9008 8.54878 22 10.1243 22 12C22 13.8757 21.9008 15.4512 21.6122 16.7499C21.321 18.06 20.824 19.1488 19.9864 19.9864C19.1488 20.824 18.06 21.321 16.7499 21.6122C15.4512 21.9008 13.8757 22 12 22C10.1243 22 8.54878 21.9008 7.25007 21.6122C5.94002 21.321 4.85116 20.824 4.01358 19.9864C3.176 19.1488 2.67897 18.06 2.38782 16.7499C2.0992 15.4512 2 13.8757 2 12C2 10.1243 2.0992 8.54878 2.38782 7.25007C2.67897 5.94002 3.176 4.85116 4.01358 4.01358C4.85116 3.176 5.94002 2.67897 7.25007 2.38782Z"${attr("fill", color)}></path></svg>`;
}
function MenuRestart($$payload, $$props) {
  push();
  $$payload.out += `<div class="size-full content-center text-center svelte-sryrpk"><button type="button" class="credits-button svelte-sryrpk"><!--[-->`;
  MenuRestartSVG($$payload);
  $$payload.out += `<!--]--></button></div> <!--[-->`;
  {
    $$payload.out += "<!--]!-->";
  }
  pop();
}
function SimpleBar_1($$payload, $$props) {
  push();
  let {
    children,
    options = { autoHide: false },
    contentClass = "",
    element = void 0,
    styleProp = void 0,
    classProp = void 0
  } = $$props;
  const style = styleProp ?? (classProp ? void 0 : "height:100%");
  $$payload.out += `<div${attr("class", `${stringify(classProp)} svelte-1ijx8vy`)}${attr("style", style)}><div class="simplebar-wrapper svelte-1ijx8vy"><div class="simplebar-height-auto-observer-wrapper svelte-1ijx8vy"><div class="simplebar-height-auto-observer svelte-1ijx8vy"></div></div> <div class="simplebar-mask svelte-1ijx8vy"><div class="simplebar-offset svelte-1ijx8vy"><div class="simplebar-content-wrapper svelte-1ijx8vy"><div${attr("class", `simplebar-content ${stringify(contentClass)} svelte-1ijx8vy`)} style="margin-right: 11px;"><!--[-->`;
  children($$payload);
  $$payload.out += `<!--]--></div></div></div></div> <div class="simplebar-placeholder svelte-1ijx8vy"></div></div> <div class="simplebar-track simplebar-horizontal svelte-1ijx8vy"><div class="simplebar-scrollbar svelte-1ijx8vy"></div></div> <div class="simplebar-track simplebar-vertical svelte-1ijx8vy"><div class="simplebar-scrollbar svelte-1ijx8vy"></div></div></div>`;
  bind_props($$props, { element });
  pop();
}
function MitigationCard($$payload, $$props) {
  push();
  let { mitigationCard } = $$props;
  let color = "#43466e";
  if (mitigationCard.category === "Technical") {
    color = "#3e97ff";
  } else if (mitigationCard.category === "Management") {
    color = "#38963b";
  } else if (mitigationCard.category === "Commercial") {
    color = "#f07d3a";
  } else if (mitigationCard.category === "External") {
    color = "#a152ad";
  }
  $$payload.out += `<svg${attr("id", `ActionCard_${stringify(mitigationCard.id)}`)} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 119.02 172.82" style="width: inherit; height: inherit;"><defs><linearGradient id="ActionCard_linear-gradient" x1="92.44" y1="254.69" x2="38.75" y2="-19.72" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#43466e"></stop><stop offset="1" stop-color="#585e81"></stop></linearGradient><linearGradient id="ActionCard_linear-gradient-2" x1="-.61" y1="-75.39" x2="74.56" y2="-75.39" gradientTransform="translate(22.55 142.13)" xlink:href="#ActionCard_linear-gradient"></linearGradient><clipPath id="ActionCard_clippath"><circle cx="59.52" cy="66.74" r="36.48" fill="none" stroke-width="0"></circle></clipPath><clipPath id="ActionCard_clippath-1"><rect x="21.93" y="29.14" width="75.2" height="75.2" fill="none" stroke-width="0"></rect></clipPath></defs><rect x="100.46" y="37.63" width="18.56" height="107.34" rx="3.09" ry="3.09"${attr("fill", color)} stroke-width="0"></rect><rect y="37.63" width="18.56" height="107.34" rx="3.09" ry="3.09"${attr("fill", color)} stroke-width="0"></rect><rect x="3.65" y=".89" width="111.73" height="171.03" rx="12.41" ry="12.41" fill="url(#ActionCard_linear-gradient)" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="1.78"></rect><foreignObject x="15" y="0" width="85" height="26"><div class="font-['Change One'] z-50 size-full content-center text-center text-[8px] font-bold text-white">${escape_html(mitigationCard.title)}</div></foreignObject><foreignObject x="10" y="110" width="100" height="60"><div class="size-full text-center font-['Lato'] text-[7px] text-white">${escape_html(mitigationCard.description)}</div></foreignObject><g id="Frame"><path d="M74.92,32.38c-3.04-1.3-8.41-3.15-15.33-3.16-6.99-.01-12.42,1.85-15.47,3.16-3.63,1.88-16.06,8.78-20.51,23.16-1.09,3.52-1.68,7.25-1.68,11.13,0,20.76,16.83,37.59,37.59,37.59,20.76,0,37.59-16.83,37.59-37.59,0-15.27-9.11-28.4-22.19-34.29Z" fill="url(#ActionCard_linear-gradient-2)" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="2.4"></path></g><g><g clip-path="url(#ActionCard_clippath)"><g clip-path="url(#ActionCard_clippath-1)"><image width="1024" height="1024" transform="translate(21.93 29.14) scale(.07)"${attr("xlink:href", `/assets/Pictures/MitigationCards/${stringify(mitigationCard.id)}.jpg`)}></image></g></g></g></svg>`;
  pop();
}
function MitigationCardsSVG($$payload, $$props) {
  push();
  let { children } = $$props;
  $$payload.out += `<svg id="ActionCards" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600.2 325.5" style="width: inherit; height: inherit;"><defs><linearGradient id="ActionCards_linear-gradient" x1="307.85" y1="365.46" x2="291.18" y2="-22.18" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#43466e"></stop><stop offset="1" stop-color="#585e81"></stop></linearGradient><linearGradient id="ActionCards_linear-gradient-2" x1="-190.26" y1="14.63" x2="-65.86" y2="14.63" gradientTransform="translate(172.04) rotate(-180) scale(1 -1)" xlink:href="#ActionCards_linear-gradient"></linearGradient></defs><path d="M2,325.5V45.32c0-9.12,7.39-16.51,16.51-16.51h563.17c9.12,0,16.51,7.39,16.51,16.51v280.18" fill="url(#ActionCards_linear-gradient)" fill-opacity=".6" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="4"></path><rect x="9.4" y="52.33" width="581.4" height="247.27" rx="8.4" ry="8.4" fill="#282844" stroke-width="0"></rect><foreignObject x="15" y="55" width="570" height="262"><!--[-->`;
  children($$payload);
  $$payload.out += `<!--]--></foreignObject><path d="M14.16,312.94h554.47" fill="#757575" opacity=".23" stroke-width="0"></path><path d="M12.05,307.53c.28,0,.52.36.52.81v1.74c0,.22-.05.42-.15.57l-.8,1.26.8,1.26c.1.15.15.36.15.57v1.74c0,.45-.23.81-.52.81-.14,0-.26-.08-.36-.24l-1.97-3.1c-.37-.58-.37-1.52,0-2.09l1.97-3.1c.1-.15.23-.24.36-.24h0Z" fill="#6e78b3" stroke-width="0"></path><path d="M12.3,313.36l-.92-1.45.92-1.45c.07-.1.1-.24.1-.39v-1.74c0-.49-.38-.73-.59-.39l-1.97,3.1c-.3.48-.3,1.25,0,1.72l1.97,3.1c.22.34.59.1.59-.39v-1.74c0-.15-.04-.28-.1-.39Z" fill="#6e78b3" stroke-width="0"></path><path d="M587.83,316.29c-.28,0-.52-.36-.52-.81v-1.74c0-.22.05-.42.15-.57l.8-1.26-.8-1.26c-.1-.15-.15-.36-.15-.57v-1.74c0-.45.23-.81.52-.81.14,0,.26.08.36.24l1.97,3.1c.37.58.37,1.52,0,2.09l-1.97,3.1c-.1.15-.23.24-.36.24h0Z" fill="#6e78b3" stroke-width="0"></path><path d="M587.58,310.47l.92,1.45-.92,1.45c-.07.1-.1.24-.1.39v1.74c0,.49.38.73.59.39l1.97-3.1c.3-.48.3-1.25,0-1.72l-1.97-3.1c-.22-.34-.59-.1-.59.39v1.74c0,.15.04.28.1.39Z" fill="#6e78b3" stroke-width="0"></path><polygon points="362.3 27.76 354.6 1.5 302.3 1.5 297.9 1.5 244.85 1.5 237.9 27.76 362.3 27.76" fill="url(#ActionCards_linear-gradient-2)" fill-opacity=".61" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="3"></polygon><text transform="translate(252.62 20.28)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="16.37" letter-spacing=".02em"><tspan x="0" y="0">Action Cards</tspan></text></svg>`;
  pop();
}
function MitigationCards($$payload, $$props) {
  push();
  let cards = [];
  let cardState$1 = cardState;
  $$payload.out += `<div class="size-full"><!--[-->`;
  MitigationCardsSVG($$payload, {
    children: ($$payload2, $$slotProps) => {
      $$payload2.out += `<!--[-->`;
      SimpleBar_1($$payload2, {
        children: ($$payload3, $$slotProps2) => {
          const each_array = ensure_array_like(cards);
          $$payload3.out += `<div class="flex h-[240px] w-[570px] gap-4"><!--[-->`;
          for (let mCardIndex = 0; mCardIndex < each_array.length; mCardIndex++) {
            const card = each_array[mCardIndex];
            $$payload3.out += "<!--[-->";
            $$payload3.out += `<div${attr("class", `card-wrapper size-60 ${stringify([
              cardState$1.selectedActionCardId === mCardIndex ? "selected" : ""
            ].filter(Boolean).join(" "))}`)} draggable="true" role="button" tabindex="0"><!--[-->`;
            if (card.used) {
              $$payload3.out += `<div class="card-old svelte-v3d81a"><div class="w-[165px]"><!--[-->`;
              MitigationCard($$payload3, { mitigationCard: card });
              $$payload3.out += `<!--]--></div></div>`;
              $$payload3.out += "<!--]-->";
            } else {
              $$payload3.out += `<div class="card svelte-v3d81a"><div class="w-[165px] svelte-v3d81a"><!--[-->`;
              MitigationCard($$payload3, { mitigationCard: card });
              $$payload3.out += `<!--]--></div></div>`;
              $$payload3.out += "<!--]!-->";
            }
            $$payload3.out += `</div>`;
            $$payload3.out += "<!--]-->";
          }
          $$payload3.out += "<!--]-->";
          $$payload3.out += `</div>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!--]--></div>`;
  pop();
}
function NotificationSVG($$payload, $$props) {
  let { name, icon, message } = $$props;
  $$payload.out += `<svg id="Manager" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 428.25 215.31" style="height: inherit; width: inherit;"><rect x="34.98" y="2" width="391.28" height="183.41" rx="8.4" ry="8.4" fill="#282844" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="4"></rect><foreignObject x="140" y="10" width="280" height="170"><!--[-->`;
  SimpleBar_1($$payload, {
    children: ($$payload2, $$slotProps) => {
      $$payload2.out += `<div class="font-['Lato'] text-white"><span class="mr-1 font-['Changa_One'] text-xl">${escape_html(name)}:</span> ${escape_html(message)}</div>`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!--]--></foreignObject><foreignObject x="0" y="5" width="140" height="220"><div><!--[-->`;
  icon?.($$payload, {});
  $$payload.out += `<!--]--></div></foreignObject></svg>`;
}
function Happy($$payload) {
  $$payload.out += `<svg id="Manager_Happy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109.46 170.44"><rect x="59.16" y="44.42" width="23.5" height="19.76" transform="translate(-4.13 102.74) rotate(-70.29)" fill="#f0b297" stroke-width="0"></rect><path d="M84.18,46.57l-2.44,6.8c-5.97,2.09-13.13,2.37-21.04.14l4.88-13.61,18.6,6.67Z" fill="#d1785e" stroke-width="0"></path><path d="M85.76,43.77c.74.53,1.71.68,2.62.57.9-.1,1.75-.44,2.57-.81,2.16-.97,4.36-2.39,5.03-4.62.22-.75.25-1.59-.15-2.28-.48-.82-1.49-1.26-2.45-1.24-.96.02-1.86.44-2.61,1l-5.01,7.37Z" fill="#f0b297" stroke-width="0"></path><path d="M65.65,36.57c-.91-.06-1.75-.56-2.39-1.22-.63-.65-1.07-1.45-1.47-2.26-1.05-2.12-1.85-4.61-.95-6.76.3-.72.82-1.39,1.56-1.67.89-.33,1.95-.03,2.68.6.73.62,1.15,1.52,1.38,2.43l-.81,8.87Z" fill="#f0b297" stroke-width="0"></path><path d="M88.66,46.01c3.09-6.62,6.3-9.97,8.82-13.52,1.85-2.68,4.46-7.46,2.61-13.15-1.74-5.86-9.34-11.55-17.96-12.14-8.67-.6-14.69,2.44-15.62,8.02-.64,3.31-1.75,7.82-2.38,11.24-.53,2.85-2.32,5.25-2.26,8.23.24,5.18,4.56,15.66,10.21,17.68,4.61,1.65,15.06-3.54,16.57-6.36Z" fill="#f0b297" stroke-width="0"></path><path d="M78.27,35.21c.02-.13.04-.24.06-.34.02-.1.04-.19.06-.28.02-.09.06-.19.11-.3.05-.11.11-.23.18-.35.13-.24.27-.49.35-.71.08-.22.09-.42,0-.57-.08-.15-.2-.18-.37-.13-.17.05-.38.19-.64.41-.25.22-.55.54-.77.96-.11.21-.18.45-.22.68-.04.23-.04.46-.03.69.01.22.05.43.1.63.05.2.11.38.17.53.13.32.27.58.39.79.25.4.43.57.63.41.19-.15.27-.38.2-.77-.03-.2-.1-.43-.16-.71-.03-.14-.06-.29-.08-.45-.01-.15-.02-.32,0-.48Z" fill="#d1785e" stroke-width="0"></path><path d="M85.06,29.94c.82.1,1.63.35,2.37.73.74.38,1.42.89,1.99,1.51.56.62,0,1.22-.63.8-.63-.42-1.27-.8-1.93-1.14-.66-.34-1.34-.64-2.04-.91-.71-.27-.57-1.08.25-.99Z" fill="#1a1a1a" stroke-width="0"></path><path d="M75.66,26.51c-.71-.43-1.5-.73-2.31-.89-.82-.16-1.66-.18-2.49-.05-.83.14-.75.95,0,1.02.76.06,1.49.16,2.22.3.73.14,1.45.33,2.17.55.72.22,1.12-.5.42-.93Z" fill="#1a1a1a" stroke-width="0"></path><path d="M72.84,32.07l.64-1.82c.31-.88-.16-1.85-1.03-2.16h0c-.88-.31-1.85.16-2.16,1.03l-.64,1.82c-.31.88,2.88,2,3.19,1.12Z" fill="#1a1a1a" stroke-width="0"></path><path d="M83.78,35.99l.66-1.82c.32-.87,1.29-1.33,2.17-1.01h0c.87.32,1.33,1.29,1.01,2.17l-.66,1.82c-.32.87-3.5-.28-3.18-1.16Z" fill="#1a1a1a" stroke-width="0"></path><path d="M72.34,40.17c2.5,1.88,5.96,2.21,8.8.93.44-.2.05-.84-.38-.64-2.61,1.17-5.77.77-8.05-.94-.16-.12-.42-.02-.51.14-.11.19-.02.39.14.51h0Z" fill="#a33939" stroke-width="0"></path><path d="M101.6,79.35c1.46,2.31,3.79,6.83,3.38,8.65-.42,1.82-10.41,50.65-11.08,53.8-1.33,6.33-18.33-6.75-17.65-10.94.68-4.19,2.91-35.7,2.91-35.7l15.9-19.96s4.99,1.71,6.53,4.15Z" fill="#8b9fbe" stroke-width="0"></path><path d="M25.1,141.15c-.55-.2-.92-.33-1.07-.39-2.76-1.03-10.14-6.38-10.67-8.67,8.76-14.77,10.32-25.01,11.83-34.91.85-5.57,3.73-17.26,3.73-17.26-.36-2.48,3.94-18.52,7.18-24.6l23.48-1.27,8.43,6.21,1.91.68,10.46.56,17.33,15.89c-1.36,6.76-8.22,21.88-10.08,23.56,0,0-5.57,11.04-8.75,15.82-5.39,8.1-10.96,16.48-13.5,33.3v.07c-.96.71-6.4,1.44-8.76.99-7.59-1.44-30.54-9.65-31.52-10Z" fill="#cfd7e9" stroke-width="0"></path><polygon points="69.43 70.62 74.24 68.44 74.19 61.89 69.32 59.63 64.12 58.28 59.93 63.31 62.25 68.04 37.2 120.36 42.53 134.38 55.55 126.94 69.43 70.62" fill="#6e78b3" stroke-width="0"></polygon><polygon points="81.46 56.62 69.32 59.63 72.64 61.65 70.18 77.58 85.15 65.95 81.46 56.62" fill="#e7ebf4" stroke-width="0"></polygon><polygon points="61.85 49.59 69.32 59.63 65.46 59.08 57.25 72.94 53.08 54.45 61.85 49.59" fill="#e7ebf4" stroke-width="0"></polygon><path d="M32.07,54.13c-2.6.86-7.27,2.86-8.1,4.54-.83,1.67-18.55,37.03-23.34,46.76-4.22,9.52,14.24,16.26,16.35,13.97,2.11-2.29,22.39-38.8,22.39-38.8l.39-25.52s-4.94-1.85-7.68-.94Z" fill="#8b9fbe" stroke-width="0"></path><path d="M100.26,77.92l-16.02-14.28-21.66,42.35-20.51,54.94c5.43,7.47,19.29,10.54,21.4,9.21,2.11-1.32,4.17-14.54,4.72-17.02,5.75-26.29,20.15-51.39,20.15-51.39,0,0,10.85-17.31,11.93-23.8Z" fill="#8b9fbe" stroke-width="0"></path><path d="M45.95,99.6l9.3-46.35-20.79.65c-3.29,5.69-6.55,26.17-6.55,26.17,0,0-3.11,28.65-16.05,51.95-.95,2.1-8.31,14.69-7.8,16.56.51,1.88,14.92,10.94,22.8,9.01l19.09-57.98Z" fill="#8b9fbe" stroke-width="0"></path><path d="M93.43,29.34c-.68-.29-1.31-.71-1.82-1.21-1.38-1.34-3.01-2.49-3.4-4.25-.52-2.37,1.62-4.63.06-5.78-2.48-1.84-8.93-1.22-10.89-3.53-.41-.49-.7-1.05-.86-1.64-.89.63-2.03,1.06-3.11,1.41-1.95.64-4.11,1.41-4.86,3.17-.46,1.08-.27,2.33-.36,3.52-.15,2.25-3.97,7.76-3.97,7.76-.31-1.04-.91-4.75-.87-6.22.04-1.7.87-3.26,1.05-4.94.19-1.81-.37-3.69-.11-5.49.3-2.05,1.75-3.84,3.74-4.72.22-.97.52-1.92.96-2.81.94-1.9,2.58-3.56,4.78-4.16,1.95-.53,4.34-.05,5.83,1.33,4.03-1.55,8.51-2.66,12.5-.77,3.59,1.71,5.57,5.34,8.51,7.92,1.72,1.51,3.78,2.66,5.54,4.13,1.76,1.47,3.27,3.44,3.29,5.55,0,1.06-.51,2.1-1.31,2.81.44.63.67,1.4.59,2.11-.16,1.57-1.35,2.81-2.59,3.83-1.24,1.02-5.23,1.55-6.01,2.91-.89,1.54-6.83,8.95-6.83,8.95l1.18-9.53c-.36-.07-.71-.19-1.05-.34Z" fill="#a0864a" stroke-width="0"></path><path d="M87.59,143.14c.62-1.16.76-14.5-3.52-17.94-4.28-3.44-48.99-24.92-48.99-24.92,0,0-3.85,3.17-4.14,6.59,0,0,30.15,23.89,34.18,26.91,4.03,3.02,21.84,10.52,22.47,9.36Z" fill="#f0b297" stroke-width="0"></path><path d="M36.86,101.62s-8.01-7.12-8.5-7.64l-4.88,13.6,9.65.18,3.72-6.14Z" fill="#f0b297" stroke-width="0"></path><path d="M43.09,101.09l-7.9,12.7s27.57,20.71,39.34,27.94c11.78,7.23,18.86,4.37,19.34-.37.48-4.74-.89-12.5-8.09-17.25-7.2-4.76-42.69-23.01-42.69-23.01Z" fill="#8b9fbe" stroke-width="0"></path><path d="M4.98,114.1c.49-1.23,9.51-13.83,14.89-12.75,5.38,1.08,54.75,27.45,54.75,27.45,0,0-4.89,6.33-7.07,6.42,0,0-26.48-8.37-36.19-10.56-4.92-1.11-26.87-9.33-26.38-10.56Z" fill="#f0b297" stroke-width="0"></path><path d="M63.89,132.94c2.27,2.55,5.36,4.1,8.11,6.05,1.12.8,2.5,1.62,3.69,1.07.67-.31,1.09-.99,1.48-1.63,1.26-2.08.47-5.99,1.97-8.76,1.06-1.94,2.74-6.28,1.64-6.53-2.9-.67-9.04,2.18-12.49,2.61-.5.06-.96.26-1.36.58-1.54,1.25-4.97,4.45-3.04,6.61Z" fill="#f0b297" stroke-width="0"></path><path d="M77.8,131.24c2.93,1.13,4.98,1.71,7.51,2,1.59.18,3.65-.51,8.99-1.57,1.99-.39.2-2.4-1.83-2.23-3.03.26-2.5.35-6.09.24-2.91-.09-4.94-2.04-7.66-2.58-1.83-.36-2.68,3.46-.93,4.13Z" fill="#f0b297" stroke-width="0"></path><path d="M76.82,134.64c4.26,1.2,5.53,2.16,8.42,2.42,2.2.2,3.48-.28,7.15-.35,2.52-.05,2.03-2.97-.48-2.93-3.75.07-5.09.13-5.09.13-3.72-.27-6.95-2.35-10.57-3.06-2.44-.48-1.83,3.1.57,3.78Z" fill="#f0b297" stroke-width="0"></path><path d="M75.63,137.2c3.28,1.93,6.54,3.42,8.31,3.75.82.15,4.55,0,5.57,0,1.57.01,3.01-.6,3.01-.6.86-.48.48-1.92-.56-2.04-1.21-.14-5.28-.14-7.87-.6-3.67-.65-5.02-3.24-8.54-4.3-2.37-.72-2.08,2.52.07,3.79Z" fill="#f0b297" stroke-width="0"></path><path d="M73.32,139.85c2.94,1.61,4.11,1.81,5.46,2.33.63.24,3.07.66,4.52,1.13.78.25,3.06.62,3.06.62.75-.33.64-1.47-.16-1.72-.94-.29-2.71-.77-4.68-1.53-2.8-1.08-4.95-3.34-7.56-4.77-1.76-.97-2.41,2.97-.64,3.94Z" fill="#f0b297" stroke-width="0"></path><path d="M77.2,130.06c2.19-2.08,3.56-3.55,4.91-3.55,1.46,0,3.44-.04,4.36-.24.92-.2,2.11-1.03,2.52-1.92.83-1.79-3.01-1.77-5.72-2.2-2.16-.35-3.48,0-4.67.53-1.48.66-6.58,3.07-6.58,3.07l5.18,4.32Z" fill="#f0b297" stroke-width="0"></path><path d="M60.29,135.34l8.08-13.15s-44.4-21.62-48.17-23.52c-3.77-1.9-12.15.92-14.86,5.83-2.7,4.91-3.55,9.37,1.4,12.45,4.95,3.08,53.54,18.39,53.54,18.39Z" fill="#8b9fbe" stroke-width="0"></path></svg>`;
}
function Notification($$payload, $$props) {
  push();
  let notifiction = getContext("Notification");
  $$payload.out += `<!--[-->`;
  if (notifiction?.notification) {
    $$payload.out += `<div class="size-full"><!--[-->`;
    NotificationSVG($$payload, {
      name: "Manager",
      icon: Happy,
      message: notifiction.notification.message
    });
    $$payload.out += `<!--]--></div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += "<!--]!-->";
  }
  pop();
}
function ObjectiveSVG($$payload) {
  $$payload.out += `<svg id="Objectives" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 151.61 217.9" style="height: inherit; width: inherit;"><defs><linearGradient id="Objectives_linear-gradient" x1="656.97" y1="8.96" x2="736.04" y2="8.96" gradientTransform="translate(776.01) rotate(-180) scale(1 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#43466e"></stop><stop offset="1" stop-color="#585e81"></stop></linearGradient><linearGradient id="Objectives_linear-gradient-2" x1="252.66" y1="514.15" x2="285.64" y2="514.15" gradientTransform="translate(-509.66 -108.49) rotate(90) scale(1 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#b2f1e8"></stop><stop offset="1" stop-color="#f7ffec"></stop></linearGradient><linearGradient id="Objectives_linear-gradient-3" x1="352.19" y1="514.15" x2="385.17" y2="514.15" gradientTransform="translate(-509.66 437.85) rotate(-90)" xlink:href="#Objectives_linear-gradient-2"></linearGradient><linearGradient id="Objectives_linear-gradient-4" x1="8.59" y1="116.87" x2="150.41" y2="116.87" gradientTransform="translate(-37.36 196.37) rotate(-90)" xlink:href="#Objectives_linear-gradient"></linearGradient><clipPath id="Objectives_clippath"><rect x="28.23" y="50.13" width="102.54" height="9.33" rx="4.67" ry="4.67" transform="translate(159.01 109.59) rotate(-180)" fill="none" stroke-width="0"></rect></clipPath><linearGradient id="Objectives_linear-gradient-5" x1="78.85" y1="54.75" x2="82.27" y2="54.75" gradientTransform="matrix(1,0,0,1,0,0)" xlink:href="#Objectives_linear-gradient-2"></linearGradient><clipPath id="Objectives_clippath-1"><rect x="28.23" y="95.72" width="102.54" height="9.33" rx="4.67" ry="4.67" transform="translate(159.01 200.78) rotate(-180)" fill="none" stroke-width="0"></rect></clipPath><linearGradient id="Objectives_linear-gradient-6" x1="78.85" y1="100.34" x2="82.27" y2="100.34" gradientTransform="matrix(1,0,0,1,0,0)" xlink:href="#Objectives_linear-gradient-2"></linearGradient><clipPath id="Objectives_clippath-2"><rect x="28.23" y="141.36" width="102.54" height="9.33" rx="4.67" ry="4.67" transform="translate(159.01 292.05) rotate(-180)" fill="none" stroke-width="0"></rect></clipPath><linearGradient id="Objectives_linear-gradient-7" x1="78.85" y1="145.98" x2="82.27" y2="145.98" gradientTransform="matrix(1,0,0,1,0,0)" xlink:href="#Objectives_linear-gradient-2"></linearGradient><clipPath id="Objectives_clippath-3"><rect x="28.23" y="186.98" width="102.54" height="9.33" rx="4.67" ry="4.67" transform="translate(159.01 383.29) rotate(-180)" fill="none" stroke-width="0"></rect></clipPath><linearGradient id="Objectives_linear-gradient-8" x1="78.85" y1="191.6" x2="82.27" y2="191.6" gradientTransform="matrix(1,0,0,1,0,0)" xlink:href="#Objectives_linear-gradient-2"></linearGradient></defs><polygon points="119.04 17.03 112.94 .89 80.9 .89 78.1 .89 46.54 .89 39.97 17.03 119.04 17.03" fill="url(#Objectives_linear-gradient)" fill-opacity=".6" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="1.78"></polygon><text transform="translate(53.78 12.23)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="10" letter-spacing=".02em"><tspan x="0" y="0">Objectives</tspan></text><polygon points="8.59 144.17 .38 148.21 .38 160.08 .38 161.25 .38 173.11 8.59 177.15 8.59 144.17" fill="url(#Objectives_linear-gradient-2)" stroke="#8b9fbe" stroke-miterlimit="10" stroke-width=".76"></polygon><polygon points="8.59 85.66 .38 81.61 .38 69.75 .38 68.58 .38 56.72 8.59 52.67 8.59 85.66" fill="url(#Objectives_linear-gradient-3)" stroke="#8b9fbe" stroke-miterlimit="10" stroke-width=".76"></polygon><rect x="-20.33" y="45.96" width="199.67" height="141.82" rx="14.83" ry="14.83" transform="translate(196.37 37.36) rotate(90)" fill="url(#Objectives_linear-gradient-4)" fill-opacity=".61" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="2.4"></rect><rect x="-14.4" y="51.88" width="187.81" height="130.68" rx="10.4" ry="10.4" transform="translate(196.72 37.72) rotate(90)" fill="#40406b" stroke-width="0"></rect><rect x="15.56" y="24.8" width="127.89" height="184.84" rx="8.4" ry="8.4" fill="#282844" stroke-width="0"></rect><path d="M60.3,79.04c-.13,0-.25.06-.33.19l-.15.24c-.06.1-.17.17-.28.21,0,0,0,0,0,0-.12.03-.24.02-.35-.04l-.25-.14c-.25-.14-.56.04-.57.33v.29c0,.12-.06.23-.15.32,0,0,0,0,0,0-.09.09-.2.14-.32.14h-.29c-.29,0-.47.32-.33.58l.14.25c.06.11.07.23.04.35,0,0,0,0,0,0-.03.12-.1.22-.2.28l-.24.15c-.25.15-.25.51,0,.66l.24.15c.1.06.17.16.2.28,0,0,0,0,0,0,.03.12.02.24-.04.35l-.14.25c-.14.25.04.56.33.57h.29c.12,0,.23.06.32.15h0c.09.09.14.2.14.32v.29c0,.29.32.47.57.33l.25-.14c.11-.06.23-.07.35-.04,0,0,0,0,0,0,.12.03.22.1.28.2l.15.24c.15.25.51.25.66,0l.15-.24c.06-.1.16-.17.28-.2,0,0,0,0,0,0,.12-.03.24-.02.35.04l.25.14c.25.14.57-.04.57-.33v-.29c0-.12.06-.23.15-.32h0c.09-.09.2-.14.32-.14h.29c.29,0,.47-.32.33-.57l-.14-.25c-.06-.11-.07-.23-.04-.35,0,0,0,0,0,0,.03-.12.1-.22.2-.28l.24-.15c.25-.15.25-.51,0-.66l-.24-.15c-.1-.06-.17-.16-.2-.28,0,0,0,0,0,0-.03-.12-.02-.24.04-.35l.14-.25c.14-.25-.04-.57-.33-.57h-.29c-.12,0-.23-.06-.32-.15h0c-.09-.09-.14-.2-.14-.32v-.29c0-.29-.32-.47-.58-.33l-.25.14c-.11.06-.23.07-.35.04,0,0,0,0,0,0-.12-.03-.22-.1-.28-.2l-.15-.24c-.07-.12-.2-.19-.33-.19ZM57.78,85.65l-.77,1.84,1.35-.12.9,1.05.74-1.78c-.26-.07-.48-.24-.63-.48l-.04-.06-.06.03c-.16.09-.34.14-.52.14-.43,0-.8-.26-.97-.62ZM62.82,85.65c-.17.37-.55.62-.97.62-.18,0-.36-.05-.52-.14l-.06-.03-.04.06c-.14.24-.37.41-.63.48l.74,1.78.9-1.05,1.35.12-.77-1.84Z" fill="#edfdeb" stroke-width="0"></path><rect x="73.94" y="2.64" width="11.12" height="104.31" rx="5.27" ry="5.27" transform="translate(134.3 -24.71) rotate(90)" fill="#40406b" stroke="#5a6591" stroke-miterlimit="10" stroke-width=".5"></rect><g clip-path="url(#Objectives_clippath)"><rect x="28.23" y="49.97" width="34.18" height="9.65" fill="#ea5a3d" stroke-width="0"></rect><rect x="62.41" y="49.97" width="34.18" height="9.65" fill="#f9bd00" stroke-width="0"></rect><rect x="96.59" y="49.97" width="34.18" height="9.65" fill="#3fa400" stroke-width="0"></rect></g><text transform="translate(31 56.84)" fill="#ba3a25" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".02em"><tspan x="0" y="0">Less</tspan></text><text transform="translate(113.14 56.84)" fill="#2f7700" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".02em"><tspan x="0" y="0">More</tspan></text><rect id="Objectives_Scope-progress-bar" x="78.85" y="47.23" width="3.42" height="15.04" rx="1.71" ry="1.71" fill="url(#Objectives_linear-gradient-5)" stroke="#8b9fbe" stroke-miterlimit="10" stroke-width=".25"></rect><path id="Objectives_Scope-progress-track" d="M27.35,54.75h104.22H27.35Z" fill="none" opacity="0" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></path><rect x="73.94" y="48.23" width="11.12" height="104.31" rx="5.27" ry="5.27" transform="translate(179.89 20.88) rotate(90)" fill="#40406b" stroke="#5a6591" stroke-miterlimit="10" stroke-width=".5"></rect><g clip-path="url(#Objectives_clippath-1)"><rect x="28.23" y="95.56" width="34.18" height="9.65" fill="#ea5a3d" stroke-width="0"></rect><rect x="62.41" y="95.56" width="34.18" height="9.65" fill="#f9bd00" stroke-width="0"></rect><rect x="96.59" y="95.56" width="34.18" height="9.65" fill="#3fa400" stroke-width="0"></rect></g><text transform="translate(31 102.43)" fill="#ba3a25" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".02em"><tspan x="0" y="0">Lower</tspan></text><text transform="translate(108.66 102.43)" fill="#2f7700" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".02em"><tspan x="0" y="0">Higher</tspan></text><rect id="Objectives_Quality-progress-bar" x="78.85" y="92.83" width="3.42" height="15.04" rx="1.71" ry="1.71" fill="url(#Objectives_linear-gradient-6)" stroke="#8b9fbe" stroke-miterlimit="10" stroke-width=".25"></rect><path id="Objectives_Quality-progress-track" d="M27.35,100.34h104.22H27.35Z" fill="none" opacity="0" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></path><rect x="73.94" y="93.87" width="11.12" height="104.31" rx="5.27" ry="5.27" transform="translate(225.53 66.52) rotate(90)" fill="#40406b" stroke="#5a6591" stroke-miterlimit="10" stroke-width=".5"></rect><g clip-path="url(#Objectives_clippath-2)"><rect x="28.23" y="141.2" width="34.18" height="9.65" fill="#ea5a3d" stroke-width="0"></rect><rect x="62.41" y="141.2" width="34.18" height="9.65" fill="#f9bd00" stroke-width="0"></rect><rect x="96.59" y="141.2" width="34.18" height="9.65" fill="#3fa400" stroke-width="0"></rect></g><text transform="translate(31 148.07)" fill="#ba3a25" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".02em"><tspan x="0" y="0">Longer</tspan></text><text transform="translate(105.95 148.07)" fill="#2f7700" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".02em"><tspan x="0" y="0">Shorter</tspan></text><rect id="Objectives_Time-progress-bar" x="78.85" y="138.46" width="3.42" height="15.04" rx="1.71" ry="1.71" fill="url(#Objectives_linear-gradient-7)" stroke="#8b9fbe" stroke-miterlimit="10" stroke-width=".25"></rect><path id="Objectives_Time-progress-track" d="M27.35,145.6h104.31H27.35Z" fill="none" opacity="0" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></path><rect x="73.94" y="139.49" width="11.12" height="104.31" rx="5.27" ry="5.27" transform="translate(271.15 112.14) rotate(90)" fill="#40406b" stroke="#5a6591" stroke-miterlimit="10" stroke-width=".5"></rect><g clip-path="url(#Objectives_clippath-3)"><rect x="28.23" y="186.82" width="34.18" height="9.65" fill="#ea5a3d" stroke-width="0"></rect><rect x="62.41" y="186.82" width="34.18" height="9.65" fill="#f9bd00" stroke-width="0"></rect><rect x="96.59" y="186.82" width="34.18" height="9.65" fill="#3fa400" stroke-width="0"></rect></g><text transform="translate(31 193.69)" fill="#ba3a25" font-family="ChangaOne, 'Changa One'" font-size="6"><tspan x="0" y="0">Expensive</tspan></text><text transform="translate(104.48 193.69)" fill="#2f7700" font-family="ChangaOne, 'Changa One'" font-size="6" letter-spacing=".01em"><tspan x="0" y="0">Cheaper</tspan></text><path id="Objectives_Cost-progress-track" d="M27.35,191.59h104.31H27.35Z" fill="none" opacity="0" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></path><rect id="Objectives_Cost-progress-bar" x="78.85" y="184.08" width="3.42" height="15.04" rx="1.71" ry="1.71" fill="url(#Objectives_linear-gradient-8)" stroke="#8b9fbe" stroke-miterlimit="10" stroke-width=".25"></rect><text transform="translate(70.87 41.15)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="10" letter-spacing=".02em"><tspan x="0" y="0">Scope</tspan></text><line x1="21.51" y1="69.3" x2="139.6" y2="69.3" fill="none" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></line><text transform="translate(66.76 86.77)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="10" letter-spacing=".02em"><tspan x="0" y="0">Quality</tspan></text><line x1="21.51" y1="114.91" x2="139.6" y2="114.91" fill="none" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></line><text transform="translate(74.36 132.39)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="10" letter-spacing=".02em"><tspan x="0" y="0">Time</tspan></text><line x1="21.51" y1="160.53" x2="139.6" y2="160.53" fill="none" stroke="#131321" stroke-miterlimit="10" stroke-width=".25"></line><text transform="translate(76.18 178.69)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="10" letter-spacing=".02em"><tspan x="0" y="0">Cost</tspan></text><path d="M67.44,125.54c-2.11,0-3.82,1.71-3.82,3.82s1.71,3.82,3.82,3.82,3.82-1.71,3.82-3.82-1.71-3.82-3.82-3.82ZM68.43,130.89l-1.26-1.26c-.07-.07-.11-.17-.11-.27v-1.91c0-.21.17-.38.38-.38h0c.21,0,.38.17.38.38v1.75l1.15,1.15c.15.15.15.39,0,.54h0c-.15.15-.39.15-.54,0Z" fill="#edfdeb" stroke-width="0"></path><path d="M67.02,172.6h3.14l.53-1.41c.04-.11.03-.23-.04-.32-.07-.1-.17-.15-.29-.15h-.89c-.19-.28-.51-.47-.88-.47s-.69.19-.88.47h-.89c-.12,0-.22.06-.29.15-.07.1-.08.22-.04.32l.53,1.41ZM70.67,173.31h-4.15c-.98.87-2.46,2.55-2.38,4.68.04,1.2,1.03,2.15,2.24,2.15h4.44c1.21,0,2.19-.94,2.24-2.15.08-2.13-1.4-3.81-2.38-4.68ZM68.94,178.49v.12c0,.2-.16.35-.35.35s-.35-.16-.35-.35v-.13c-.36-.08-.66-.34-.78-.7-.06-.19.04-.38.23-.44s.39.04.44.23c.04.14.17.23.32.23h.43c.23,0,.41-.19.41-.42s-.19-.42-.42-.42h-.34c-.62,0-1.12-.5-1.12-1.12,0-.51.35-.94.82-1.08v-.16c0-.2.16-.35.35-.35s.35.16.35.35v.13c.36.08.66.34.77.71.06.19-.05.38-.24.44-.19.06-.38-.05-.44-.24-.04-.14-.17-.24-.32-.24h-.19c-.23,0-.41.19-.41.42s.19.42.42.42h.34c.62,0,1.12.5,1.12,1.12s-.47,1.08-1.06,1.12Z" fill="#edfdeb" stroke-width="0"></path><path d="M64.23,42.72h-.93c-.19,0-.34-.16-.33-.35,0,0,0,0,0,0,0-.1,0-.2,0-.29-1.63-.42-2.64-1.44-3.06-3.06-.12,0-.24,0-.36,0-.2,0-.29-.13-.29-.34,0-.3,0-.61,0-.91,0-.23.09-.33.29-.33.12,0,.24,0,.35,0,.42-1.63,1.44-2.64,3.06-3.06,0-.11,0-.23,0-.34,0-.21.11-.3.33-.3.3,0,.6,0,.9,0,.22,0,.34.09.34.3,0,.12,0,.24,0,.35,1.63.42,2.64,1.44,3.06,3.06.09,0,.19,0,.29,0,0,0,0,0,0,0,.19-.01.35.14.35.33v.93c0,.19-.16.34-.35.33,0,0,0,0,0,0-.1,0-.2,0-.29,0-.42,1.63-1.44,2.64-3.06,3.06,0,.09,0,.19,0,.29,0,0,0,0,0,0,.01.19-.14.35-.33.35ZM63.68,41.15c1.66.05,3.02-1.28,3.03-2.93,0-1.62-1.31-2.94-2.93-2.94-1.65,0-2.99,1.36-2.94,3.02.04,1.55,1.3,2.81,2.84,2.85Z" fill="#edfdeb" stroke-width="0"></path><path d="M66.09,38.22c0,1.28-1.04,2.32-2.32,2.32-1.28,0-2.32-1.05-2.32-2.32,0-1.28,1.04-2.31,2.32-2.31,1.28,0,2.32,1.04,2.32,2.32ZM64.07,37.92c0-.25,0-.48,0-.71,0-.18-.13-.31-.3-.31-.17,0-.3.13-.3.31,0,.2,0,.4,0,.6,0,.03,0,.07,0,.1-.02,0-.02,0-.02,0-.23,0-.45,0-.68,0-.12,0-.22.05-.28.16-.11.2.03.43.27.44.24,0,.47,0,.72,0,0,.05,0,.08,0,.12,0,.2,0,.41,0,.61,0,.16.12.28.27.29.15.01.28-.09.31-.24,0-.04,0-.09,0-.13,0-.22,0-.43,0-.65.23,0,.46,0,.68,0,.2,0,.34-.12.34-.3,0-.18-.14-.3-.34-.3-.22,0-.44,0-.68,0Z" fill="#edfdeb" stroke-width="0"></path></svg>`;
}
function Objective_1($$payload, $$props) {
  push();
  getContext("Objectives");
  $$payload.out += `<div class="size-full"><!--[-->`;
  ObjectiveSVG($$payload);
  $$payload.out += `<!--]--></div>`;
  pop();
}
function ExternalSVG($$payload) {
  $$payload.out += `<svg id="RiskLog_Category_External" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60.49 15.37"><rect x="0" y="-.13" width="60.75" height="15.5" rx="7.75" ry="7.75" fill="#a152ad" stroke-width="0"></rect><text transform="translate(7.66 11.4) scale(1.1 1)" fill="#fff" font-family="Lato-Regular, Lato" font-size="10.92" letter-spacing="0em"><tspan x="0" y="0">External</tspan></text></svg>`;
}
function ManagementSVG($$payload) {
  $$payload.out += `<svg id="RiskLog_Category_Management" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86.63 15.5"><rect x=".29" y="0" width="85.88" height="15.5" rx="7.75" ry="7.75" fill="#38963b" stroke-width="0"></rect><text transform="translate(7.79 11.53) scale(1.1 1)" fill="#fff" font-family="Lato-Regular, Lato" font-size="10.92" letter-spacing=".01em"><tspan x="0" y="0">Management</tspan></text></svg>`;
}
function TechnicalSVG($$payload) {
  $$payload.out += `<svg id="RiskLog_Category_Technical" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65.63 15.78"><rect x=".13" y=".28" width="65.51" height="15.5" rx="7.75" ry="7.75" fill="#3e97ff" stroke-width="0"></rect><text transform="translate(7.88 11.81) scale(1.1 1)" fill="#fff" font-family="Lato-Regular, Lato" font-size="10.92"><tspan x="0" y="0" letter-spacing="-.09em">T</tspan> <tspan x="5.41" y="0" letter-spacing=".01em">echnical</tspan></text></svg>`;
}
function CommercialSVG($$payload) {
  $$payload.out += `<svg id="RiskLog_Category_Commercial" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79.12 15.5"><rect x=".06" y="0" width="79.05" height="15.5" rx="7.75" ry="7.75" fill="#f07d3a" stroke-width="0"></rect><text transform="translate(7.17 11.53) scale(1.1 1)" fill="#fff" font-family="Lato-Regular, Lato" font-size="10.92" letter-spacing="0em"><tspan x="0" y="0">Commercial</tspan></text></svg>`;
}
function Category($$payload, $$props) {
  let { category } = $$props;
  $$payload.out += `<!--[-->`;
  if (category === "External") {
    $$payload.out += `<div class="ml-2 size-10/12"><!--[-->`;
    ExternalSVG($$payload);
    $$payload.out += `<!--]--></div>`;
    $$payload.out += "<!--]-->";
  } else {
    $$payload.out += `<!--[-->`;
    if (category === "Management") {
      $$payload.out += `<!--[-->`;
      ManagementSVG($$payload);
      $$payload.out += `<!--]-->`;
      $$payload.out += "<!--]-->";
    } else {
      $$payload.out += `<!--[-->`;
      if (category === "Technical") {
        $$payload.out += `<div class="ml-2 size-10/12"><!--[-->`;
        TechnicalSVG($$payload);
        $$payload.out += `<!--]--></div>`;
        $$payload.out += "<!--]-->";
      } else {
        $$payload.out += `<!--[-->`;
        if (category === "Commercial") {
          $$payload.out += `<!--[-->`;
          CommercialSVG($$payload);
          $$payload.out += `<!--]-->`;
          $$payload.out += "<!--]-->";
        } else {
          $$payload.out += "<!--]!-->";
        }
        $$payload.out += "<!--]!-->";
      }
      $$payload.out += "<!--]!-->";
    }
    $$payload.out += "<!--]!-->";
  }
}
function ImpactSVG($$payload, $$props) {
  let { text } = $$props;
  $$payload.out += `<svg id="RiskLog_Category_External" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66.19 15.83"><g id="RiskLog_Impact"><path d="M8.51,2.66c.25,0,.49,0,.74,0,.2.02.39.04.59.07,1.12.17,2.11.6,2.95,1.28,1.01.83,1.65,1.85,1.89,3.07.04.19.06.39.09.59v.67c-.02.13-.03.25-.05.38-.18,1.16-.71,2.18-1.62,3.01-1.51,1.37-3.33,1.88-5.43,1.5-1.43-.26-2.59-.94-3.47-2-.98-1.17-1.36-2.49-1.15-3.95.17-1.17.72-2.17,1.63-3.01.88-.82,1.94-1.33,3.19-1.52.21-.03.43-.06.65-.08ZM5.95,11.06c.16,0,.27-.07.38-.17,1.91-1.74,3.82-3.47,5.73-5.2.03-.03.07-.06.1-.09.19-.23.07-.56-.23-.64-.19-.05-.35.02-.49.14-1.92,1.74-3.83,3.48-5.75,5.22-.03.02-.05.05-.08.07-.11.13-.13.28-.06.43.08.15.22.23.4.23ZM10.57,8.03c-.91,0-1.67.69-1.67,1.52,0,.83.77,1.52,1.68,1.52.91,0,1.67-.7,1.66-1.52,0-.83-.76-1.51-1.68-1.51ZM8.83,6.45c0-.83-.75-1.51-1.66-1.51-.92,0-1.67.68-1.67,1.52,0,.83.76,1.51,1.67,1.5.91,0,1.66-.68,1.66-1.51Z" fill="#f3edf7" stroke-width="0"></path><path d="M9.89,9.55c0-.34.32-.62.69-.62.37,0,.68.28.68.62,0,.34-.32.63-.69.62-.37,0-.68-.29-.68-.62Z" fill="#f3edf7" stroke-width="0"></path><path d="M7.85,6.46c0,.34-.3.62-.68.62-.38,0-.69-.28-.69-.62,0-.34.32-.62.69-.62.37,0,.67.28.67.62Z" fill="#f3edf7" stroke-width="0"></path><rect x=".74" y=".71" width="64.77" height="14.53" rx="7.26" ry="7.26" fill="none" stroke="#f3edf7" stroke-miterlimit="10" stroke-width=".75"></rect><foreignObject x="16" y="-1.5" width="45" height="16"><div><p class="text-[11px] text-white">${escape_html(text)}</p></div></foreignObject></g></svg>`;
}
function RiskLogSVG($$payload, $$props) {
  let { risk, mitigate, category, impact, color } = $$props;
  let outer_color = void 0;
  if (color === "Red") {
    outer_color = "#ea5a3d";
  } else if (color === "Yellow") {
    outer_color = "#f9bd00";
  } else if (color === "Green") {
    outer_color = "#3fa400";
  } else if (color === "Plain") {
    outer_color = "#282844";
  }
  $$payload.out += `<svg id="RiskLog" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 262.32 55.61"><defs><filter id="RiskLog_luminosity-invert" x="-2.02" y="-2.16" width="266.4" height="60" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feColorMatrix result="cm" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"></feColorMatrix></filter><mask id="RiskLog_mask" x="-2.02" y="-2.16" width="266.4" height="60" maskUnits="userSpaceOnUse"><g filter="url(#RiskLog_luminosity-invert)"><image width="1110" height="250" transform="translate(-2.02 -2.16) scale(.24)" xlink:href="data:image/png;base64,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"></image></g></mask></defs><g isolation="isolate"><g><g><g opacity=".8"><rect width="262.32" height="55.61" rx="10.78" ry="10.78" fill="#282844" stroke-width="0"></rect><g mask="url(#RiskLog_mask)"><g mix-blend-mode="screen" opacity=".8"><rect id="RiskLog_outer-color" width="262.32" height="55.61" rx="10.78" ry="10.78"${attr("fill", outer_color)} stroke-width="0"></rect></g></g></g><foreignObject x="28" y="3" width="150" height="24"><div class="text-left font-['Lato'] text-white"><p class="truncate">${escape_html(risk)}</p></div></foreignObject><foreignObject x="28" y="24" width="150" height="24"><div class="text-left font-['Lato'] text-white"><p class="truncate">${escape_html(mitigate)}</p></div></foreignObject><foreignObject x="178" y="29" width="78" height="24"><div><!--[-->`;
  ImpactSVG($$payload, { text: impact });
  $$payload.out += `<!--]--></div></foreignObject><foreignObject x="176" y="9" width="78" height="30"><div class="size-full"><!--[-->`;
  Category($$payload, { category });
  $$payload.out += `<!--]--></div></foreignObject><path d="M17.3,41.71c1.54,0,2.91-.42,4.12-1.25.24-.16.26-.34.04-.53-.7-.64-1.41-1.28-2.11-1.92-.16-.15-.3-.16-.51-.07-1.01.49-2.02.48-3.02,0-.21-.1-.35-.08-.52.07-.71.64-1.42,1.29-2.13,1.93-.21.19-.2.37.04.53,1.21.82,2.58,1.23,4.08,1.24ZM24.14,35.53c-.01-1.37-.46-2.61-1.36-3.72-.19-.24-.38-.25-.61-.04-.69.63-1.39,1.26-2.08,1.88-.19.17-.2.28-.08.49.54.91.54,1.82,0,2.73-.12.21-.11.33.08.49.7.63,1.39,1.27,2.09,1.9.22.2.41.19.6-.04.9-1.1,1.35-2.33,1.37-3.7ZM17.27,29.33c-1.33,0-2.6.35-3.75,1.05-.39.23-.44.63-.11.93.57.52,1.14,1.04,1.71,1.56.14.13.32.21.51.2.16,0,.32-.04.46-.1.4-.15.81-.24,1.24-.24.44,0,.85.09,1.25.25.41.16.69.1,1-.18.54-.49,1.07-.97,1.61-1.46.37-.34.33-.72-.11-.98-1.14-.69-2.4-1.03-3.83-1.03Z" fill="#f3edf7" stroke-width="0"></path><path d="M10.49,35.11c.05-.3.09-.6.16-.9.17-.78.52-1.49,1.01-2.14.27-.36.69-.4,1.03-.1.46.41.92.83,1.38,1.25.09.08.18.16.27.25.32.29.38.54.2.92-.17.36-.26.72-.27,1.11,0,.38.08.75.24,1.1.21.45.16.67-.22,1.02-.53.48-1.07.96-1.6,1.44-.16.15-.36.23-.59.2-.19-.02-.33-.12-.44-.26-.66-.89-1.05-1.87-1.15-2.94,0-.04-.02-.08-.03-.13,0-.27,0-.54,0-.81Z" fill="#f3edf7" stroke-width="0"></path><path d="M17.3,41.71c-1.5-.01-2.86-.42-4.08-1.24-.24-.16-.26-.34-.04-.53.71-.64,1.42-1.29,2.13-1.93.17-.15.31-.17.52-.07,1.01.49,2.01.5,3.02,0,.2-.1.35-.08.51.07.71.64,1.41,1.28,2.11,1.92.21.19.2.37-.04.53-1.22.83-2.59,1.24-4.12,1.25Z" fill="#f3edf7" stroke-width="0"></path><path d="M24.14,35.53c-.02,1.37-.47,2.6-1.37,3.7-.19.23-.38.24-.6.04-.7-.63-1.39-1.26-2.09-1.9-.18-.17-.2-.28-.08-.49.53-.91.53-1.82,0-2.73-.12-.21-.1-.32.08-.49.69-.63,1.39-1.26,2.08-1.88.23-.21.41-.19.61.04.91,1.1,1.35,2.34,1.36,3.72Z" fill="#f3edf7" stroke-width="0"></path><path d="M17.27,29.33c1.43,0,2.68.35,3.83,1.03.44.26.48.64.11.98-.53.49-1.07.97-1.61,1.46-.31.28-.6.34-1,.18-.4-.16-.82-.25-1.25-.25-.43,0-.84.09-1.24.24-.14.05-.31.09-.46.1-.2.01-.37-.07-.51-.2-.57-.52-1.15-1.04-1.71-1.56-.33-.3-.28-.69.11-.93,1.15-.7,2.42-1.05,3.75-1.05Z" fill="#f3edf7" stroke-width="0"></path><path d="M17.32,10.35c-3.77,0-6.82,2.77-6.82,6.19s3.05,6.19,6.82,6.19,6.82-2.77,6.82-6.19-3.05-6.19-6.82-6.19ZM17.3,19.97c-.46,0-.83-.35-.83-.77,0-.42.39-.76.86-.76.46,0,.83.35.83.77,0,.42-.39.76-.86.76ZM18.28,14.08c-.07.72-.13,1.43-.2,2.15-.03.3-.05.59-.08.89-.04.33-.34.57-.7.56-.35,0-.64-.26-.67-.58-.09-1.02-.19-2.04-.28-3.05-.05-.51.4-.95.97-.95.58,0,1.02.46.96.98Z" fill="#f3edf7" stroke-width="0"></path></g></g></g></svg>`;
}
function RiskLog($$payload, $$props) {
  let { risk, mitigate, category, impact, color } = $$props;
  $$payload.out += `<div class="size-full content-center"><!--[-->`;
  RiskLogSVG($$payload, { risk, mitigate, category, impact, color });
  $$payload.out += `<!--]--></div>`;
}
function RiskLogsSVG($$payload, $$props) {
  push();
  let { children } = $$props;
  $$payload.out += `<svg id="RiskLogs" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300.39 421.15" style="width: inherit; height: inherit;"><defs><linearGradient id="RiskLogs_bg" x1="866.67" y1="16.88" x2="999.75" y2="16.88" gradientTransform="translate(1079.69) rotate(-180) scale(1 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#43466e"></stop><stop offset="1" stop-color="#585e81"></stop></linearGradient><linearGradient id="RiskLogs_bg-2" x1="160.21" y1="457.25" x2="139.56" y2="-22.89" gradientTransform="matrix(1,0,0,1,0,0)" xlink:href="#RiskLogs_bg"></linearGradient></defs><polygon points="213.03 30.76 197.76 3 148.84 3 144.13 3 95.68 3 79.95 30.76 213.03 30.76" fill="url(#RiskLogs_bg)" fill-opacity=".6" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="6"></polygon><text transform="translate(105.02 22.78) scale(1.19 1)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="17.44" letter-spacing=".02em"><tspan x="0" y="0">Risk Log</tspan></text><rect x="3" y="30.76" width="294.39" height="387.39" rx="19.65" ry="19.65" fill="url(#RiskLogs_bg-2)" fill-opacity=".6" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="6"></rect><foreignObject x="10" y="50" width="280" height="350"><!--[-->`;
  children($$payload);
  $$payload.out += `<!--]--></foreignObject><path d="M289.5,44.69c0,.48-.46.86-1.02.86h-2.19c-.27,0-.53-.09-.72-.25l-1.59-1.34-1.59,1.34c-.19.16-.45.25-.72.25h-2.19c-.56,0-1.02-.39-1.02-.86,0-.23.11-.44.3-.6l3.9-3.29c.73-.61,1.91-.61,2.64,0l3.9,3.29c.19.16.3.38.3.6h0Z" fill="#6e78b3" stroke-width="0"></path><path d="M282.27,44.84l1.82-1.54,1.82,1.54c.13.11.3.17.49.17h2.2c.61,0,.92-.63.49-.99l-3.91-3.29c-.6-.51-1.58-.51-2.18,0l-3.91,3.29c-.43.37-.13.99.49.99h2.2c.18,0,.36-.06.49-.17Z" fill="#6e78b3" stroke-width="0"></path><path d="M278.23,404.53c0-.48.46-.86,1.02-.86h2.19c.27,0,.53.09.72.25l1.59,1.34,1.59-1.34c.19-.16.45-.25.72-.25h2.19c.56,0,1.02.39,1.02.86,0,.23-.11.44-.3.6l-3.9,3.29c-.73.61-1.91.61-2.64,0l-3.9-3.29c-.19-.16-.3-.38-.3-.6h0Z" fill="#6e78b3" stroke-width="0"></path><path d="M285.69,404.39l-1.82,1.54-1.82-1.54c-.13-.11-.3-.17-.49-.17h-2.2c-.61,0-.92.63-.49.99l3.91,3.29c.6.51,1.58.51,2.18,0l3.91-3.29c.43-.37.13-.99-.49-.99h-2.2c-.18,0-.36.06-.49.17Z" fill="#6e78b3" stroke-width="0"></path></svg>`;
  pop();
}
function RiskLogs_1($$payload, $$props) {
  push();
  let logs = [];
  $$payload.out += `<div class="size-full content-center text-center"><!--[-->`;
  RiskLogsSVG($$payload, {
    children: ($$payload2, $$slotProps) => {
      $$payload2.out += `<!--[-->`;
      SimpleBar_1($$payload2, {
        children: ($$payload3, $$slotProps2) => {
          const each_array = ensure_array_like(logs);
          $$payload3.out += `<div class="flex flex-col gap-4"><!--[-->`;
          for (let $$index = 0; $$index < each_array.length; $$index++) {
            const log = each_array[$$index];
            $$payload3.out += "<!--[-->";
            $$payload3.out += `<!--[-->`;
            RiskLog($$payload3, {
              risk: log.title,
              mitigate: log.respond,
              category: log.category,
              impact: "Low",
              color: "Plain"
            });
            $$payload3.out += `<!--]-->`;
            $$payload3.out += "<!--]-->";
          }
          $$payload3.out += "<!--]-->";
          $$payload3.out += `</div>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!--]--></div>`;
  pop();
}
function TimelineSVG($$payload) {
  $$payload.out += `<svg id="Timeline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 359.53 58.4" style="height: inherit; width: inherit;"><defs><linearGradient id="Timeline_linear-gradient" x1="-563.96" y1="13.17" x2="-496.06" y2="13.17" gradientTransform="translate(-350.57) rotate(-180) scale(1 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#43466e"></stop><stop offset="1" stop-color="#585e81"></stop></linearGradient><linearGradient id="Timeline_linear-gradient-2" x1="3.23" y1="32.51" x2="358.64" y2="32.51" gradientTransform="matrix(1,0,0,1,0,0)" xlink:href="#Timeline_linear-gradient"></linearGradient><clipPath id="Timeline_clippath"><path d="M346.14,25.01c-3.27,0-6.04,2.09-7.07,5.01h-20.36c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-19.78c-1.03-2.92-3.8-5.01-7.07-5.01s-6.04,2.09-7.07,5.01h-21.8c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-20.15c-1.03-2.92-3.8-5.01-7.07-5.01s-6.04,2.09-7.07,5.01h-21.52c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-20.03c-1.03-2.92-3.8-5.01-7.07-5.01-4.14,0-7.5,3.36-7.5,7.5s3.36,7.5,7.5,7.5c3.27,0,6.04-2.09,7.07-5.01h20.03c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h21.52c1.03,2.92,3.8,5.01,7.07,5.01s6.04-2.09,7.07-5.01h20.15c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h21.8c1.03,2.92,3.8,5.01,7.07,5.01s6.04-2.09,7.07-5.01h19.78c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h20.36c1.03,2.92,3.8,5.01,7.07,5.01,4.14,0,7.5-3.36,7.5-7.5s-3.36-7.5-7.5-7.5Z" fill="none" stroke-width="0"></path></clipPath></defs><polygon points="213.38 25.44 205.06 .89 180.64 .89 178.23 .89 153.81 .89 145.49 25.44 213.38 25.44" fill="url(#Timeline_linear-gradient)" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="1.78"></polygon><text transform="translate(164.77 9.96)" fill="#edfdeb" font-family="ChangaOne, 'Changa One'" font-size="8.99"><tspan x="0" y="0" letter-spacing=".02em">P</tspan> <tspan x="5.49" y="0">roject</tspan> <tspan x="-3.25" y="7.19">Timeline</tspan></text><path d="M346.14,20.01c-4.86,0-9.07,2.79-11.14,6.84h-13.31c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-12.74c-2.07-4.06-6.27-6.84-11.14-6.84s-9.07,2.79-11.14,6.84h-14.76c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-13.1c-2.07-4.06-6.27-6.84-11.14-6.84s-9.07,2.79-11.14,6.84h-14.47c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-12.98c-2.07-4.06-6.27-6.84-11.14-6.84-6.9,0-12.5,5.6-12.5,12.5s5.6,12.5,12.5,12.5c4.86,0,9.07-2.78,11.14-6.84h12.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h14.47c2.07,4.06,6.27,6.84,11.14,6.84s9.07-2.78,11.14-6.84h13.1c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h14.76c2.07,4.06,6.27,6.84,11.14,6.84s9.07-2.78,11.14-6.84h12.74c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h13.31c2.07,4.06,6.27,6.84,11.14,6.84,6.9,0,12.5-5.6,12.5-12.5s-5.6-12.5-12.5-12.5Z" fill="#fff" stroke-width="0"></path><path d="M346.14,20.01c-4.86,0-9.07,2.79-11.14,6.84h-13.31c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-12.74c-2.07-4.06-6.27-6.84-11.14-6.84s-9.07,2.79-11.14,6.84h-14.76c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-13.1c-2.07-4.06-6.27-6.84-11.14-6.84s-9.07,2.79-11.14,6.84h-14.47c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-16.98c-1.52-1.63-3.68-2.66-6.08-2.66s-4.56,1.03-6.08,2.66h-12.98c-2.07-4.06-6.27-6.84-11.14-6.84-6.9,0-12.5,5.6-12.5,12.5s5.6,12.5,12.5,12.5c4.86,0,9.07-2.78,11.14-6.84h12.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h14.47c2.07,4.06,6.27,6.84,11.14,6.84s9.07-2.78,11.14-6.84h13.1c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h14.76c2.07,4.06,6.27,6.84,11.14,6.84s9.07-2.78,11.14-6.84h12.74c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h16.98c1.52,1.63,3.68,2.66,6.08,2.66s4.56-1.03,6.08-2.66h13.31c2.07,4.06,6.27,6.84,11.14,6.84,6.9,0,12.5-5.6,12.5-12.5s-5.6-12.5-12.5-12.5Z" fill="url(#Timeline_linear-gradient-2)" stroke="#6e78b3" stroke-miterlimit="10" stroke-width="1.78"></path><path d="M346.14,25.01c-3.27,0-6.04,2.09-7.07,5.01h-20.36c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-19.78c-1.03-2.92-3.8-5.01-7.07-5.01s-6.04,2.09-7.07,5.01h-21.8c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-20.15c-1.03-2.92-3.8-5.01-7.07-5.01s-6.04,2.09-7.07,5.01h-21.52c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-22.93c-.73-.91-1.85-1.51-3.11-1.51s-2.37.6-3.11,1.51h-20.03c-1.03-2.92-3.8-5.01-7.07-5.01-4.14,0-7.5,3.36-7.5,7.5s3.36,7.5,7.5,7.5c3.27,0,6.04-2.09,7.07-5.01h20.03c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h21.52c1.03,2.92,3.8,5.01,7.07,5.01s6.04-2.09,7.07-5.01h20.15c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h21.8c1.03,2.92,3.8,5.01,7.07,5.01s6.04-2.09,7.07-5.01h19.78c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h22.93c.73.91,1.85,1.51,3.11,1.51s2.37-.6,3.11-1.51h20.36c1.03,2.92,3.8,5.01,7.07,5.01,4.14,0,7.5-3.36,7.5-7.5s-3.36-7.5-7.5-7.5Z" fill="#282844" stroke-width="0"></path><text transform="translate(-6 57.03)" fill="#f3edf7" font-family="ChangaOne, 'Changa One'" font-size="10"><tspan x="0" y="0">Initiation</tspan></text><text transform="translate(143.71 57.14)" fill="#f3edf7" font-family="ChangaOne, 'Changa One'" font-size="10"><tspan x="0" y="0">Planning</tspan></text><text transform="translate(235.42 57.03)" fill="#f3edf7" font-family="ChangaOne, 'Changa One'" font-size="10"><tspan x="0" y="0">Execution</tspan></text><text transform="translate(329.33 57.03)" fill="#f3edf7" font-family="ChangaOne, 'Changa One'" font-size="10"><tspan x="0" y="0">Closing</tspan></text><g id="Loading"><g clip-path="url(#Timeline_clippath)"><path id="Timeline_progress-bar-track" d="M8.23,32.51h349.33s-349.33,0-349.33,0Z" fill="#fff" opacity="0" stroke-width="0"></path><rect id="Timeline_progress-bar" x="3.23" y="23.63" width="350.41" height="17.76" fill="#d076ff" stroke-width="0"></rect></g></g></svg>`;
}
function Timeline($$payload) {
  $$payload.out += `<div class="size-full"><!--[-->`;
  TimelineSVG($$payload);
  $$payload.out += `<!--]--></div>`;
}
function _page($$payload) {
  $$payload.out += `<div class="wrapper svelte-igwbhg"><div class="flex"><div class="w-[20vw]"><div class="relative h-[50vh]"><!--[-->`;
  Objective_1($$payload);
  $$payload.out += `<!--]--></div> <div class="h-[4vh]"></div> <div class="relative h-[46vh]"><!--[-->`;
  RiskLogs_1($$payload);
  $$payload.out += `<!--]--></div></div> <div class="w-[6vw]"><div class="h-[100vh]"></div></div> <div class="w-[48vw]"><div class="relative h-[10vh]"><!--[-->`;
  Timeline($$payload);
  $$payload.out += `<!--]--></div> <div class="h-[1vh]"></div> <div class="relative h-[44vh]"><!--[-->`;
  CardHand($$payload);
  $$payload.out += `<!--]--></div> <div class="h-[4vh]"></div> <div class="relative h-[39vh]"><!--[-->`;
  MitigationCards($$payload);
  $$payload.out += `<!--]--></div></div> <div class="w-[1vw]"><div class="h-[100vh]"></div></div> <div class="w-[25vw]"><div class="relative h-[10vh]"><!--[-->`;
  MenuRestart($$payload);
  $$payload.out += `<!--]--></div> <div class="h-[6vh]"></div> <div class="relative h-[24vh]"><!--[-->`;
  Notification($$payload);
  $$payload.out += `<!--]--></div> <div class="h-[42vh]"></div> <div class="h-[2vh]"></div> <div class="relative flex h-[7vh]"><div class="w-[8vw]"></div> <!--[-->`;
  EndTurn_1($$payload);
  $$payload.out += `<!--]--> <div class="w-[8vw]"></div></div> <div class="h-[6vh]"></div></div></div></div>`;
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DfWKPm4y.js.map
