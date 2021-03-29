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

const isLabelIndirect = (tokens, index) =>
	tokens[index].type === types.OPEN_BRACKET &&
	tokens[index + 1].type === types.LABEL_VALUE &&
	tokens[index + 2].type === types.CLOSE_BRACKET &&
	tokens[index + 3].type !== types.COMMA

const isLabelIndirectX = (tokens, index) =>
	tokens[index].type === types.OPEN_BRACKET &&
	tokens[index + 1].type === types.LABEL_VALUE &&
	tokens[index + 2].type === types.COMMA &&
	tokens[index + 3].type === types.X &&
	tokens[index + 4].type === types.CLOSE_BRACKET

const isLabelIndirectY = (tokens, index) =>
	tokens[index].type === types.OPEN_BRACKET &&
	tokens[index + 1].type === types.LABEL_VALUE &&
	tokens[index + 2].type === types.CLOSE_BRACKET &&
	tokens[index + 3].type === types.COMMA &&
	tokens[index + 4].type === types.Y

const getAddressingTypeFromValueToken = (tokens, index = 0, newTokensList = []) => {
	if (tokens.length - 1 === index)
		throw newTokensList


	if (isLabelIndirectY(tokens, index))
		return [tokens, index + 5, [...newTokensList,
		{ value: tokens[index + 1].instruction, type: addressingType.INDIRECT_LABEL_Y }]]
	else if (isLabelIndirectX(tokens, index))
		return [tokens, index + 5, [...newTokensList,
		{ value: tokens[index + 1].instruction, type: addressingType.INDIRECT_LABEL_X }]]
	else if (isLabelIndirect(tokens, index))
		return [tokens, index + 3, [...newTokensList,
		{ value: tokens[index + 1].instruction, type: addressingType.INDIRECT_LABEL }]]


	return [tokens, index + 1, [...newTokensList, tokens[index]]]
}

export function checkErrors(tokens) {
	return recursion(getAddressingTypeFromValueToken)(tokens)
}