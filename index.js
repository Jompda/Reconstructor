
const config = require('./config.json');
const fs = require('fs');
const src = fs.readFileSync('srcfile.json').toString();

class RegexObj {
	constructor(obj) {
		/**@type {String}*/
		this.regex = obj.regex;
		/**@type {RegexObj[]}*/
		this.subRegexes = obj.subRegexes;
		/**@type {String}*/
		this.separator = obj.separator;
		/**@type {String}*/
		this.rawFormat = obj.rawFormat;
		/**@type {String}*/
		this.defaultValue = obj.defaultValue;
	}

	/**
	 * Recursive compilation.
	 * @param {RegexObj} obj 
	 * @param {String} str 
	 * @returns {Object}
	 */
	compile(str) {
		const regexResult = new RegExp(this.regex).exec(str);
		//console.log(regexResult);
		if (!regexResult || regexResult.length < 2) 
			return { formatted: this.defaultValue, regexResult };
	
		/**@type {String[]}*/
		const subCompilations = [];
		if (this.subRegexes) this.subRegexes.forEach((subRegex) =>
			subCompilations.push(new RegexObj(subRegex).compile(regexResult[1]).formatted));
		return { formatted: this.format(regexResult, subCompilations), regexResult };
	}

	format(regexResult, subCompilations) {
		let result = this.rawFormat;
		if (subCompilations) {
			result = result.replace('%a', subCompilations.join(this.separator));
			subCompilations.forEach((subCompilation, i) =>
				result = result.replace('@'+(i+1), subCompilation));
		}
		for (let i = 1; i < regexResult.length; i++) {
			const group = regexResult[i];
			result = result.replace('%'+i, group)
		}
		return result;
	}
}


let result = src;
//console.log(src);
config.forEach((obj) => {
	const regexObj = new RegexObj(obj);
	while (result.match(regexObj.regex)) {
		const temp = regexObj.compile(result);
		result = result.replace(temp.regexResult[0], temp.formatted);
	}
});
console.log(result);
//console.log(JSON.parse(result));
