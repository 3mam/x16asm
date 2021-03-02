
const foo = `
foo: .db 43,23,54
CONST = #12
include "foo" ;comment=
org $0800;comment1
label:
lda #16
sta #%11 ;comme nt2
lda label
;comment3
sta $02 ;comme nt2
lda #<label
lda #$0800
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


const mapEditLastCommandForConst = (v, i, a) => i === a.length - 1 ? { type: CONST, start: v.start, end: v.end } : v

const reduceParseAsm = ({ commands = [], type = 0, startPoint = 0 }, char, cursorPosition) => {
	switch (type) {
		case COMMENT:
			if (char === "\n")
				return { commands: [...commands, { type, start: startPoint, end: cursorPosition }] }
			else
				return { commands, type, startPoint }
		case VALUE:
		case INSTRUCTION:
		case FUNCTION:
			if (char === "\n" || char === " " || char === ";")
				return { commands: [...commands, { type, start: startPoint, end: cursorPosition }] }
			else if (char === ":")
				return { commands: [...commands, { type: LABEL, start: startPoint, end: cursorPosition + 1 }] }
			else
				return { commands, type, startPoint }
	}

	switch (char) {
		case "\n":
		case " ":
		case "\t":
			return { commands, type, startPoint }
		case ";":
			return { commands, type: COMMENT, startPoint: cursorPosition }
		case "=":
			return { commands: commands.map(mapEditLastCommandForConst) }
		case "$":
		case "#":
		case "%":
		case "\"":
			return { commands, type: VALUE, startPoint: cursorPosition }
		case ".":
			return { commands, type: FUNCTION, startPoint: cursorPosition }
		default:
			return { commands, type: INSTRUCTION, startPoint: cursorPosition }
	}
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

const recognizeInstructionFromStr = (str, instructionList) => {
	const instruction = instructionList[str]
	const flags = ZERO_PAGE | ZERO_PAGE_X
	console.log("ZZ", (ZERO_PAGE & flags) === ZERO_PAGE)
	console.log(instruction)
	console.log(instruction)

}

const compilerInstructions = {
	"org": {
		"absolute": null,
	}
}

const instructionsFile = Deno.readTextFileSync("65c02.json")
const instructions = JSON.parse(instructionsFile)

const codeToLowerCase = foo.toLowerCase()
const test = Array.from(codeToLowerCase).reduce(reduceParseAsm, 0)
test.commands.forEach(el => {
	if (el.type === VALUE) {
		console.log(foo.substring(el.start, el.end), el)
		const r = recognizeValueFromStr(foo.substring(el.start, el.end))
		console.log(r)
	} else if (el.type === INSTRUCTION) {
		console.log(foo.substring(el.start, el.end), el)
		const i = recognizeInstructionFromStr(foo.substring(el.start, el.end), instructions)

	}
})
