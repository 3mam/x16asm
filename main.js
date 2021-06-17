import { processArg } from './args.js'
import * as color from 'https://deno.land/std/fmt/colors.ts'
import { piping } from './func.js'
import { tokensFromCode } from './tokenizer.js'
import { lexer } from './lexer.js'
import { parser } from './parser.js'

const loadAsmCode = ({ fileName }) => {
	try {
		return Deno.readTextFileSync(fileName)
	} catch (error) {
		console.log(color.red(`File ${color.white(fileName)} not found`))
		Deno.exit(-1)
	}
}

const defaultSettings = {
	'binaryType': 'prg',
	'fileName': null
}

const tokens = piping(
	defaultSettings
	, processArg
	, loadAsmCode
	, tokensFromCode
	, lexer
	, parser
)

console.log(tokens)