import { recursion } from "./tools.js"


const foo = `
foo: .db 43,23,54
CONST = #12
include "foo" ;comment=
org $0800;comment1
label:
lda #16
sta $01 ;comme nt2
lda label
;comment3
sta $02 ;comme nt2
lda #<label
`

const COMMENT = 1
const INSTRUCTION = 2
const VALUE = 3
const LABEL = 4
const CONST = 5
const FUNCTION = 6

const mapEditLastCommandForConst = (v, i, a) => i === a.length - 1 ? { type: CONST, start: v.start, end: v.end } : v

const reduceParseAsm = ({ commands = [], startPoint = 0, type = 0 }, char, cursorPosition, array) => {
	const nextCursorPosition = cursorPosition + 1

	switch (type) {
		case COMMENT:
			if (char === "\n")
				return { commands: [...commands, { type, start: startPoint, end: cursorPosition }], nextCursorPosition }
			else
				return { commands, nextCursorPosition, startPoint, type }
		case VALUE:
		case INSTRUCTION:
		case FUNCTION:
			if (char === "\n" || char === " " || char === ";")
				return { commands: [...commands, { type, start: startPoint, end: cursorPosition }], nextCursorPosition }
			else if (char === ":")
				return { commands: [...commands, { type: LABEL, start: startPoint, end: cursorPosition }], nextCursorPosition }
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

const codeToLowerCase = foo.toLowerCase()
const test = Array.from(codeToLowerCase).reduce(reduceParseAsm, 0)
test.commands.forEach(el => {
	console.log(foo.substring(el.start, el.end), el)
})
