import Parser from './Parser.js'
import Code from './Code.js'
import SymbolTable from './SymbolTable.js'

type SymbolMapEntry = [string, number]

const assembly = `
// Sum of integers from 1 to 3
@i
M=1         // i = 1
@sum
M=0         // sum = 0
(LOOP)
  @i
  D=M       // D = i
  @3
  D=D-A     // D = i - 3
  @END
  D;JGT     // If (i - 3) > 0, goto END
  @i
  D=M       // D = i
  @sum
  M=D+M     // sum = sum + i
  @i
  M=M+1     // i = i + 1
  @LOOP
  0;JMP     // goto LOOP
(END)
  @END
  0;JMP     // Infinite loop
`
const parser = new Parser(assembly)
const code = new Code()
let variableAddress = 16

/**
 *
 * @param parser
 */
const createSymbolTable = () => {
  const symbolTable = new SymbolTable()
  // add predefined symbols
  const predefinedSymbols: SymbolMapEntry[] = [
    ['SP', 0],
    ['LCL', 1],
    ['ARG', 2],
    ['THIS', 3],
    ['THAT', 4],
    ['SCREEN', 16384],
    ['KBD', 24576],
  ]
  const registerSymbols: SymbolMapEntry[] = [...Array(16)].map((_, i) => [
    `R${i}`,
    i,
  ])
  predefinedSymbols
    .concat(registerSymbols)
    .forEach(([symbol, address]) => symbolTable.addEntry(symbol, address))

  // add runtime symbols
  let index = 0
  const parseLine = () => {
    switch (parser.commandType) {
      case Parser.A_COMMAND:
      case Parser.C_COMMAND:
        ++index
        break
      case Parser.L_COMMAND:
        if (parser.symbol) symbolTable.addEntry(parser.symbol, index)
    }
  }
  //
  while (parser.hasMoreCommands) {
    parseLine()
    parser.advance()
  }
  parseLine()
  return symbolTable
}

/**
 *
 * @param decimal
 * @param minLength
 * @returns
 */
const decimal2Binary = (decimal: number, minLength = 15) => {
  let binary = decimal.toString(2)
  while (binary.length < minLength) binary = `0${binary}`
  return binary
}

/**
 *
 * @returns
 */
const getBinary = (symbolTable: SymbolTable) => {
  switch (parser.commandType) {
    case Parser.A_COMMAND:
      const { symbol } = parser
      if (symbol) {
        let address
        const isNumber = /\d/.test(symbol)
        if (isNumber) {
          address = symbol
        } else {
          const hasSymbol = symbolTable.contains(symbol)
          if (!hasSymbol) symbolTable.addEntry(symbol, variableAddress++)
          const labelAddress = symbolTable.getAddress(symbol)
          if (labelAddress) address = labelAddress.toString()
        }
        if (address) return `0${decimal2Binary(Number(address))}`
      }
      throw new Error(`We cannot resolve the symbol for ${parser.symbol}`)
    case Parser.C_COMMAND:
      return [
        '111',
        code.comp(parser.comp),
        code.dest(parser.dest),
        code.jump(parser.jump),
      ].join('')
    default:
      return ''
  }
}

/**
 *
 * @param parser
 * @param code
 * @returns
 */
const createBinaryCommands = (symbolTable: SymbolTable) => {
  const commands = []
  while (parser.hasMoreCommands) {
    commands.push(getBinary(symbolTable))
    parser.advance()
  }
  commands.push(getBinary(symbolTable))
  return commands
}

/**
 * startup
 */
;(() => {
  // [1] First pass.
  // We will create a symbol table.
  const symbolTable = createSymbolTable()
  console.log(symbolTable.entries)

  // [2] Second pass.
  // Here we generate the Hack machine language in binary representation
  // while resolving the addresses of the symbols in the following way.
  // - Assign addresses to the label symbols of the A-instruction using the symbol table
  // - Assign addresses to the variable symbols if the symbol table does not contain the symbol
  parser.reset()
  const binaryCommands = createBinaryCommands(symbolTable).filter(
    command => command !== '',
  )
  console.log(binaryCommands.join('\r'))
})()
