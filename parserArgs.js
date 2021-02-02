/*
	-o = output file
	-p = pre compile file
	-b = binary type output (bin or prg)

*/
import recursion from "./recursion.js"
import * as color from "https://deno.land/std/fmt/colors.ts"

const findCodeName = string => string.search(/^.*\.(asm|s)$/) === -1 ? null : string
const checkIfHaveCodeFileName = ({ code }) => code === null ? false : true

const filterArgs = (argsArray, { code, output, preCompile, binaryType }, arrayPosition = 0) => {
	const arrayNexPosition = arrayPosition + 1
	const arg = argsArray[arrayPosition]
	const nextArg = argsArray[arrayNexPosition]

	if (arrayPosition >= argsArray.length)
		throw { code, output, preCompile, binaryType }
	else
		switch (arg) {
			default:
				return [argsArray, { "code": findCodeName(arg), output, preCompile, binaryType }, arrayNexPosition]
			case "-o":
				return [argsArray, { code, "output": nextArg, preCompile, binaryType }, arrayNexPosition + 1]
			case "-p":
				return [argsArray, { code, output, "preCompile": nextArg, binaryType }, arrayNexPosition + 1]
			case "-b":
				return [argsArray, { code, output, preCompile, "binaryType": nextArg }, arrayNexPosition + 1]
		}
}

export default (argsArray, { code, output, preCompile, binaryType }) => {
	const argsObject = recursion(filterArgs)(argsArray, { code, output, preCompile, binaryType })
	if (!checkIfHaveCodeFileName(argsObject))
		throw color.yellow("No source file in args")
	else
		return argsObject
}