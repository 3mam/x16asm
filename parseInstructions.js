import { types } from './enum.js'

export const recognizeInstructionsValue = (tokens, index) => ({
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

export const recognizeInstructionsValueConst = (tokens, index) => ({
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