import { tokensFromCode } from './tokenizer.js'

const UNKNOWN = 0
const COMMENT = 1
const SPACE = 2
const TAB = 3
const LABEL = 4
const FUNCTION = 5
const STRING = 6
const VALUE = 7
const EQUAL = 8
const NEWLINE = 9

const isComment = ({ instruction }) => instruction[0] === ';' && instruction[instruction.length - 1] === '\n'
const isSpace = ({ instruction }) => instruction === ' '
const isTab = ({ instruction }) => instruction === '\t'
const isLabel = ({ instruction }) => instruction[instruction.length - 1] === ':'
const isFunction = ({ instruction }) => instruction[0] === '.'
const isString = ({ instruction }) => instruction[0] === '"' && instruction[instruction.length - 1] === '"'
const isValue = ({ instruction }) => {
	const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '$']
	return chars.includes(instruction[0])
}
const isEqual = ({ instruction }) => instruction === '='
const isNewLine = ({ instruction }) => instruction === '\n'

const mapRecognitionInstructionFirstStage = obj => {
	if (isComment(obj))
		return { ...obj, type: COMMENT }
	else if (isSpace(obj))
		return { ...obj, type: SPACE }
	else if (isTab(obj))
		return { ...obj, type: TAB }
	else if (isLabel(obj))
		return { ...obj, type: LABEL }
	else if (isFunction(obj))
		return { ...obj, type: FUNCTION }
	else if (isString(obj))
		return { ...obj, type: STRING }
	else if (isValue(obj))
		return { ...obj, type: VALUE }
	else if (isEqual(obj))
		return { ...obj, type: EQUAL }
	else if (isNewLine(obj))
		return { ...obj, type: NEWLINE }
	else
		return { ...obj, type: UNKNOWN }
}

const filterRemoveNotImportantTokens = ({ type }) => {
	const typesToIgnore = [COMMENT, SPACE, TAB, NEWLINE]
	return !typesToIgnore.includes(type)
}

const sourceFile = Deno.readTextFileSync("test.asm")

const tokens = tokensFromCode(sourceFile)
const foo = tokens
	.map(mapRecognitionInstructionFirstStage)
	.filter(filterRemoveNotImportantTokens)
console.log(foo)