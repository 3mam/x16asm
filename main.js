import {processArg} from "./args.js"
import * as color from "https://deno.land/std/fmt/colors.ts"
import { piping } from './tools.js'
import { tokensFromCode } from './tokenizer.js'
import {lexer, types} from './lexer.js'

const loadAsmCode = ({ fileName }) => {
	try {
		const file = Deno.readTextFileSync(fileName)
		return file
	} catch (error) {
		console.log(color.red(`File ${color.white(fileName)} not found`))
	}
}

const args = Deno.args
const defaultSettings = {
	"binaryType": "prg",
	"fileName": null
}

const objectArgs = processArg(args, defaultSettings)
const sourceFile = loadAsmCode(objectArgs)
const tokens = piping(sourceFile)
	.pipe(tokensFromCode)
	.pipe(lexer)
	.valueOf()
tokens.forEach(el => {
	(el.type === types.UNKNOWN) && console.log(el)
})