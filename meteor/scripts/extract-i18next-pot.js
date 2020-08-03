/**
 * The following code is based on i18next-extract-gettext, taken under license
 * from an abandoned repository:
 * https://github.com/queicherius/i18next-extract-gettext/
 *
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 David Reeß
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs')
const args = require('yargs')
	.option('files', {
		description: 'files to process, specified as a glob pattern',
		alias: 'f',
		type: 'string',
		required: true,
	})
	.option('output', {
		description: 'the output template file name',
		alias: 'o',
		type: 'string',
		required: true,
	})
	.option('key-separator', {
		description: 'key separator to use within the POT file',
		type: 'string',
	})
	.option('ns-separator', {
		description: 'name space separator to use within the POT file',
		type: 'string',
	})
	.option('plural-separator', {
		description: 'plural separator to use within the POT file',
		type: 'string',
	})
	.option('context-separator', {
		description: 'context separator to use within the POT file',
		type: 'string',
	})
	.help()
	.alias('help', 'h').argv

const Parser = require('i18next-scanner').Parser
const converter = require('i18next-conv')
const glob = require('glob')

var parserOptions = {
	// Include react helpers into parsing
	attr: {
		list: ['data-i18n', 'i18nKey'],
	},
	func: {
		list: ['i18next.t', 'i18n.t', 't'],
	},
	// Make sure common separators don't break the string
	keySeparator: args.keySeparator || '°°°°°°.°°°°°°',
	nsSeparator: args.nsSeparator || '°°°°°°:°°°°°°',
	pluralSeparator: args.pluralSeparator || '°°°°°°_°°°°°°',
	contextSeparator: args.contextSeparator || '°°°°°°_°°°°°°',
	// Interpolate correctly
	interpolation: {
		prefix: '{{',
		suffix: '}}',
	},
}

var parser = new Parser(parserOptions)

var fileGlob = args.files
var outputFile = args.output

// console.debug('Reading in files for glob: ' + fileGlob)
glob(fileGlob, function(err, files) {
	if (err) {
		console.log(err)
		process.exit(1)
	}

	// console.debug('Loading content of ' + files.length + ' files')
	var content = ''
	files.map(function(file) {
		content += fs.readFileSync(file, 'utf-8')
	})

	// console.debug('Parsing translation keys out of content')
	parser.parseFuncFromString(content, parserOptions)
	parser.parseAttrFromString(content, parserOptions)
	var json = parser.get().en.translation

	// console.debug('Converting ' + Object.keys(json).length + ' translation keys into gettext')
	converter.i18nextToPot('en', JSON.stringify(json), { quiet: true }).then(function(data) {
		// console.debug('Writing into output file')
		fs.writeFileSync(outputFile, data, 'utf-8')
		console.log(`\nSuccessfully written ${Object.keys(json).length} strings to template "${outputFile}".`)
	})
})
