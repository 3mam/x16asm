import { tokenData } from './record.js'

const mapSplitToPeaces = (line, lineNumber) =>
	line.reduce(
		({ obj = [], str = "", column = 1, ignore = false, skip = false, endChar = '' }, char, index, array) => {
			const nextChar = array[index + 1]
			const chars = [' ', '\t', '"', '=', '\n', ';', '(', ')', ',', '#', '$', '%', '<', '>']
			const returnObj = tokenData()
				.token(str + char)
				.line(lineNumber + 1)
				.column(column)
				.valueOf()
				
			if (char === '\\')
				return { obj, str: str + char, column, endChar, ignore, skip: true }

			if (skip)
				return { obj, str: str + char, column, endChar, ignore }

			if (endChar === char)
				return { obj: [...obj, returnObj], column: index + 2 }

			if (char === '"')
				return { obj, str: str + char, column, endChar: '"', ignore: true }

			if (char === ';')
				return { obj, str: str + char, column, endChar: '\n', ignore: true }

			if (ignore)
				return { obj, str: str + char, column, endChar, ignore }

			if (chars.includes(char))
				return { obj: [...obj, returnObj], column: char == '\t' ? index + 3 : index + 2 }

			if (chars.includes(nextChar))
				return { obj: [...obj, returnObj], column: char == '\t' ? index + 3 : index + 2 }

			return { obj, str: str + char, column }

		}, 0).obj

export function tokensFromCode(codeString) {
	const splitToPeaces = codeString
		.split('\n')
		.map(line => line + '\n')
		.map(element => Array.from(element))
		.map(mapSplitToPeaces)
		.flat()

	return splitToPeaces
}