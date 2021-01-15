const fs = require('fs'), { argv } = require('process');

/**
 * Reconstructs the given string based on the configuration.
 * @param {Object[]} config 
 * @param {String} str 
 * @returns {String}
 */
function reconstruct(config, str) {
	config.forEach((obj) => {
		const model = new Model(obj);
		while (str.match(model.regex)) {
			const temp = model.compile(str);
			str = str.replace(temp.regexResult[0], temp.formatted);
		}
	});
	return str;
}

class Model {
	/**
	 * @param {Object} obj 
	 * @param {String} obj.regex 
	 * @param {Model[]} obj.subRegexes 
	 * @param {String=} obj.separator 
	 * @param {String} obj.rawFormat 
	 * @param {String=} obj.defaultValue 
	 */
	constructor(obj) {
		this.regex = obj.regex;
		this.subRegexes = obj.subRegexes;
		this.separator = obj.separator;
		this.rawFormat = obj.rawFormat;
		this.defaultValue = obj.defaultValue;
	}

	/**
	 * Recursive compilation.
	 * @param {Model} obj 
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
			subCompilations.push(new Model(subRegex).compile(regexResult[1]).formatted));
		return { formatted: this.construct(regexResult, subCompilations), regexResult };
	}

	/**
	 * Applies the compiled model to the raw format.
	 * @param {RegExpExecArray} regexResult 
	 * @param {String[]} subCompilations 
	 * @returns {String}
	 */
	construct(regexResult, subCompilations) {
		let result = this.rawFormat;
		if (subCompilations) {
			result = result.replace('%a', subCompilations.join(this.separator));
			subCompilations.forEach((subCompilation, i) =>
				result = result.replace('@'+(i+1), subCompilation));
		}
		for (let i = 1; i < regexResult.length; i++)
			result = result.replace('%'+i, regexResult[i]);
		return result;
	}
}

if (argv[2] === undefined) return console.log('Usage: reconstructor <sourcefile> [configfile]');
let config, srcfile;
try {
	config = JSON.parse(fs.readFileSync(argv[3]?argv[3]:'config.json').toString());
	srcfile = fs.readFileSync(argv[2]).toString();
	const result = reconstruct(config, srcfile);
	console.log(result);
} catch (err) {
	console.error('Error:', err.message);
}
