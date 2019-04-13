import { strings, tensStrings, thousandsStrings } from './dictionary';

/**
 * Split user's input into n-digits groups
 * @param {String|Number} number User's input
 * @param {Number} digits The number of digits for each group
 * @returns {Array} An array of objects containing unit and value
 */
export function splitString(number, digits = 3) {
  const groups = [];

  const string = number.toString();
  let index = string.length;

  let iteration = 0;
  while (index > 0) {
    const firstIndex = index - digits >= 0 ? index - digits : 0;
    groups.unshift({
      value: parseInt(string.substring(firstIndex, index)),
      unit: thousandsStrings[iteration],
    });
    index -= digits;
    iteration++;
  }

  return groups;
}

/**
 * Converts a number (<1000) into words
 * @param {String} number The user's input
 * @returns {String} The correct english spelling for the number
 */
export function getPeriodString(number, unit) {
  if (number === 0) {
    return '';
  }

  const hundreds = parseInt(number / 100);
  const rest = parseInt(number % 100);

  let result = '';
  result += hundreds > 0 ? `${strings[hundreds]} hundred` : '';
  result += hundreds > 0 && rest > 0 ? ' and ' : '';

  if (rest >= 20) {
    const tens = parseInt(rest / 10);
    const units = parseInt(rest % 10);
    result += tens > 0 ? `${tensStrings[tens]}` : '';
    result += tens > 0 && units > 0 ? '-' : '';
    result += units > 0 ? `${strings[units]}` : '';
  } else if (rest > 0) {
    result += strings[rest];
  }

  return unit ? `${result} ${unit}` : result;
}

/**
 * Return the spelling of the decimal part of the user's input
 * @param {String|Number} number The decimal part of user's input
 * @returns {String} The correct english spelling for the number
 */
export function getDecimalString(number) {
  let result = '';

  number.split('').forEach(digit => {
    result += result !== '' ? ' ' : '';
    result += strings[digit];
  });

  return result;
}

/**
 * Generate a string representing spelled number (up to 2 quadrillion)
 * @param {String|Number} number User's input
 * @returns {String|Error} 
 */
export function numberToEnglish(number) {
  // Check if its a valid number
  if (isNaN(number)) {
    throw new Error();
  }

  // Check infinity values
  const abs = Math.abs(number);
  if (abs > 2e15) {
    return 'infinity';
  }

  const splitted = abs.toString().split('.');

  // Check zero/null values
  if (!number || (parseInt(abs) === 0 && !splitted[1])) {
    return strings[0];
  }

  // Start WHOLE part elaboration
  const groups = splitString(splitted[0]);

  let result = number < 0 ? 'negative' : '';
  groups.forEach(group => {
    // Add ' and ' only if the most right digits value is > 0 and < 100 and 
    result += result !== '' && result !== 'negative' && !group.unit && group.value > 0 && group.value < 100 ? ' and' : '';

    // Add space between periods only if it's necessary
    result += result !== '' && group.value > 0 ? ' ' : '';

    // Add period string
    result += getPeriodString(group.value, group.unit);
  });

  // Start DECIMAL part elaboration
  result += parseInt(splitted[0]) === 0 ? getDecimalString(splitted[0]) : '';
  result += parseInt(splitted[1]) > 0 ? ` point ${getDecimalString(splitted[1].substring(0, 5))}` : '';

  return result;
}
