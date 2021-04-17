import { recursion } from './func.js'
import * as color from 'https://deno.land/std/fmt/colors.ts'

const findFileName = string => string.search(/^.*\.(asm|s)$/) === -1 ? null : string
const checkIfHaveFileName = ({ fileName }) => fileName === null ? false : true

const help = `
-h this message
-o output file
-b binary type output (bin or prg(default))
`

const parserArgs = (argsArray, { fileName, output, binaryType }, arrayPosition = 0) => {
	const arrayNexPosition = arrayPosition + 1
	const arg = argsArray[arrayPosition]
	const nextArg = argsArray[arrayNexPosition]

	if (arrayPosition >= argsArray.length)
		throw { fileName, output, binaryType }
	else
		switch (arg) {
			default:
				return [argsArray, { 'fileName': findFileName(arg), output, binaryType }, arrayNexPosition]
			case '-o':
				return [argsArray, { fileName, 'output': nextArg, binaryType }, arrayNexPosition + 1]
			case '-b':
				return [argsArray, { fileName, output, 'binaryType': nextArg }, arrayNexPosition + 1]
			case '-h':
				throw help
		}
}

export function processArg({ fileName, output, preCompile, binaryType }) {
	const argsObject = recursion(parserArgs)(Deno.args, { fileName, output, preCompile, binaryType })
	if (typeof argsObject === 'string') {
		console.log(color.green(argsObject))
		Deno.exit(0)
	} else if (!checkIfHaveFileName(argsObject)) {
		console.log(color.yellow('No source file in args'))
		Deno.exit(0)
	} else
		return argsObject
}