//command types 
const COMMENT = 1
const INSTRUCTION = 2
const VALUE = 3
const LABEL = 4
const CONST = 5
const FUNCTION = 6

// address modes
const IMMEDIATE = 7
const ABSOLUTE = 8
const ABSOLUTE_X = 9
const ABSOLUTE_Y = 10
const ZERO_PAGE = 11
const ZERO_PAGE_X = 12
const INDIRECT_X = 13
const INDIRECT_Y = 14
const IND_ZERO_PAGE = 15

const valueToArray = (val) => {
	const byteSize = val > 255 ? 2 : 1
	const buffer = new ArrayBuffer(byteSize)
	const ui8 = new Uint8Array(buffer)

	if (val > 255)
		new Uint16Array(buffer)[0] = val
	else
		ui8[0] = val

	return ui8
}

const strBinaryToValue = str => parseInt(str.substring(2), 2)
const strHexToValue = str => parseInt(str.substring(2), 16)
const strNumberToValue = str => parseInt(str.substring(1), 10)

const mapSplitToPeaces = (line, lineNumber) =>
	line.reduce(
		({ obj = [], str = "", column = 1, ignore = false, skip = false, quotEnd = '' }, char, index, array) => {
			const nextChar = array[index + 1]
			const chars = [' ', '\t', '"', '=', '\n', ';']
			const returnObj = { instruction: str + char, line: lineNumber + 1, column }

			if (char === '\\' || char === ',')
				return { obj, str: str + char, column, quotEnd, ignore, skip: true }

			if (skip)
				return { obj, str: str + char, column, quotEnd, ignore }

			if (quotEnd === char)
				return { obj: [...obj, returnObj], column: index + 2 }

			if (char === '"')
				return { obj, str: str + char, column, quotEnd: '"', ignore: true }

			if (char === ';')
				return { obj, str: str + char, column, quotEnd: '\n', ignore: true }

			if (ignore)
				return { obj, str: str + char, column, quotEnd, ignore }

			if (chars.includes(char))
				return { obj: [...obj, returnObj], column: char == '\t' ? index + 3 : index + 2 }

			if (chars.includes(nextChar))
				return { obj: [...obj, returnObj], column: char == '\t' ? index + 3 : index + 2 }

			return { obj, str: str + char, column }

		}, 0).obj

const parse = (codeString) => {
	const splitToLine = codeString.toLowerCase().split('\n').map(line => line + '\n')
	const splitToPeaces = splitToLine
		.map(element => Array.from(element))
		.map(mapSplitToPeaces)

	console.log(splitToPeaces)
}

const compilerInstructions = {
	"org": {
		"absolute": null,
	}
}

const instructionsFile = Deno.readTextFileSync("65c02.json")
const instructions = { ...JSON.parse(instructionsFile), ...compilerInstructions }

const sourceFile = Deno.readTextFileSync("test.asm")

parse(sourceFile)

