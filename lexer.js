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
const LABEL_VALUE = 10
const CONST = 11
const NUMBER = 12
const HEX_VALUE = 13

const isComment = ({ instruction }) => instruction[0] === ';' && instruction[instruction.length - 1] === '\n'
const isSpace = ({ instruction }) => instruction === ' '
const isTab = ({ instruction }) => instruction === '\t'
const isLabel = ({ instruction }) => instruction[instruction.length - 1] === ':'
const isFunction = ({ instruction }) => instruction[0] === '.'
const isString = ({ instruction }) => instruction[0] === '"' && instruction[instruction.length - 1] === '"'
const isNumber = ({ instruction }) => {
	const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
	return chars.includes(instruction[0])
}
const isHexValue = ({ instruction }) => instruction[0] === '$'
const isValue = ({ instruction }) => instruction[0] === '#'
const isEqual = ({ instruction }) => instruction === '='
const isNewLine = ({ instruction }) => instruction === '\n'
const isTypeLabel = ({ type }) => type === LABEL
const isTypeConst = ({ type }) => type === CONST

const mapRecognitionTokensFirstStage = token => {
	if (isComment(token))
		return { ...token, type: COMMENT }
	else if (isSpace(token))
		return { ...token, type: SPACE }
	else if (isTab(token))
		return { ...token, type: TAB }
	else if (isLabel(token))
		return { ...token, type: LABEL }
	else if (isFunction(token))
		return { ...token, type: FUNCTION }
	else if (isString(token))
		return { ...token, type: STRING }
	else if (isValue(token))
		return { ...token, type: VALUE }
	else if (isEqual(token))
		return { ...token, type: EQUAL }
	else if (isNewLine(token))
		return { ...token, type: NEWLINE }
	else if (isNumber(token))
		return { ...token, type: NUMBER }
	else if (isHexValue(token))
		return { ...token, type: HEX_VALUE }
	else
		return { ...token, type: UNKNOWN }
}

const mapRecognitionConstToken = (token, index, array) => {
	const nextToken = array[index + 1]
	if (token.type === UNKNOWN && nextToken.type === EQUAL)
		return { ...token, type: CONST }
	else
		return token
}

const mapFindLabelInValue = labelList => token => {
	if (labelList.includes(token.instruction))
		return { ...token, type: LABEL_VALUE }
	else
		return token
}

const reduceCollectLabelAndConst = (list, token) => {
	if (isTypeLabel(token))
		return [...list, token.instruction.substring(0, token.instruction.length - 1)]
	else if (isTypeConst(token))
		return [...list, token.instruction]
	else
		return list
}

const filterRemoveNotImportantTokens = ({ type }) => {
	const typesToIgnore = [COMMENT, SPACE, TAB, NEWLINE]
	return !typesToIgnore.includes(type)
}

const filterRemoveEqualToken = ({ type }) => !(type === EQUAL)

const sourceFile = Deno.readTextFileSync("test.asm")

const tokens = tokensFromCode(sourceFile)
const foo = tokens
	.map(mapRecognitionTokensFirstStage)
	.filter(filterRemoveNotImportantTokens)
	.map(mapRecognitionConstToken)
	.filter(filterRemoveEqualToken)

const labelAndConstList = foo.reduce(reduceCollectLabelAndConst, [])
const foo2 = foo.map(mapFindLabelInValue(labelAndConstList))
console.log(foo2)