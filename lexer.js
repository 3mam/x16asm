import { cpuInstructions } from './instructions.js'

export const types = Object.freeze({
	UNKNOWN: 0,
	COMMENT: 1,
	SPACE: 2,
	TAB: 3,
	LABEL: 4,
	FUNCTION: 5,
	STRING: 6,
	VALUE: 7,
	EQUAL: 8,
	NEWLINE: 9,
	LABEL_VALUE: 10,
	CONST: 11,
	NUMBER: 12,
	HEX_VALUE: 13,
	INSTRUCTION: 14,
	BIN_VALUE: 15,
	OPEN_BRACKET: 16,
	CLOSE_BRACKET: 17,
	COMMA: 18,
	LOW_BYTE: 19,
	HI_BYTE: 20,
	X: 21,
	Y: 22,
})

const isComment = ({ instruction }) => instruction[0] === ';' && instruction[instruction.length - 1] === '\n'
const isSpace = ({ instruction }) => instruction === ' '
const isTab = ({ instruction }) => instruction === '\t'
const isLabel = ({ instruction }) => instruction[instruction.length - 1] === ':'
const isFunction = ({ instruction }) => instruction[0] === '.'
const isString = ({ instruction }) => instruction[0] === '"' && instruction[instruction.length - 1] === '"'
const isNumber = ({ instruction }) => {
	const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
	return chars.includes(instruction.toLowerCase()[0])
}
const isHexValue = ({ instruction }) => instruction[0] === '$'
const isValue = ({ instruction }) => instruction[0] === '#'
const isEqual = ({ instruction }) => instruction === '='
const isNewLine = ({ instruction }) => instruction === '\n'
const isBinValue = ({ instruction }) => instruction === '%'
const isOpenBracket = ({ instruction }) => instruction === '('
const isCloseBracket = ({ instruction }) => instruction === ')'
const isComma = ({ instruction }) => instruction === ','
const isLowByte = ({ instruction }) => instruction === '<'
const isHiByte = ({ instruction }) => instruction === '>'
const isX = ({ instruction }) => instruction.toLowerCase() === 'x'
const isY = ({ instruction }) => instruction.toLowerCase() === 'y'

const isTypeLabel = ({ type }) => type === types.LABEL
const isTypeConst = ({ type }) => type === types.CONST

const mapRecognitionTokensFirstStage = token => {
	if (isComment(token))
		return { ...token, type: types.COMMENT }
	else if (isSpace(token))
		return { ...token, type: types.SPACE }
	else if (isTab(token))
		return { ...token, type: types.TAB }
	else if (isLabel(token))
		return { ...token, type: types.LABEL }
	else if (isFunction(token))
		return { ...token, type: types.FUNCTION }
	else if (isString(token))
		return { ...token, type: types.STRING }
	else if (isValue(token))
		return { ...token, type: types.VALUE }
	else if (isEqual(token))
		return { ...token, type: types.EQUAL }
	else if (isNewLine(token))
		return { ...token, type: types.NEWLINE }
	else if (isNumber(token))
		return { ...token, type: types.NUMBER }
	else if (isHexValue(token))
		return { ...token, type: types.HEX_VALUE }
	else if (isBinValue(token))
		return { ...token, type: types.BIN_VALUE }
	else if (isOpenBracket(token))
		return { ...token, type: types.OPEN_BRACKET }
	else if (isCloseBracket(token))
		return { ...token, type: types.CLOSE_BRACKET }
	else if (isComma(token))
		return { ...token, type: types.COMMA }
	else if (isLowByte(token))
		return { ...token, type: types.LOW_BYTE }
	else if (isHiByte(token))
		return { ...token, type: types.HI_BYTE }
	else if (isX(token))
		return { ...token, type: types.X }
	else if (isY(token))
		return { ...token, type: types.Y }
	else
		return { ...token, type: types.UNKNOWN }
}

const mapFindConstToken = (token, index, array) => {
	const nextToken = array[index + 1]
	if (token.type === types.UNKNOWN && nextToken.type === types.EQUAL)
		return { ...token, type: types.CONST }
	else
		return token
}

const mapFindLabelAndConstInValue = list => token => {
	if (list.includes(token.instruction))
		return { ...token, type: types.LABEL_VALUE }
	else
		return token
}

const mapFindCpuInstructionsInToken = cpuInstructions => token => {
	if (typeof cpuInstructions[token.instruction] === 'object')
		return { ...token, type: types.INSTRUCTION }
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
	const typesToIgnore = [types.COMMENT, types.SPACE, types.TAB, types.NEWLINE]
	return !typesToIgnore.includes(type)
}

const filterRemoveEqualToken = ({ type }) => !(type === types.EQUAL)


export function lexer(tokens) {
	const firstStage = tokens
		.map(mapRecognitionTokensFirstStage)
		.filter(filterRemoveNotImportantTokens)
		.map(mapFindConstToken)
		.filter(filterRemoveEqualToken)
		.map(mapFindCpuInstructionsInToken(cpuInstructions))

	const labelAndConstList = firstStage.reduce(reduceCollectLabelAndConst, [])
	const secondStage = firstStage.map(mapFindLabelAndConstInValue(labelAndConstList))
	return secondStage
}