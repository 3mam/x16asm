import { cpuInstructions } from './instructions.js'
import { types } from './enum.js'
import { tokenData } from './record.js'

const recognizeChars = token => ({
	isComment: () => token[0] === ';' && token[token.length - 1] === '\n',
	isSpace: () => token === ' ',
	isTab: () => token === '\t',
	isLabel: () => token[token.length - 1] === ':',
	isFunction: () => token[0] === '.',
	isString: () => token[0] === '"' && token[token.length - 1] === '"',
	isNumber: () => /^[0-9a-f]+$/gim.test(token),
	isHexValue: () => token[0] === '$',
	isValue: () => token[0] === '#',
	isEqual: () => token === '=',
	isNewLine: () => token === '\n',
	isBinValue: () => token === '%',
	isOpenBracket: () => token === '(',
	isCloseBracket: () => token === ')',
	isComma: () => token === ',',
	isLowByte: () => token === '<',
	isHiByte: () => token === '>',
	isX: () => token.toLowerCase() === 'x',
	isY: () => token.toLowerCase() === 'y',
})

const mapRecognitionTokensFirstStage = token => {
	const char = recognizeChars(token.token)
	if (char.isComment())
		return tokenData(token)
		.type(types.COMMENT)
		.valueOf()
	else if (char.isSpace())
		return tokenData(token)
		.type(types.SPACE)
		.valueOf()
	else if (char.isTab())
		return tokenData(token)
		.type(types.TAB)
		.valueOf()
	else if (char.isLabel())
		return tokenData(token)
		.type(types.LABEL)
		.valueOf()
	else if (char.isFunction())
		return tokenData(token)
		.type(types.FUNCTION)
		.valueOf()
	else if (char.isString())
		return tokenData(token)
		.type(types.STRING)
		.valueOf()
	else if (char.isValue())
		return tokenData(token)
		.type(types.VALUE)
		.valueOf()
	else if (char.isEqual())
		return tokenData(token)
			.type(types.EQUAL)
			.valueOf()
	else if (char.isNewLine())
		return tokenData(token)
		.type(types.NEWLINE)
		.valueOf()
	else if (char.isNumber())
		return tokenData(token)
		.type(types.NUMBER)
		.valueOf()
	else if (char.isHexValue())
		return tokenData(token)
		.type(types.HEX_VALUE)
		.valueOf()
	else if (char.isBinValue())
		return tokenData(token)
		.type(types.BIN_VALUE)
		.valueOf()
	else if (char.isOpenBracket())
		return tokenData(token)
		.type(types.OPEN_BRACKET)
		.valueOf()
	else if (char.isCloseBracket())
		return tokenData(token)
		.type(types.CLOSE_BRACKET)
		.valueOf()
	else if (char.isComma())
		return tokenData(token)
		.type(types.COMMA)
		.valueOf()
	else if (char.isLowByte())
		return tokenData(token)
		.type(types.LOW_BYTE)
		.valueOf()
	else if (char.isHiByte())
		return tokenData(token)
		.type(types.HI_BYTE)
		.valueOf()
	else if (char.isX())
		return tokenData(token)
		.type(types.X)
		.valueOf()
	else if (char.isY())
		return tokenData(token)
		.type(types.Y)
		.valueOf()
	else
		return tokenData(token)
		.type(types.UNKNOWN)
		.valueOf()
}

const mapFindConstToken = (token, index, array) => {
	const tokenType = token.type
	const nextTokenType = array[index + 1]?.type
	if (tokenType === types.UNKNOWN && nextTokenType === types.EQUAL)
		return tokenData(token)
		.type(types.CONST)
		.valueOf()
	else
		return token
}

const mapFindLabelInValue = list => token => {
	if (list.includes(token.token))
		return tokenData(token)
			.type(types.LABEL_VALUE)
			.valueOf()
	else
		return token
}

const mapFindConstInValue = list => token => {
	if (list.includes(token.token) && token.type !== types.CONST)
		return tokenData(token)
			.type(types.CONST_VALUE)
			.valueOf()
	else
		return token
}

const mapFindCpuInstructionsInToken = cpuInstructions => token => {
	if (typeof cpuInstructions[token.token] === 'object')
		return tokenData(token)
			.type(types.INSTRUCTION)
			.valueOf()
	else
		return token
}

const reduceCollectLabel = (list, token) => {
	if (token.type === types.LABEL)
		return [...list, token.token.substring(0, token.token.length - 1)]
	else
		return list
}

const reduceCollectConst = (list, token) => {
	if (token.type === types.CONST)
		return [...list, token.token.substring(0, token.token.length)]
	else
		return list
}

const filterRemoveNotImportantTokens = token => {
	const typesToIgnore = [types.COMMENT, types.SPACE, types.TAB, types.NEWLINE]
	return !typesToIgnore.includes(token.type)
}

const filterRemoveEqualToken = token => !(token.type === types.EQUAL)

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