import { recursion, piping } from './funcTools.js'
import { valueTypes, types } from './enum.js'
import { cpuInstructions } from './instructions.js'

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
		{ name: tokens[index + 1].instruction, value: [0, 0], type: valueTypes.LABEL_INDIRECT_Y }]]

	else if (instruction.isLabelIndirectX())
		return [tokens, index + 5, [...newTokensList,
		{ name: tokens[index + 1].instruction, value: [0, 0], type: valueTypes.LABEL_INDIRECT_X }]]

	else if (instruction.isLabelIndirect())
		return [tokens, index + 3, [...newTokensList,
		{ name: tokens[index + 1].instruction, value: [0, 0], type: valueTypes.LABEL_INDIRECT }]]

	else if (instruction.isIndirectY())
		return [tokens, index + 6, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: valueTypes.INDIRECT_Y }]]

	else if (instruction.isIndirectX())
		return [tokens, index + 6, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: valueTypes.INDIRECT_X }]]

	else if (instruction.isIndirect()) {
		const val = strHexToValue(tokens[index + 2].instruction)
		return [tokens, index + 4, [...newTokensList,
		{ value: val, type: val <= 255 ? valueTypes.IND_ZERO_PAGE : valueTypes.INDIRECT }]]
	}

	else if (instruction.isHexValue())
		return [tokens, index + 3, [...newTokensList,
		{ value: strHexToValue(tokens[index + 2].instruction), type: valueTypes.IMMEDIATE }]]

	else if (instruction.isBinValue())
		return [tokens, index + 3, [...newTokensList,
		{ value: strBinToValue(tokens[index + 2].instruction), type: valueTypes.IMMEDIATE }]]

	else if (instruction.isValue())
		return [tokens, index + 2, [...newTokensList,
		{ value: strDcmToValue(tokens[index + 1].instruction), type: valueTypes.IMMEDIATE }]]

	else if (instruction.isHexAddress()) {
		const val = strHexToValue(tokens[index + 1].instruction)
		return [tokens, index + 2, [...newTokensList,
		{ value: val, type: val <= 255 ? valueTypes.ZERO_PAGE : valueTypes.ABSOLUTE }]]
	}

	else if (instruction.isHexAddressX()) {
		const val = strHexToValue(tokens[index + 1].instruction)
		return [tokens, index + 4, [...newTokensList,
		{ value: val, type: val <= 255 ? valueTypes.ZERO_PAGE_X : valueTypes.ABSOLUTE_X }]]
	}

	else if (instruction.isHexAddressY()) {
		const val = strHexToValue(tokens[index + 1].instruction)
		return [tokens, index + 4, [...newTokensList,
		{ value: val, type: val <= 255 ? valueTypes.ZERO_PAGE_Y : valueTypes.ABSOLUTE_Y }]]
	}

	else if (instruction.isAbsoluteLabel())
		return [tokens, index + 1, [...newTokensList,
		{ name: tokens[index].instruction, value: [0, 0], type: valueTypes.LABEL_ABSOLUTE }]]

	else if (instruction.isAbsoluteLabelX())
		return [tokens, index + 3, [...newTokensList,
		{ name: tokens[index].instruction, value: [0, 0], type: valueTypes.LABEL_ABSOLUTE_X }]]

	else if (instruction.isAbsoluteLabelY())
		return [tokens, index + 3, [...newTokensList,
		{ name: tokens[index].instruction, value: [0, 0], type: valueTypes.LABEL_ABSOLUTE_Y }]]

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}

const recConnectConstWithValue = (tokens, index = 0, newTokensList = []) => {
	if (tokens.length <= index)
		throw newTokensList

	const token = tokens[index]
	const nextToken = tokens[index + 1]
	const value = [valueTypes.IMMEDIATE, valueTypes.ABSOLUTE, valueTypes.ZERO_PAGE]
	if (token.type === types.CONST)
		if (value.includes(nextToken?.type))
			return [tokens, index + 2, [...newTokensList,
			{ name: token.instruction, value: [...nextToken.value], type: valueTypes.CONST }]]
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
		{ value: consToken.value, type: consToken.value.length === 2 ? valueTypes.INDIRECT : valueTypes.IND_ZERO_PAGE }]]
	}

	else if (cons.isIndirectX()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.instruction)
		return [tokens, index + 5, [...newTokensList,
		{ value: consToken.value, type: valueTypes.INDIRECT_X }]]
	}

	else if (cons.isIndirectY()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.instruction)
		return [tokens, index + 5, [...newTokensList,
		{ value: consToken.value, type: valueTypes.INDIRECT_Y }]]
	}

	else if (cons.isAbsolute()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.instruction)
		return [tokens, index + 1, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueTypes.ABSOLUTE : valueTypes.ZERO_PAGE }]]
	}

	else if (cons.isAbsoluteX()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.instruction)
		return [tokens, index + 3, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueTypes.ABSOLUTE_X : valueTypes.ZERO_PAGE_X }]]
	}

	else if (cons.isAbsoluteY()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.instruction)
		return [tokens, index + 3, [...newTokensList,
		{ value: consToken.value, type: consToken.value.length === 2 ? valueTypes.ABSOLUTE_Y : valueTypes.ZERO_PAGE_Y }]]
	}

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}


const recognizeCpuInstructionTypeThruValue = (tokens, index = 0) => {
	const valueType = tokens[index + 1]?.type
	return ({
		isImmediate: () => valueType === valueTypes.IMMEDIATE,
		isZeroPage: () => valueType === valueTypes.ZERO_PAGE,
		isZeroPageX: () => valueType === valueTypes.ZERO_PAGE_X,
		isZeroPageY: () => valueType === valueTypes.ZERO_PAGE_Y,
		isIndZeroPage: () => valueType === valueTypes.IND_ZERO_PAGE,
		isAbsolute: () => valueType === valueTypes.ABSOLUTE,
		isAbsoluteX: () => valueType === valueTypes.ABSOLUTE_X,
		isAbsoluteY: () => valueType === valueTypes.ABSOLUTE_Y,
		isIndirect: () => valueType === valueTypes.INDIRECT,
		isIndirectX: () => valueType === valueTypes.INDIRECT_X,
		isIndirectY: () => valueType === valueTypes.ABSOLUTE_Y,
	})
}

const recConnectCpuInstructionsToValueType = (tokens, index = 0, newTokensList = []) => {

	if (tokens.length <= index)
		throw newTokensList

	const cpuInstruction = cpuInstructions[tokens[index]?.instruction?.toLowerCase()]
	const valueType = recognizeCpuInstructionTypeThruValue(tokens, index)

	if (cpuInstruction?.implied)
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.implied] }]]

	else if (valueType.isImmediate())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.immediate] }]]

	else if (valueType.isZeroPage())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.zeroPage] }]]

	else if (valueType.isZeroPageX())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.zeroPageX] }]]

	else if (valueType.isZeroPageY())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.zeroPageY] }]]

	else if (valueType.isIndZeroPage())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.indZeroPage] }]]

	else if (valueType.isAbsolute())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.absolute] }]]

	else if (valueType.isAbsoluteX())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.absoluteX] }]]

	else if (valueType.isAbsoluteY())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.absoluteY] }]]

	else if (valueType.isIndirect())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.indirect] }]]

	else if (valueType.isIndirectX())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.indirectX] }]]

	else if (valueType.isIndirectY())
		return [tokens, index + 1, [...newTokensList, { value: [cpuInstruction.indirectY] }]]

	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}


const reduceCollectConst = (list, token) => {
	if (token.type === valueTypes.CONST)
		return [...list, token]
	else
		return list
}

const reduceRemoveConst = (list, token) => token.type === valueTypes.CONST ? list : [...list, token]

export function parser(tokens) {
	const recognizeValue = piping(tokens)
		.pipe(recursion(recGetValueTypeFromToken))
		.pipe(recursion(recConnectConstWithValue))
		.valueOf()

	const constList = recognizeValue.reduce(reduceCollectConst, [])
	const tokensWithoutConst = recognizeValue
		.reduce(reduceRemoveConst, [])

	const combineInstructionsToValues = piping(tokensWithoutConst)
		.pipe(recursion(recReplaceConsToValueType(constList)))
		.pipe(recursion(recConnectCpuInstructionsToValueType))
		.valueOf()

	return combineInstructionsToValues
}