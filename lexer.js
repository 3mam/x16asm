import { cpuInstructions } from './instructions.js'
import { types } from './enum.js'

const recognizeChars = ({ token }) => ({
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

const mapRecognitionTokensFirstStage = tokenData => {
	const char = recognizeChars(tokenData.valueOf())
	if (char.isComment())
		return tokenData.setType(types.COMMENT)
	else if (char.isSpace())
		return tokenData.setType(types.SPACE)
	else if (char.isTab())
		return tokenData.setType(types.TAB)
	else if (char.isLabel())
		return tokenData.setType(types.LABEL)
	else if (char.isFunction())
		return tokenData.setType(types.FUNCTION)
	else if (char.isString())
		return tokenData.setType(types.STRING)
	else if (char.isValue())
		return tokenData.setType(types.VALUE)
	else if (char.isEqual())
		return tokenData.setType(types.EQUAL)
	else if (char.isNewLine())
		return tokenData.setType(types.NEWLINE)
	else if (char.isNumber())
		return tokenData.setType(types.NUMBER)
	else if (char.isHexValue())
		return tokenData.setType(types.HEX_VALUE)
	else if (char.isBinValue())
		return tokenData.setType(types.BIN_VALUE)
	else if (char.isOpenBracket())
		return tokenData.setType(types.OPEN_BRACKET)
	else if (char.isCloseBracket())
		return tokenData.setType(types.CLOSE_BRACKET)
	else if (char.isComma())
		return tokenData.setType(types.COMMA)
	else if (char.isLowByte())
		return tokenData.setType(types.LOW_BYTE)
	else if (char.isHiByte())
		return tokenData.setType(types.HI_BYTE)
	else if (char.isX())
		return tokenData.setType(types.X)
	else if (char.isY())
		return tokenData.setType(types.Y)
	else
		return tokenData.setType(types.UNKNOWN)

}

const mapFindConstToken = (tokenData, index, array) => {
	const token = tokenData.valueOf()
	const nextToken = array[index + 1]?.valueOf()
	if (token.type === types.UNKNOWN && nextToken.type === types.EQUAL)
		return tokenData.setType(types.CONST)
	else
		return tokenData
}

const mapFindLabelInValue = list => tokenData => {
	const { token } = tokenData.valueOf()
	if (list.includes(token))
		return tokenData.setType(types.LABEL_VALUE)
	else
		return tokenData
}

const mapFindConstInValue = list => tokenData => {
	const { token, type } = tokenData.valueOf()
	if (list.includes(token) && type !== types.CONST)
		return tokenData.setType(types.CONST_VALUE)
	else
		return tokenData
}

const mapFindCpuInstructionsInToken = cpuInstructions => tokenData => {
	const { token } = tokenData.valueOf()
	if (typeof cpuInstructions[token] === 'object')
		return tokenData.setType(types.INSTRUCTION)
	else
		return tokenData
}

const reduceCollectLabel = (list, tokenData) => {
	const { token, type } = tokenData.valueOf()
	if (type === types.LABEL)
		return [...list, token.substring(0, token.length - 1)]
	else
		return list
}

const reduceCollectConst = (list, tokenData) => {
	const { token, value } = tokenData.valueOf()
	if (value === types.CONST)
		return [...list, token.substring(0, token.length)]
	else
		return list
}

const filterRemoveNotImportantTokens = (tokenData) => {
	const { type } = tokenData.valueOf()
	const typesToIgnore = [types.COMMENT, types.SPACE, types.TAB, types.NEWLINE]
	return !typesToIgnore.includes(type)
}

const filterRemoveEqualToken = (tokenData) => !(tokenData.valueOf().type === types.EQUAL)

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