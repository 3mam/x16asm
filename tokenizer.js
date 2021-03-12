const mapSplitToPeaces = (line, lineNumber) =>
	line.reduce(
		({ obj = [], str = "", column = 1, ignore = false, skip = false, quotEnd = '' }, char, index, array) => {
			const nextChar = array[index + 1]
			const chars = [' ', '\t', '"', '=', '\n', ';']
			const returnObj = { instruction: str + char, line: lineNumber + 1, column }

			if (char === '\\' || char === ',')
				return { obj, str: str + char, column, quotEnd, ignore, skip: true }

			if (skip)
				return { obj, str: str + char, column, quotEnd, ignore }

			if (quotEnd === char)
				return { obj: [...obj, returnObj], column: index + 2 }

			if (char === '"')
				return { obj, str: str + char, column, quotEnd: '"', ignore: true }

			if (char === ';')
				return { obj, str: str + char, column, quotEnd: '\n', ignore: true }

			if (ignore)
				return { obj, str: str + char, column, quotEnd, ignore }

			if (chars.includes(char))
				return { obj: [...obj, returnObj], column: char == '\t' ? index + 3 : index + 2 }

			if (chars.includes(nextChar))
				return { obj: [...obj, returnObj], column: char == '\t' ? index + 3 : index + 2 }

			return { obj, str: str + char, column }

		}, 0).obj

export const tokensFromCode = codeString => {
	const splitToLine = codeString
		.split('\n')
		.map(line => line + '\n')

	const splitToPeaces = splitToLine
		.map(element => Array.from(element))
		.map(mapSplitToPeaces)
		.flat()

	return splitToPeaces
}