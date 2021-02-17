import { recursion } from "./tools.js"


const foo = `
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

const parseAsm = asmSource => (command = [], cursorPosition = 0, startPoint = 0, type = 0) => {
	const nextCursorPosition = cursorPosition + 1
	switch (asmSource[cursorPosition]) {
		case "\n":
			return [
				[...command, { type: type, start: startPoint, end: cursorPosition }], nextCursorPosition]
		case " ":
			if (type === COMMENT)
				return [command, nextCursorPosition, startPoint, type]
			else
				return [[...command, { type: type, start: startPoint, end: cursorPosition }], nextCursorPosition]
		case ";":
			if (type === 0)
				return [command, nextCursorPosition, cursorPosition, COMMENT]
			else if (type === COMMENT)
				return [command, nextCursorPosition, startPoint, type]
			else
				return [
					[...command, { type: type, start: startPoint, end: cursorPosition }],
					nextCursorPosition,
					cursorPosition,
					COMMENT
				]
		case "$":
		case "#":
		case "%":
			if (type === 0)
				return [command, nextCursorPosition, cursorPosition, VALUE]
			break
		case ":":
			if (type === INSTRUCTION)
				return [
					[...command, { type: LABEL, start: startPoint, end: nextCursorPosition }],
					nextCursorPosition,
					nextCursorPosition
				]
			break
		default:
			if (type === 0)
				return [command, nextCursorPosition, cursorPosition, INSTRUCTION]
	}

	if (asmSource.length <= cursorPosition)
		throw command

	return [command, nextCursorPosition, startPoint, type]

}

const codeToLowerCase = foo.toLowerCase()
const ob = recursion(parseAsm(codeToLowerCase))()
ob.forEach(el => {
	console.log(foo.substring(el.start, el.end), el)
})

