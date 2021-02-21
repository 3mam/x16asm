import { recursion } from "./tools.js"


const foo = `
CONST =#12
include "foo" ;comment=
org $0800;comment1
label:
lda #16
sta $01 ;comme nt2
lda label
;comment3
`

const COMMENT = 1
const INSTRUCTION = 2
const VALUE = 3
const LABEL = 4
const CONST = 5

const mapEditLastCommand = (v, i, a) => i === a.length - 1 ? { type: CONST, start: v.start, end: v.end } : v

const parseAsm = asmSource => (command = [], cursorPosition = 0, startPoint = 0, type = 0) => {
	if (asmSource.length <= cursorPosition)
		throw command

	const nextCursorPosition = cursorPosition + 1
	const char = asmSource[cursorPosition]

	switch (type) {
		case COMMENT:
			if (char === "\n")
				return [[...command, { type: type, start: startPoint, end: cursorPosition }], nextCursorPosition]
			else
				return [command, nextCursorPosition, startPoint, type]
		case VALUE:
			if (char === "\n" || char === " " || char === ";")
				return [[...command, { type: type, start: startPoint, end: cursorPosition }], nextCursorPosition]
			else
				return [command, nextCursorPosition, startPoint, type]
		case INSTRUCTION:
			if (char === " ")
				return [[...command, { type: type, start: startPoint, end: cursorPosition }], nextCursorPosition]
			else if (char === ":")
				return [[...command, { type: LABEL, start: startPoint, end: cursorPosition }], nextCursorPosition]
			else
				return [command, nextCursorPosition, startPoint, type]
		case CONST:
			return [command.map(mapEditLastCommand), cursorPosition]
	}

	switch (char) {
		case "\n":
			return [command, nextCursorPosition]
		case ";":
			return [command, nextCursorPosition, cursorPosition, COMMENT]
		case "=":
			return [command, nextCursorPosition, cursorPosition, CONST]
		case "$":
		case "#":
		case "%":
		case "\"":
			return [command, nextCursorPosition, cursorPosition, VALUE]
		default:
			return [command, nextCursorPosition, cursorPosition, INSTRUCTION]
	}
}

const codeToLowerCase = foo.toLowerCase()
const ob = recursion(parseAsm(codeToLowerCase))()
ob.forEach(el => {
	console.log(foo.substring(el.start, el.end), el)
})

