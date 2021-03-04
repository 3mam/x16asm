
const foo = `
foo: .db 43,23,54
			.db "asd asd"
CONST = #12
include "foo" ;comment=
org $0800;comment1
label:
lda #16
sta #%11 ;comme nt2
 lda   label
;comment3
	sta	$02 ;comme nt2
lda #<label
lda #$0800
;bla bla bla
`

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

const reduceParser = ({ data = [], line = 1, start = 0, column = 0, ignore = false, str = "", disable = false }, char) => {
	if (char === '\n')
		if (str === '')
			return { data, line: line + 1 }
		else
			return { data: [...data, { instruction: str, line, column: start }], line: line + 1 }
	else if (char === ';')
		return { data, line, start, column: column + 1, ignore: true, str }
	else if (ignore)
		return { data, line, start, column: column + 1, ignore, str }
	else if (char === ' ' && !disable)
		if (str === '')
			return { data, line, start, column: column + 2, disable }
		else
			return { data: [...data, { instruction: str, line, column: start }], line, column: column + 2 }
	else if (char === '\t')
		if (str === '')
			return { data, line, start, column: column + 3 }
		else
			return { data: [...data, { instruction: str, line, column: start }], line, column: column + 1 }
	else if (char === '\"' || char === ',')
		if (disable)
			return { data, line, start, column, str: str + char, disable }
		else
			return { data, line, start, column, str: str + char, disable: true }
	else
		if (start === 0)
			return { data, line, start: column, column: column + 1, str: str + char, disable }
		else
			return { data, line, start, column: column + 1, str: str + char, disable }
}

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

const recognizeValueFromStr = (str) => {
	const firstChar = str[0]
	if (firstChar === "#") {
		const secondChar = str[1]
		const addressMode = IMMEDIATE
		switch (secondChar) {
			case "%":
				return { addressMode, value: strBinaryToValue(str) }
			case "$":
				return { addressMode, value: strHexToValue(str) }
			case "<":
			case ">":
			case "^":
				return { addressMode, value: str.substring(1) }
			default:
				return { addressMode, value: strNumberToValue(str) }
		}
	} else if (firstChar === "$") {
		const value = strHexToValue(str)
		if (value <= 255)
			return { addressMode: ZERO_PAGE, value }
		else
			return { addressMode: ABSOLUTE, value }
	}
}



const filterGetLabels = (command) => command.type === LABEL

const compilerInstructions = {
	"org": {
		"absolute": null,
	}
}

const instructionsFile = Deno.readTextFileSync("65c02.json")
const instructions = { ...JSON.parse(instructionsFile), ...compilerInstructions }

const parseCode = Array.from(foo)
	.reduce(reduceParser, 0)


console.log(parseCode)
