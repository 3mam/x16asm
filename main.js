import tokenizer from "./tokenizer.js"
//import tokenizer from "./tokenizer.js"
import parseArgs from "./parserArgs.js"

const data = Deno.readTextFileSync("main.js")
const encoder = new TextEncoder()
const data2 = new Uint8Array([10, 10, 10])
Deno.writeFileSync("hello1.txt", data2)

const instructionsFile = Deno.readTextFileSync("65c02.json")
const instructions = JSON.parse(instructionsFile)
//console.log(instructions["adc"])

const args = Deno.args
const defaultSettings = {
	"binaryType": "prg",
	"code": null,
	"preCompile": null
}
console.log(parseArgs(args,defaultSettings))