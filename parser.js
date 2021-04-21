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
			.setName(tokens[index + 1].token)
			.setValue([0, 0])
			.setType(valueTypes.LABEL_INDIRECT_Y)
		]]

	else if (instruction.isLabelIndirectX())
		return [tokens, index + 5, [...instructionList, instructionData()
			.setName(tokens[index + 1].token)
			.setValue([0, 0])
			.setType(valueTypes.LABEL_INDIRECT_X)
		]]

	else if (instruction.isLabelIndirect())
		return [tokens, index + 3, [...instructionList, instructionData()
			.setName(tokens[index + 1].token)
			.setValue([0, 0])
			.setType(valueTypes.LABEL_INDIRECT)
		]]

	else if (instruction.isIndirectY())
		return [tokens, index + 6, [...instructionList, instructionData()
			.setName(tokens[index + 2].token)
			.setValue(strHexToValue(tokens[index + 2].token))
			.setType(valueTypes.INDIRECT_Y)
		]]

	else if (instruction.isIndirectX())
		return [tokens, index + 6, [...instructionList, instructionData()
			.setName(tokens[index + 2].token)
			.setValue(strHexToValue(tokens[index + 2].token))
			.setType(valueTypes.INDIRECT_X)
		]]

	else if (instruction.isIndirect()) {
		const token = tokens[index + 2].token
		const val = strHexToValue(token)
		return [tokens, index + 4, [...instructionList, instructionData()
			.setName(token)
			.setValue(val)
			.setType(val <= 255 ? valueTypes.IND_ZERO_PAGE : valueTypes.INDIRECT)
		]]
	}

	else if (instruction.isHexValue())
		return [tokens, index + 3, [...instructionList, instructionData()
			.setName(tokens[index + 2].token)
			.setValue(strHexToValue(tokens[index + 2].token))
			.setType(valueTypes.IMMEDIATE)
		]]

	else if (instruction.isBinValue())
		return [tokens, index + 3, [...instructionList, instructionData()
			.setName(tokens[index + 2].token)
			.setValue(strBinToValue(tokens[index + 2].token))
			.setType(valueTypes.IMMEDIATE)
		]]

	else if (instruction.isValue())
		return [tokens, index + 2, [...instructionList, instructionData()
			.setName(tokens[index + 1].token)
			.setValue(strDcmToValue(tokens[index + 1].token))
			.setType(valueTypes.IMMEDIATE)
		]]

	else if (instruction.isHexAddress()) {
		const token = tokens[index + 1].token
		const val = strHexToValue(token)
		return [tokens, index + 2, [...instructionList, instructionData()
			.setName(token)
			.setValue(val)
			.setType(val <= 255 ? valueTypes.ZERO_PAGE : valueTypes.ABSOLUTE)
		]]
	}

	else if (instruction.isHexAddressX()) {
		const token = tokens[index + 1].token
		const val = strHexToValue(token)
		return [tokens, index + 4, [...instructionList, instructionData()
			.setName(token)
			.setValue(val)
			.setType(val <= 255 ? valueTypes.ZERO_PAGE : valueTypes.ABSOLUTE)
		]]
	}

	else if (instruction.isHexAddressY()) {
		const token = tokens[index + 1].token
		const val = strHexToValue(token)
		return [tokens, index + 4, [...instructionList, instructionData()
			.setName(token)
			.setValue(val)
			.setType(val <= 255 ? valueTypes.ZERO_PAGE_Y : valueTypes.ABSOLUTE_Y)
		]]
	}

	else if (instruction.isAbsoluteLabel())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(tokens[index + 1].token)
			.setValue([0, 0])
			.setType(valueTypes.LABEL_ABSOLUTE)
		]]

	else if (instruction.isAbsoluteLabelX())
		return [tokens, index + 3, [...instructionList, instructionData()
			.setName(tokens[index].token)
			.setValue([0, 0])
			.setType(valueTypes.LABEL_ABSOLUTE_X)
		]]

	else if (instruction.isAbsoluteLabelY())
		return [tokens, index + 3, [...instructionList, instructionData()
			.setName(tokens[index].token)
			.setValue([0, 0])
			.setType(valueTypes.LABEL_ABSOLUTE_Y)
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
				.setName(token.token)
				.setValue(nextToken.value)
				.setType(valueTypes.CONST)
			]]
		else
			return [tokens, index + 2, [...instructionList, instructionData()
				.setName(token.token)
				.setValue(null)
				.setType(-1)
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
		return [tokens, index + 3, [...instructionList, consToken
			.setType(consToken.value.length === 2 ? valueTypes.INDIRECT : valueTypes.IND_ZERO_PAGE)
		]]
	}

	else if (cons.isIndirectX()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.token)
		return [tokens, index + 5, [...instructionList, consToken
			.setType(valueTypes.INDIRECT_X)
		]]
	}

	else if (cons.isIndirectY()) {
		const consToken = constList.find(obj => obj.name === tokens[index + 1]?.token)
		return [tokens, index + 5, [...instructionList, consToken
			.setType(valueTypes.INDIRECT_Y)
		]]
	}

	else if (cons.isAbsolute()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.token)
		return [tokens, index + 1, [...instructionList, consToken
			.setType(consToken.value.length === 2 ? valueTypes.ABSOLUTE : valueTypes.ZERO_PAGE)
		]]
	}

	else if (cons.isAbsoluteX()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.token)
		return [tokens, index + 3, [...instructionList, consToken
			.setType(consToken.value.length === 2 ? valueTypes.ABSOLUTE_X : valueTypes.ZERO_PAGE_X)
		]]
	}

	else if (cons.isAbsoluteY()) {
		const consToken = constList.find(obj => obj.name === tokens[index]?.token)
		return [tokens, index + 3, [...instructionList, consToken
			.setType(consToken.value.length === 2 ? valueTypes.ABSOLUTE_Y : valueTypes.ZERO_PAGE_Y)
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
			.setName(token)
			.setValue([cpuInstruction.implied])
		]]

	else if (valueType.isImmediate())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.immediate])
		]]

	else if (valueType.isZeroPage())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.zeroPage])
		]]

	else if (valueType.isZeroPageX())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.zeroPageX])
		]]

	else if (valueType.isZeroPageY())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.zeroPageY])
		]]

	else if (valueType.isIndZeroPage())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.indZeroPage])
		]]

	else if (valueType.isAbsolute())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.absolute])
		]]

	else if (valueType.isAbsoluteX())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.absoluteX])
		]]

	else if (valueType.isAbsoluteY())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.absoluteY])
		]]

	else if (valueType.isIndirect())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.indirect])
		]]

	else if (valueType.isIndirectX())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.indirectX])
		]]

	else if (valueType.isIndirectY())
		return [tokens, index + 1, [...instructionList, instructionData()
			.setName(token)
			.setValue([cpuInstruction.indirectY])
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
	console.log(combineInstructionsToValues.map(v => v.valueOf()))

	return combineInstructionsToValues
}