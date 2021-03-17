import { processArg } from './args.js'
import * as color from 'https://deno.land/std/fmt/colors.ts'
import { piping } from './tools.js'
import { tokensFromCode } from './tokenizer.js'
import { lexer, types } from './lexer.js'

const loadAsmCode = ({ fileName }) => {
	try {
		return Deno.readTextFileSync(fileName)
	} catch (error) {
		console.log(color.red(`File ${color.white(fileName)} not found`))
	}
}

const args = Deno.args
const defaultSettings = {
	'binaryType': 'prg',
	'fileName': null
}

const tokens = piping(defaultSettings)
	.pipe(processArg)
	.pipe(loadAsmCode)
	.pipe(tokensFromCode)
	.pipe(lexer)
	.valueOf()
	//tokens.forEach(el => {
//	(el.type === types.UNKNOWN) && console.log(el)
//})
console.log(tokens)