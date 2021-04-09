import { recursion, piping } from './tools.js'
import { valueType, types } from './enum.js'

const error = ({ line, column }, errorMessage) => {
	throw `${errorMessage} in line ${line} column ${column}`
}

const checkUnknown = ({ type, line, column }) =>
	type === types.UNKNOWN && error({ line, column }, 'Unknown instruction')

const recognizeInstructionsValue = (tokens, index) => ({
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
	,
	isHexAddress: () =>
		tokens[index]?.type === types.HEX_VALUE &&
		tokens[index + 1]?.type === types.NUMBER &&
		tokens[index + 2]?.type !== types.COMMA
	,
	isHexAddressX: () =>
		tokens[index]?.type === types.HEX_VALUE &&
		tokens[index + 1]?.type === types.NUMBER &&
		tokens[index + 2]?.type === types.COMMA &&
		tokens[index + 3]?.type === types.X
	,
	isHexAddressY: () =>
		tokens[index]?.type === types.HEX_VALUE &&
		tokens[index + 1]?.type === types.NUMBER &&
		tokens[index + 2]?.type === types.COMMA &&
		tokens[index + 3]?.type === types.Y
	,
	isAbsoluteLabel: () =>
		tokens[index]?.type === types.LABEL_VALUE &&
		tokens[index + 1]?.type !== types.COMMA
	,
	isAbsoluteLabelX: () =>
		tokens[index]?.type === types.LABEL_VALUE &&
		tokens[index + 1]?.type === types.COMMA &&
		tokens[index + 2]?.type === types.X
	,
	isAbsoluteLabelY: () =>
		tokens[index]?.type === types.LABEL_VALUE &&
		tokens[index + 1]?.type === types.COMMA &&
		tokens[index + 2]?.type === types.Y
})

const recognizeInstructionsValueConst = (tokens, index) => ({
	isIndirect: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.CONST_VALUE &&
		tokens[index + 2]?.type === types.CLOSE_BRACKET &&
		tokens[index + 3]?.type !== types.COMMA
	,
	isIndirectX: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.CONST_VALUE &&
		tokens[index + 2]?.type === types.COMMA &&
		tokens[index + 3]?.type === types.X &&
		tokens[index + 4]?.type === types.CLOSE_BRACKET
	,
	isIndirectY: () =>
		tokens[index]?.type === types.OPEN_BRACKET &&
		tokens[index + 1]?.type === types.CONST_VALUE &&
		tokens[index + 2]?.type === types.CLOSE_BRACKET &&
		tokens[index + 3]?.type === types.COMMA &&
		tokens[index + 4]?.type === types.Y
	,
	isAbsolute: () =>
		tokens[index]?.type === types.CONST_VALUE &&
		tokens[index + 1]?.type !== types.COMMA
	,
	isAbsoluteX: () =>
		tokens[index]?.type === types.CONST_VALUE &&
		tokens[index + 1]?.type === types.COMMA &&
		tokens[index + 2]?.type === types.X
	,
	isAbsoluteY: () =>
		tokens[index]?.type === types.CONST_VALUE &&
		tokens[index + 1]?.type === types.COMMA &&
		tokens[index + 2]?.type === types.Y
})

const split16to8bit = val => val > 255 ? [0xff & val, val >> 8 & 0xff] : [val]

const strHexToValue = valueStrHex => split16to8bit(parseInt(valueStrHex, 16))
const strDcmToValue = valueStrDcm => split16to8bit(parseInt(valueStrDcm, 10))
const strBinToValue = valueStrBin => split16to8bit(parseInt(valueStrBin, 2))


const recGetValueTypeFromToken = (tokens, index = 0, newTokensList = []) => {
	if (tokens.length <= index)
		throw newTokensList

	const instruction = recognizeInstructionsValue(tokens, index)

	if (instruction.isLabelIndirectY())
		return [tokens, index + 5, [...newTokensList,
		{ name: tokens[index + 1].instruction, value: [0, 0], type: valueType.LABEL_INDIRECT_Y }]]

	else if (instruction.isLabelIndirectX())
		return [tokens, index + 5, [...newTokensList,
		{ name: tokens[index + 1].instruction, value: [0, 0], type: valueType.LABEL_INDIRECT_X }]]

	else if (instruction.isLabelIndirect())
		return [tokens, index + 3, [...newTokensList,
		{ name: tokens[index + 1].instruction, value: [0, 0], type: valueType.LABEL_INDIRECT }]]

	else if (instruction.isIndirectY())
		return [tokens, index + 6, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: valueType.INDIRECT_Y }]]

	else if (instruction.isIndirectX())
		return [tokens, index + 6, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: valueType.INDIRECT_X }]]

	else if (instruction.isIndirect()) {
		const val = strHexToValue(tokens[index + 2].instruction)
		return [tokens, index + 4, [...newTokensList,
		{ value: val, type: val <= 255 ? valueType.IND_ZERO_PAGE : valueType.INDIRECT }]]
	}

	else if (instruction.isHexValue())
		return [tokens, index + 3, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: valueType.IMMEDIATE }]]

	else if (instruction.isBinValue())
		return [tokens, index + 3, [...newTokensList,
		{ value: strBinToValue(tokens[index + 2].instruction), type: valueType.IMMEDIATE }]]

	else if (instruction.isValue())
		return [tokens, index + 2, [...newTokensList,
		{ value: strDcmToValue(tokens[index + 1].instruction), type: valueType.IMMEDIATE }]]

	else if (instruction.isHexAddress()) {
		const val = strHexToValue(tokens[index + 1].instruction)
		return [tokens, index + 2, [...newTokensList,
		{ value: val, type: val <= 255 ? valueType.ZERO_PAGE : valueType.ABSOLUTE }]]
	}

	else if (instruction.isHexAddressX()) {
		const val = strHexToValue(tokens[index + 1].instruction)
		return [tokens, index + 4, [...newTokensList,
		{ value: val, type: val <= 255 ? valueType.ZERO_PAGE_X : valueType.ABSOLUTE_X }]]
	}

	else if (instruction.isHexAddressY()) {
		const val = strHexToValue(tokens[index + 1].instruction)
		return [tokens, index + 4, [...newTokensList,
		{ value: val, type: val <= 255 ? valueType.ZERO_PAGE_Y : valueType.ABSOLUTE_Y }]]
	}

	else if (instruction.isAbsoluteLabel())
		return [tokens, index + 1, [...newTokensList,
		{ name: tokens[index].instruction, value: [0, 0], type: valueType.LABEL_ABSOLUTE }]]

	else if (instruction.isAbsoluteLabelX())
		return [tokens, index + 3, [...newTokensList,
		{ name: tokens[index].instruction, value: [0, 0], type: valueType.LABEL_ABSOLUTE_X }]]

	else if (instruction.isAbsoluteLabelY())
		return [tokens, index + 3, [...newTokensList,
		{ name: tokens[index].instruction, value: [0, 0], type: valueType.LABEL_ABSOLUTE_Y }]]

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}

const recConnectConstWithValue = (tokens, index = 0, newTokensList = []) => {
	if (tokens.length <= index)
		throw newTokensList

	const token = tokens[index]
	const nextToken = tokens[index + 1]
	const value = [valueType.IMMEDIATE, valueType.ABSOLUTE, valueType.ZERO_PAGE]
	if (token.type === types.CONST)
		if (value.includes(nextToken?.type))
			return [tokens, index + 2, [...newTokensList,
			{ name: token.instruction, value: [...nextToken.value], type: valueType.CONST }]]
		else
			return [tokens, index + 2, [...newTokensList,
			{ name: token.instruction, value: null, type: -1 }]]

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}

const recReplaceConsToValueType = constList => (tokens, index = 0, newTokensList = []) => {

	if (constList.length === 0)
		throw tokens
		
	if (tokens.length <= index)
		throw newTokensList

	const cons = recognizeInstructionsValueConst(tokens, index)

	if (cons.isIndirect()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.instruction)
		return [tokens, index + 3, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueType.INDIRECT : valueType.IND_ZERO_PAGE }]]
	}

	else if (cons.isIndirectX()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.instruction)
		return [tokens, index + 5, [...newTokensList,
		{ value: consToken.value, type: valueType.INDIRECT_X }]]
	}

	else if (cons.isIndirectY()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.instruction)
		return [tokens, index + 5, [...newTokensList,
		{ value: consToken.value, type: valueType.INDIRECT_Y }]]
	}

	else if (cons.isAbsolute()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.instruction)
		return [tokens, index + 1, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueType.ABSOLUTE : valueType.ZERO_PAGE }]]
	}

	else if (cons.isAbsoluteX()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.instruction)
		return [tokens, index + 3, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueType.ABSOLUTE_X : valueType.ZERO_PAGE_X }]]
	}

	else if (cons.isAbsoluteY()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.instruction)
		return [tokens, index + 3, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueType.ABSOLUTE_Y : valueType.ZERO_PAGE_Y }]]
	}

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}


const reduceCollectConst = (list, token) => {
	if (token.type === valueType.CONST)
		return [...list, token]
	else
		return list
}

const reduceRemoveConst = (list, token) => token.type === valueType.CONST ? list : [...list, token]

export function checkErrors(tokens) {
	const recognizeValue = piping(tokens)
		.pipe(recursion(recGetValueTypeFromToken))
		.pipe(recursion(recConnectConstWithValue))
		.valueOf()

	const constList = recognizeValue.reduce(reduceCollectConst, [])
	const tokensWithoutConst = recognizeValue
		.reduce(reduceRemoveConst, [])

	const replaceConstValueToValueType = piping(tokensWithoutConst)
		.pipe(recursion(recReplaceConsToValueType(constList)))
		.valueOf()

	return replaceConstValueToValueType
}