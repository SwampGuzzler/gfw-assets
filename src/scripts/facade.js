'use strict';

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}




/**
 * jBone
 * How to extend: https://github.com/kupriyanenko/jbone#extend-it
 */
import jBone from 'jbone';
const $gfwDom = jBone.noConflict();

$gfwDom.fn.scrollTop = () => {
  // We do not want this script to be applied in browsers that do not support those
  // That means no smoothscroll on IE9 and below.
  if (document.querySelectorAll === void 0 || window.pageYOffset === void 0 || history.pushState === void 0) {
    return;
  }

  // Get the top position of an element in the document
  const getTop = element => {
    // return value of html.getBoundingClientRect().top ... IE : 0, other browsers : -pageYOffset
    if (element.nodeName === 'HTML') {
      return -window.pageYOffset;
    }
    return element.getBoundingClientRect().top + window.pageYOffset;
  };

  // ease functions thanks to:
  // http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
  const easings = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
  };

  // calculate the scroll position we should be in
  // given the start and end point of the scroll
  // the time elapsed from the beginning of the scroll
  // and the total duration of the scroll (default 500ms)
  const position = (start, end, elapsed, duration) => {
    if (elapsed > duration) { return end; }
    return start + (end - start) * easings.easeInOutQuint(elapsed / duration);
  };

  // we use requestAnimationFrame to be called by the browser before every repaint
  // if the first argument is an element then scroll to the top of this element
  // if the first argument is numeric then scroll to this location
  // if the callback exist, it is called when the scrolling is finished
  const smoothScroll = (el, duration, callback) => {
    duration = duration || 500;
    const start = window.pageYOffset
          end   = typeof el === 'number' ? parseInt(el) : getTop(el);

    const clock = Date.now();
    const requestAnimationFrame = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
      (fn => window.setTimeout(fn, 15));

    const step = () => {
      const elapsed = Date.now() - clock;
      window.scroll(0, position(start, end, elapsed, duration));
      if (elapsed > duration) {
        if (typeof callback === 'function') {
          callback(el);
        }
      } else {
        requestAnimationFrame(step);
      }
    };

    step();
  };

  smoothScroll.apply(this, arguments);

  // return smoothscroll API
  return this;
};

$gfwDom.json = (url, options) => {
  options.success({});
};

$gfwDom.jsonp = (url, options) => {
	options = options;
	const script = document.createElement('script');
	script.src = `${url}?callback=_jsonpGFWCallback&${options.data}`;
	document.head.appendChild(script);

	window['_jsonpGFWCallback'] = function(data) {
		if (!!data) {
			options.success(data);
		} else {
			options.error(data);
		}
	};

}

// GIST: https://gist.github.com/bullgare/5336154
// Function for get all the params of a form
$gfwDom.serialize = (form) => {
	if (!form || form.nodeName !== "FORM") {
		return;
	}
	let obj = {};
	for (let i = form.elements.length - 1; i >= 0; i = i - 1) {
		if (form.elements[i].name === "") {
			continue;
		}
		switch (form.elements[i].nodeName) {
		case 'INPUT':
			switch (form.elements[i].type) {
			case 'text':
			case 'email':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'submit':
				obj[form.elements[i].name] = form.elements[i].value;
				break;
			case 'checkbox':
			case 'radio':	
				obj[form.elements[i].name] = form.elements[i].value;
				break;
			case 'file':
				break;
			}
			break;
		case 'TEXTAREA':
			obj[form.elements[i].name] = form.elements[i].value;
			break;
		case 'SELECT':
			switch (form.elements[i].type) {
			case 'select-one':
				obj[form.elements[i].name] = form.elements[i].value;
				break;
			case 'select-multiple':
				for (let j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
					if (form.elements[i].options[j].selected) {
						obj[form.elements[i].name] = form.elements[i].options[j].value;
					}
				}
				break;
			}
			break;
		case 'BUTTON':
			switch (form.elements[i].type) {
			case 'reset':
			case 'submit':
			case 'button':
				obj[form.elements[i].name] = form.elements[i].value;
				break;
			}
			break;
		}
	}
	return obj;
}

module.exports = $gfwDom;
