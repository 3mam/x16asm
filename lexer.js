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
	CONST_VALUE: 23,
})

const recognizeChars = ({ instruction }) => ({
	isComment: () => instruction[0] === ';' && instruction[instruction.length - 1] === '\n',
	isSpace: () => instruction === ' ',
	isTab: () => instruction === '\t',
	isLabel: () => instruction[instruction.length - 1] === ':',
	isFunction: () => instruction[0] === '.',
	isString: () => instruction[0] === '"' && instruction[instruction.length - 1] === '"',
	isNumber: () => /^[0-9a-f]+$/gim.test(instruction),
	isHexValue: () => instruction[0] === '$',
	isValue: () => instruction[0] === '#',
	isEqual: () => instruction === '=',
	isNewLine: () => instruction === '\n',
	isBinValue: () => instruction === '%',
	isOpenBracket: () => instruction === '(',
	isCloseBracket: () => instruction === ')',
	isComma: () => instruction === ',',
	isLowByte: () => instruction === '<',
	isHiByte: () => instruction === '>',
	isX: () => instruction.toLowerCase() === 'x',
	isY: () => instruction.toLowerCase() === 'y',
})

const recognizeType = ({ type }) => ({
	isTypeLabel: () => type === types.LABEL,
	isTypeConst: () => type === types.CONST,
})

const mapRecognitionTokensFirstStage = token => {
	const char = recognizeChars(token)
	if (char.isComment())
		return { ...token, type: types.COMMENT }
	else if (char.isSpace())
		return { ...token, type: types.SPACE }
	else if (char.isTab())
		return { ...token, type: types.TAB }
	else if (char.isLabel())
		return { ...token, type: types.LABEL }
	else if (char.isFunction())
		return { ...token, type: types.FUNCTION }
	else if (char.isString())
		return { ...token, type: types.STRING }
	else if (char.isValue())
		return { ...token, type: types.VALUE }
	else if (char.isEqual())
		return { ...token, type: types.EQUAL }
	else if (char.isNewLine())
		return { ...token, type: types.NEWLINE }
	else if (char.isNumber())
		return { ...token, type: types.NUMBER }
	else if (char.isHexValue())
		return { ...token, type: types.HEX_VALUE }
	else if (char.isBinValue())
		return { ...token, type: types.BIN_VALUE }
	else if (char.isOpenBracket())
		return { ...token, type: types.OPEN_BRACKET }
	else if (char.isCloseBracket())
		return { ...token, type: types.CLOSE_BRACKET }
	else if (char.isComma())
		return { ...token, type: types.COMMA }
	else if (char.isLowByte())
		return { ...token, type: types.LOW_BYTE }
	else if (char.isHiByte())
		return { ...token, type: types.HI_BYTE }
	else if (char.isX())
		return { ...token, type: types.X }
	else if (char.isY())
		return { ...token, type: types.Y }
	else
		return { ...token, type: types.UNKNOWN }
}

const mapFindConstToken = (token, index, array) => {
	const nextToken = array[index + 1]
	if (token.type === types.UNKNOWN && nextToken?.type === types.EQUAL)
		return { ...token, type: types.CONST }
	else
		return token
}

const mapFindLabelInValue = list => token => {
	if (list.includes(token.instruction))
		return { ...token, type: types.LABEL_VALUE }
	else
		return token
}

const mapFindConstInValue = list => token => {
	if (list.includes(token.instruction) && token.type !== types.CONST)
		return { ...token, type: types.CONST_VALUE }
	else
		return token
}

const mapFindCpuInstructionsInToken = cpuInstructions => token => {
	if (typeof cpuInstructions[token.instruction] === 'object')
		return { ...token, type: types.INSTRUCTION }
	else
		return token
}

const reduceCollectLabel = (list, token) => {
	const type = recognizeType(token)
	if (type.isTypeLabel())
		return [...list, token.instruction.substring(0, token.instruction.length - 1)]
	else
		return list
}

const reduceCollectConst = (list, token) => {
	const type = recognizeType(token)
	if (type.isTypeConst())
		return [...list, token.instruction.substring(0, token.instruction.length)]
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

	const labelList = firstStage.reduce(reduceCollectLabel, [])
	const constList = firstStage.reduce(reduceCollectConst, [])
	const secondStage = firstStage
		.map(mapFindLabelInValue(labelList))
		.map(mapFindConstInValue(constList))
	return secondStage
}