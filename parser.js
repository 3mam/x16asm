import { recursion, piping } from './func.js'
import { valueTypes, types } from './enum.js'
import { cpuInstructions } from './instructions.js'
import { instructionData } from './record.js'
import { recognizeInstructionsValue, recognizeInstructionsValueConst } from './parseInstructions.js'

const split16to8bit = val => val > 255 ? [0xff & val, val >> 8 & 0xff] : [val]

const strHexToValue = valueStrHex => split16to8bit(parseInt(valueStrHex, 16))
const strDcmToValue = valueStrDcm => split16to8bit(parseInt(valueStrDcm, 10))
const strBinToValue = valueStrBin => split16to8bit(parseInt(valueStrBin, 2))

const recGetValueTypeFromToken = (tokens, index = 0, instructionList = []) => {
	if (tokens.length <= index)
		throw instructionList

	const instruction = recognizeInstructionsValue(tokens, index)

	if (instruction.isLabelIndirectY())
		return [tokens, index + 5, [...instructionList, instructionData()
			.name(tokens[index + 1].token)
			.value([0, 0])
			.type(valueTypes.LABEL_INDIRECT_Y)
			.valueOf()
		]]

	else if (instruction.isLabelIndirectX())
		return [tokens, index + 5, [...instructionList, instructionData()
			.name(tokens[index + 1].token)
			.value([0, 0])
			.type(valueTypes.LABEL_INDIRECT_X)
			.valueOf()
		]]

	else if (instruction.isLabelIndirect())
		return [tokens, index + 3, [...instructionList, instructionData()
			.name(tokens[index + 1].token)
			.value([0, 0])
			.type(valueTypes.LABEL_INDIRECT)
			.valueOf()
		]]

	else if (instruction.isIndirectY())
		return [tokens, index + 6, [...instructionList, instructionData()
			.name(tokens[index + 2].token)
			.value(strHexToValue(tokens[index + 2].token))
			.type(valueTypes.INDIRECT_Y)
			.valueOf()
		]]

	else if (instruction.isIndirectX())
		return [tokens, index + 6, [...instructionList, instructionData()
			.name(tokens[index + 2].token)
			.value(strHexToValue(tokens[index + 2].token))
			.type(valueTypes.INDIRECT_X)
			.valueOf()
		]]

	else if (instruction.isIndirect()) {
		const token = tokens[index + 2].token
		const val = strHexToValue(token)
		return [tokens, index + 4, [...instructionList, instructionData()
			.name(token)
			.value(val)
			.type(val <= 255 ? valueTypes.IND_ZERO_PAGE : valueTypes.INDIRECT)
			.valueOf()
		]]
	}

	else if (instruction.isHexValue())
		return [tokens, index + 3, [...instructionList, instructionData()
			.name(tokens[index + 2].token)
			.value(strHexToValue(tokens[index + 2].token))
			.type(valueTypes.IMMEDIATE)
			.valueOf()
		]]

	else if (instruction.isBinValue())
		return [tokens, index + 3, [...instructionList, instructionData()
			.name(tokens[index + 2].token)
			.value(strBinToValue(tokens[index + 2].token))
			.type(valueTypes.IMMEDIATE)
			.valueOf()
		]]

	else if (instruction.isValue())
		return [tokens, index + 2, [...instructionList, instructionData()
			.name(tokens[index + 1].token)
			.value(strDcmToValue(tokens[index + 1].token))
			.type(valueTypes.IMMEDIATE)
			.valueOf()
		]]

	else if (instruction.isHexAddress()) {
		const token = tokens[index + 1].token
		const val = strHexToValue(token)
		return [tokens, index + 2, [...instructionList, instructionData()
			.name(token)
			.value(val)
			.type(val <= 255 ? valueTypes.ZERO_PAGE : valueTypes.ABSOLUTE)
			.valueOf()
		]]
	}

	else if (instruction.isHexAddressX()) {
		const token = tokens[index + 1].token
		const val = strHexToValue(token)
		return [tokens, index + 4, [...instructionList, instructionData()
			.name(token)
			.value(val)
			.type(val <= 255 ? valueTypes.ZERO_PAGE : valueTypes.ABSOLUTE)
			.valueOf()
		]]
	}

	else if (instruction.isHexAddressY()) {
		const token = tokens[index + 1].token
		const val = strHexToValue(token)
		return [tokens, index + 4, [...instructionList, instructionData()
			.name(token)
			.value(val)
			.type(val <= 255 ? valueTypes.ZERO_PAGE_Y : valueTypes.ABSOLUTE_Y)
			.valueOf()
		]]
	}

	else if (instruction.isAbsoluteLabel())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(tokens[index + 1].token)
			.value([0, 0])
			.type(valueTypes.LABEL_ABSOLUTE)
			.valueOf()
		]]

	else if (instruction.isAbsoluteLabelX())
		return [tokens, index + 3, [...instructionList, instructionData()
			.name(tokens[index].token)
			.value([0, 0])
			.type(valueTypes.LABEL_ABSOLUTE_X)
			.valueOf()
		]]

	else if (instruction.isAbsoluteLabelY())
		return [tokens, index + 3, [...instructionList, instructionData()
			.name(tokens[index].token)
			.value([0, 0])
			.type(valueTypes.LABEL_ABSOLUTE_Y)
			.valueOf()
		]]

	return [tokens, index + 1, [...instructionList, tokens[index]]]
}

const recConnectConstWithValue = (tokens, index = 0, instructionList = []) => {
	if (tokens.length <= index)
		throw instructionList

	const token = tokens[index]
	const nextToken = tokens[index + 1]
	const value = [valueTypes.IMMEDIATE, valueTypes.ABSOLUTE, valueTypes.ZERO_PAGE]
	if (token?.type === types.CONST)
		if (value.includes(nextToken?.type))
			return [tokens, index + 2, [...instructionList, instructionData()
				.name(token.token)
				.value(nextToken.value)
				.type(valueTypes.CONST)
				.valueOf()
			]]
		else
			return [tokens, index + 2, [...instructionList, instructionData()
				.name(token.token)
				.value(null)
				.type(-1)
				.valueOf()
			]]

	return [tokens, index + 1, [...instructionList, tokens[index]]]
}

const recReplaceConsToValueType = constList => (tokens, index = 0, instructionList = []) => {

	if (constList.length === 0)
		throw tokens

	if (tokens.length <= index)
		throw instructionList

	const cons = recognizeInstructionsValueConst(tokens, index)
	if (cons.isIndirect()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.token)
		return [tokens, index + 3, [...instructionList, instructionData(consToken)
			.type(consToken.value.length === 2 ? valueTypes.INDIRECT : valueTypes.IND_ZERO_PAGE)
			.valueOf()
		]]
	}

	else if (cons.isIndirectX()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.token)
		return [tokens, index + 5, [...instructionList, instructionData(consToken)
			.type(valueTypes.INDIRECT_X)
			.valueOf()
		]]
	}

	else if (cons.isIndirectY()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.token)
		return [tokens, index + 5, [...instructionList, instructionData(consToken)
			.type(valueTypes.INDIRECT_Y)
			.valueOf()
		]]
	}

	else if (cons.isAbsolute()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.token)
		return [tokens, index + 1, [...instructionList, instructionData(consToken)
			.type(consToken.value.length === 2 ? valueTypes.ABSOLUTE : valueTypes.ZERO_PAGE)
			.valueOf()
		]]
	}

	else if (cons.isAbsoluteX()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.token)
		return [tokens, index + 3, [...instructionList, instructionData(consToken)
			.type(consToken.value.length === 2 ? valueTypes.ABSOLUTE_X : valueTypes.ZERO_PAGE_X)
			.valueOf()
		]]
	}

	else if (cons.isAbsoluteY()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.token)
		return [tokens, index + 3, [...instructionList, instructionData(consToken)
			.type(consToken.value.length === 2 ? valueTypes.ABSOLUTE_Y : valueTypes.ZERO_PAGE_Y)
			.valueOf()
		]]
	}

	return [tokens, index + 1, [...instructionList, tokens[index]]]
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

const recConnectCpuInstructionsToValueType = (tokens, index = 0, instructionList = []) => {

	if (tokens.length <= index)
		throw instructionList

	const token = tokens[index]?.token?.toLowerCase()

	if (!cpuInstructions.hasOwnProperty(token))
		return [tokens, index + 1, [...instructionList, tokens[index]]]

	const cpuInstruction = cpuInstructions[token]
	const valueType = recognizeCpuInstructionTypeThruValue(tokens, index)

	if (cpuInstruction?.implied)
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.implied])
			.valueOf()
		]]

	else if (valueType.isImmediate())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.immediate])
			.valueOf()
		]]

	else if (valueType.isZeroPage())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.zeroPage])
			.valueOf()
		]]

	else if (valueType.isZeroPageX())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.zeroPageX])
			.valueOf()
		]]

	else if (valueType.isZeroPageY())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.zeroPageY])
			.valueOf()
		]]

	else if (valueType.isIndZeroPage())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.indZeroPage])
			.valueOf()
		]]

	else if (valueType.isAbsolute())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.absolute])
			.valueOf()
		]]

	else if (valueType.isAbsoluteX())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.absoluteX])
			.valueOf()
		]]

	else if (valueType.isAbsoluteY())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.absoluteY])
			.valueOf()
		]]

	else if (valueType.isIndirect())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.indirect])
			.valueOf()
		]]

	else if (valueType.isIndirectX())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.indirectX])
			.valueOf()
		]]

	else if (valueType.isIndirectY())
		return [tokens, index + 1, [...instructionList, instructionData()
			.name(token)
			.value([cpuInstruction.indirectY])
			.valueOf()
		]]

	return [tokens, index + 1, [...instructionList, tokens[index]]]
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
		(recursion(recGetValueTypeFromToken))
		(recursion(recConnectConstWithValue))
		()

	const constList = recognizeValue.reduce(reduceCollectConst, [])
	const tokensWithoutConst = recognizeValue
		.reduce(reduceRemoveConst, [])

	const combineInstructionsToValues = piping(tokensWithoutConst)
		(recursion(recReplaceConsToValueType(constList)))
		(recursion(recConnectCpuInstructionsToValueType))
		()

	return combineInstructionsToValues
}