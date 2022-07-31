import Parser from './Parser.js'
import Code from './Code.js'

const assembly = `@3
D=M
@5 // Comment
D=D-A

@100
// Comment 
D;JEQ
@200
0;JMP`

const parser = new Parser(assembly)
const code = new Code()

const decimal2Binary = (decimal: number, minLength = 16) => {
  let binary = decimal.toString(2)
  while (binary.length < minLength) binary = `0${binary}`
  return binary
}

/**
 *
 */
const getBinary = () => {
  switch (parser.commandType) {
    case Parser.BLANK_LINE:
      return '(Blank line)'
    case Parser.A_COMMAND:
      return `0${decimal2Binary(Number(parser.symbol), 15)}`
    case Parser.C_COMMAND:
      return [
        '111',
        code.comp(parser.comp),
        code.dest(parser.dest),
        code.jump(parser.jump),
      ].join('')
    case Parser.L_COMMAND:
      return 'We need to develop a SymbolTable.'
  }
}

/**
 *
 */
const init = () => {
  while (parser.hasMoreCommands) {
    console.log(getBinary())
    parser.advance()
  }
  console.log(getBinary())
}

// startup
init()
