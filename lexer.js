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

	if (char.isSpace())
		return tokenData(token)
			.type(types.SPACE)
			.valueOf()

	if (char.isTab())
		return tokenData(token)
			.type(types.TAB)
			.valueOf()

	if (char.isLabel())
		return tokenData(token)
			.type(types.LABEL)
			.valueOf()

	if (char.isFunction())
		return tokenData(token)
			.type(types.FUNCTION)
			.valueOf()

	if (char.isString())
		return tokenData(token)
			.type(types.STRING)
			.valueOf()

	if (char.isValue())
		return tokenData(token)
			.type(types.VALUE)
			.valueOf()

	if (char.isEqual())
		return tokenData(token)
			.type(types.EQUAL)
			.valueOf()

	if (char.isNewLine())
		return tokenData(token)
			.type(types.NEWLINE)
			.valueOf()

	if (char.isNumber())
		return tokenData(token)
			.type(types.NUMBER)
			.valueOf()

	if (char.isHexValue())
		return tokenData(token)
			.type(types.HEX_VALUE)
			.valueOf()

	if (char.isBinValue())
		return tokenData(token)
			.type(types.BIN_VALUE)
			.valueOf()

	if (char.isOpenBracket())
		return tokenData(token)
			.type(types.OPEN_BRACKET)
			.valueOf()

	if (char.isCloseBracket())
		return tokenData(token)
			.type(types.CLOSE_BRACKET)
			.valueOf()

	if (char.isComma())
		return tokenData(token)
			.type(types.COMMA)
			.valueOf()

	if (char.isLowByte())
		return tokenData(token)
			.type(types.LOW_BYTE)
			.valueOf()

	if (char.isHiByte())
		return tokenData(token)
			.type(types.HI_BYTE)
			.valueOf()

	if (char.isX())
		return tokenData(token)
			.type(types.X)
			.valueOf()

	if (char.isY())
		return tokenData(token)
			.type(types.Y)
			.valueOf()


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

	return token
}

const mapFindLabelInValue = list => token => {
	if (list.includes(token.token))
		return tokenData(token)
			.type(types.LABEL_VALUE)
			.valueOf()

	return token
}

const mapFindConstInValue = list => token => {
	if (list.includes(token.token) && token.type !== types.CONST)
		return tokenData(token)
			.type(types.CONST_VALUE)
			.valueOf()

	return token
}

const mapFindCpuInstructionsInToken = cpuInstructions => token => {
	if (typeof cpuInstructions[token.token] === 'object')
		return tokenData(token)
			.type(types.INSTRUCTION)
			.valueOf()

	return token
}

const reduceCollectLabel = (list, token) => {
	if (token.type === types.LABEL)
		return [...list, token.token.substring(0, token.token.length - 1)]

	return list
}

const reduceCollectConst = (list, token) => {
	if (token.type === types.CONST)
		return [...list, token.token.substring(0, token.token.length)]

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