
class RegexObj {
	constructor(obj) {
		/**@type {String}*/
		this.regex = obj.regex;
		/**@type {RegexObj[]}*/
		this.subRegexes = obj.subRegexes;
		/**@type {String}*/
		this.separator = obj.separator;
		/**@type {String}*/
		this.format = obj.format;
		/**@type {String}*/
		this.defaultValue = obj.defaultValue;
	}
}

const fs = require('fs');

const config = require('./config.json');
//console.log(config);

const src = fs.readFileSync('srcfile.json').toString();
let result = src;
//console.log(src);
config.forEach((obj) => {
	const regexObj = new RegexObj(obj);
	while (result.match(regexObj.regex)) {
		const temp = compile(regexObj, result);
		result = result.replace(temp.regexResult[0], temp.formatted);
	}
});
console.log(result);
//console.log(JSON.parse(result));

/**
 * Recursive function.
 * @param {RegexObj} obj 
 * @param {String} str 
 * @returns {Object}
 */
function compile(obj, str) {
	const regexResult = new RegExp(obj.regex).exec(str);
	//console.log(regexResult);
	if (!regexResult || regexResult.length < 2) 
		return obj.defaultValue ? { formatted: obj.defaultValue, regexResult } : undefined;

	/**@type {String[]}*/
	const subCompilations = [];
	if (obj.subRegexes) obj.subRegexes.forEach((subRegex) => {
		const temp = compile(new RegexObj(subRegex), regexResult[1]);
		if (temp) subCompilations.push(temp.formatted)
	});
	return { formatted: format(obj, regexResult, subCompilations), regexResult };
}

/**
 * @param {RegexObj} obj 
 * @param {RegExpExecArray} regexResult 
 * @param {String[]} subCompilations
 */
function format(obj, regexResult, subCompilations) {
	let result = obj.format;
	if (subCompilations) {
		result = result.replace('%a', subCompilations.join(obj.separator));
		subCompilations.forEach((subCompilation, i) => {
			result = result.replace('@'+(i+1), subCompilation)
		});
	}
	for (let i = 1; i < regexResult.length; i++) {
		const group = regexResult[i];
		result = result.replace('%'+i, group)
	}
	return result;
}
