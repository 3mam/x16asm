import { types } from './lexer.js'
import { recursion } from './tools.js'

const addressingType = Object.freeze({
	INDIRECT: 1,
	INDIRECT_X: 2,
	INDIRECT_Y: 3,
	IND_ZERO_PAGE: 4,
	INDIRECT_LABEL: 5,
	INDIRECT_LABEL_X: 6,
	INDIRECT_LABEL_Y: 7,
})

const error = ({ line, column }, errorMessage) => {
	throw `${errorMessage} in line ${line} column ${column}`
}

const checkUnknown = ({ type, line, column }) =>
	type === types.UNKNOWN && error({ line, column }, 'Unknown instruction')

const recognizeInstructions = (tokens, index) => ({
	isLabelIndirect: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.LABEL_VALUE &&
		tokens[index + 2]?.type === types.CLOSE_BRACKET &&
		tokens[index + 3]?.type !== types.COMMA
	,
	isLabelIndirectX: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.LABEL_VALUE &&
		tokens[index + 2]?.type === types.COMMA &&
		tokens[index + 3]?.type === types.X &&
		tokens[index + 4]?.type === types.CLOSE_BRACKET
	,
	isLabelIndirectY: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.LABEL_VALUE &&
		tokens[index + 2]?.type === types.CLOSE_BRACKET &&
		tokens[index + 3]?.type === types.COMMA &&
		tokens[index + 4]?.type === types.Y
	,
	isIndirect: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.HEX_VALUE &&
		tokens[index + 2]?.type === types.NUMBER &&
		tokens[index + 3]?.type === types.CLOSE_BRACKET &&
		tokens[index + 4]?.type !== types.COMMA
	,
	isIndirectX: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.HEX_VALUE &&
		tokens[index + 2]?.type === types.NUMBER &&
		tokens[index + 3]?.type === types.COMMA &&
		tokens[index + 4]?.type === types.X &&
		tokens[index + 5]?.type === types.CLOSE_BRACKET
	,
	isIndirectY: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.HEX_VALUE &&
		tokens[index + 2]?.type === types.NUMBER &&
		tokens[index + 3]?.type === types.CLOSE_BRACKET &&
		tokens[index + 4]?.type === types.COMMA &&
		tokens[index + 5]?.type === types.Y
	,
	isHexValue: () =>
		tokens[index]?.type === types.VALUE &&
		tokens[index + 1]?.type === types.HEX_VALUE &&
		tokens[index + 2]?.type === types.NUMBER
	,
	isBinValue: () =>
		tokens[index]?.type === types.VALUE &&
		tokens[index + 1]?.type === types.BIN_VALUE &&
		tokens[index + 2]?.type === types.NUMBER
	,
	isValue: () =>
		tokens[index]?.type === types.VALUE &&
		tokens[index + 1]?.type === types.NUMBER
})

const split16to8bit = val => val > 255 ? [0xff & val, val >> 8 & 0xff] : [val]

const strHexToValue = valueStrHex => split16to8bit(parseInt(valueStrHex, 16))
const strDcmToValue = valueStrDcm => split16to8bit(parseInt(valueStrDcm, 10))
const strBinToValue = valueStrBin => split16to8bit(parseInt(valueStrBin, 2))


const getAddressingTypeFromValueToken = (tokens, index = 0, newTokensList = []) => {
	if (tokens.length <= index)
		throw newTokensList
	const instruction = recognizeInstructions(tokens, index)
	if (instruction.isLabelIndirectY())
		return [tokens, index + 5, [...newTokensList,
		{ value: tokens[index + 1].instruction, type: addressingType.INDIRECT_LABEL_Y }]]
	else if (instruction.isLabelIndirectX())
		return [tokens, index + 5, [...newTokensList,
		{ value: tokens[index + 1].instruction, type: addressingType.INDIRECT_LABEL_X }]]
	else if (instruction.isLabelIndirect())
		return [tokens, index + 3, [...newTokensList,
		{ value: tokens[index + 1].instruction, type: addressingType.INDIRECT_LABEL }]]
	else if (instruction.isIndirectY())
		return [tokens, index + 6, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: addressingType.INDIRECT_Y }]]
	else if (instruction.isIndirectX())
		return [tokens, index + 6, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: addressingType.INDIRECT_X }]]
	else if (instruction.isIndirect())
		return [tokens, index + 4, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: addressingType.INDIRECT }]]
	else if (instruction.isHexValue())
		return [tokens, index + 3, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: -1 }]]
	else if (instruction.isBinValue())
		return [tokens, index + 3, [...newTokensList,
		{ value: strBinToValue(tokens[index + 2].instruction), type: -1 }]]
	else if (instruction.isValue())
		return [tokens, index + 2, [...newTokensList,
		{ value: strDcmToValue(tokens[index + 1].instruction), type: -1 }]]

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}

export function checkErrors(tokens) {
	return recursion(getAddressingTypeFromValueToken)(tokens)
}