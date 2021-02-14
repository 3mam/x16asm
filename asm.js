import { recursion } from "./tools.js"


const foo = `
org $0800;comment1
label:
lda #16
sta $01 ;comment2
lda label
;comment3
`

const COMMENT = 1
const INSTRUCTION = 2
const VALUE = 3

const parseAsm = asmSource => (command = [], cursorPosition = 0, startPoint = 0, type = 0) => {
	switch (asmSource[cursorPosition]) {
		case "\n":
			return [
				[...command, { type: type, start: startPoint, end: cursorPosition }],
				cursorPosition + 1,
				cursorPosition,
				0
			]
		case " ":
			if (type > COMMENT)
				return [
					[...command, { type: type, start: startPoint, end: cursorPosition }],
					cursorPosition + 1,
					cursorPosition + 1,
					0
				]
			break
		case ";":
			if (type !== 0)
				return [
					[...command, { type: type, start: startPoint, end: cursorPosition }],
					cursorPosition + 1,
					cursorPosition,
					COMMENT
				]
			else
				return [command, cursorPosition + 1, cursorPosition, COMMENT]
		case "$":
		case "#":
		case "%":
		case "0":
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			if (type === 0)
				return [command, cursorPosition + 1, cursorPosition, VALUE]
			break
		default:
			if (type === 0)
				return [command, cursorPosition + 1, cursorPosition, INSTRUCTION]
	}

	if (asmSource.length <= cursorPosition)
		throw command

	return [command, cursorPosition + 1, startPoint, type]

}

const codeToLowerCase = foo.toLowerCase()
const ob = recursion(parseAsm(codeToLowerCase))()
ob.forEach(el => {
	console.log(foo.substring(el.start, el.end), el)
})

