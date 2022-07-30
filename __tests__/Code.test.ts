import Code from '../src/script/Code'

describe('Code', () => {
  const code = new Code()
  //
  it('should convert dest mnemonic to binary.', () => {
    expect(code.dest(null)).toBe('000')
    expect(code.dest('M')).toBe('001')
    expect(code.dest('D')).toBe('010')
    expect(code.dest('MD')).toBe('011')
    expect(code.dest('A')).toBe('100')
    expect(code.dest('AM')).toBe('101')
    expect(code.dest('AD')).toBe('110')
    expect(code.dest('AMD')).toBe('111')
    try {
      expect(code.dest('DA')).toThrowError('DA is an invalid parameter')
    } catch (e) {}
  })
  //
  it('should convert comp mnemonic to binary.', () => {
    expect(code.comp('0')).toBe('0101010')
    expect(code.comp('1')).toBe('0111111')
    expect(code.comp('-1')).toBe('0111010')
    expect(code.comp('D')).toBe('0001100')
    expect(code.comp('A')).toBe('0110000')
    expect(code.comp('!D')).toBe('0001101')
    expect(code.comp('!A')).toBe('0110001')
    expect(code.comp('-D')).toBe('0001111')
    expect(code.comp('-A')).toBe('0110011')
    expect(code.comp('D+1')).toBe('0011111')
    expect(code.comp('A+1')).toBe('0110111')
    expect(code.comp('D-1')).toBe('0001110')
    expect(code.comp('A-1')).toBe('0110010')
    expect(code.comp('D+A')).toBe('0000010')
    expect(code.comp('D-A')).toBe('0010011')
    expect(code.comp('A-D')).toBe('0000111')
    expect(code.comp('D&A')).toBe('0000000')
    expect(code.comp('D|A')).toBe('0010101')
    expect(code.comp('M')).toBe('1110000')
    expect(code.comp('!M')).toBe('1110001')
    expect(code.comp('-M')).toBe('1110011')
    expect(code.comp('-M')).toBe('1110011')
    expect(code.comp('M+1')).toBe('1110111')
    expect(code.comp('M-1')).toBe('1110010')
    expect(code.comp('D+M')).toBe('1000010')
    expect(code.comp('D-M')).toBe('1010011')
    expect(code.comp('M-D')).toBe('1000111')
    expect(code.comp('D&M')).toBe('1000000')
    expect(code.comp('D|M')).toBe('1010101')
    try {
      expect(code.comp('DA')).toThrowError('DA is an invalid parameter')
    } catch (e) {}
  })
  //
  it('should convert jump mnemonic to binary.', () => {
    expect(code.jump(null)).toBe('000')
    expect(code.jump('JGT')).toBe('001')
    expect(code.jump('JEQ')).toBe('010')
    expect(code.jump('JGE')).toBe('011')
    expect(code.jump('JLT')).toBe('100')
    expect(code.jump('JNE')).toBe('101')
    expect(code.jump('JLE')).toBe('110')
    expect(code.jump('JMP')).toBe('111')
    try {
      expect(code.jump('JEE')).toThrowError('JEE is an invalid parameter')
    } catch (e) {}
  })
})
