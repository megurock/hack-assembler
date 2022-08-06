import Parser from '../src/script/core/Parser'

const singleLineCommand = '@1'
const doubleLoneCommand = `@1
@2`

/**
 * The following test code also verifies correct operation, even if they include some whitespace.
 */
describe('Parser', () => {
  //
  it('should identify if it has next command.', () => {
    expect(new Parser(singleLineCommand).hasMoreCommands).toBeFalsy()
    expect(new Parser(doubleLoneCommand).hasMoreCommands).toBeTruthy()
  })
  //
  it('should proceed to the next command line.', () => {
    const parser = new Parser(doubleLoneCommand)
    parser.advance()
    expect(parser.command).toBe('@2')
  })
  //
  it('should return the command type.', () => {
    expect(new Parser(' @1').commandType).toBe(Parser.A_COMMAND)
    expect(new Parser(' M=1 ').commandType).toBe(Parser.C_COMMAND)
    expect(new Parser(' (LOOP) ').commandType).toBe(Parser.L_COMMAND)
    expect(new Parser('@3 // Comment').commandType).toBe(Parser.A_COMMAND)
    expect(new Parser('// Comment').commandType).toBe(Parser.BLANK_LINE)
    expect(new Parser('goto LOOP').commandType).toBe(Parser.GOTO_COMMAND)
  })
  //
  it('should return the command symbol.', () => {
    expect(new Parser(' @1 ').symbol).toBe('1')
    expect(new Parser(' M=1 ').symbol).toBeNull()
    expect(new Parser(' (LOOP) ').symbol).toBe('LOOP')
    expect(new Parser(' goto LOOP ').symbol).toBe('@LOOP')
    expect(new Parser(' goto 3 ').symbol).toBe('3')
  })
  //
  it('should return the C instruction dest mnemonic.', () => {
    expect(new Parser(' D=M ').dest).toEqual('D')
    expect(new Parser(' (0;JPM) ').dest).toBeNull()
    expect(new Parser(' @1 ').dest).toBeNull()
  })
  //
  it('should return the C instruction comp mnemonic.', () => {
    expect(new Parser(' D=M ').comp).toEqual('M')
    expect(new Parser(' D=1;JPM ').comp).toEqual('1')
    expect(new Parser(' 0;JMP ').comp).toEqual('0')
    expect(new Parser(' @1 ').comp).toBeNull()
  })
  //
  it('should return the C instruction jump mnemonic.', () => {
    expect(new Parser(' D=1;JGT ').jump).toEqual('JGT')
    expect(new Parser(' 0;JMP ').jump).toEqual('JMP')
    expect(new Parser(' D=M ').jump).toBeNull()
    expect(new Parser(' @1 ').dest).toBeNull()
  })
  //
  it('should update the assembly.', () => {
    const parser = new Parser('@1')
    parser.setAssembly('D=1')
    expect(parser.commandType === Parser.C_COMMAND).toBeTruthy()
  })
  //
  it('should reset the head.', () => {
    const parser = new Parser(doubleLoneCommand)
    parser.advance()
    parser.reset()
    expect(parser.symbol).toBe('1')
  })
})
