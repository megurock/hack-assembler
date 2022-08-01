import SymbolTable from '../src/script/core/SymbolTable'

describe('SymbolTable', () => {
  const symbolTable = new SymbolTable()
  //
  it('should add a symbol and address in pair.', () => {
    expect(symbolTable.contains('SP')).toBeFalsy()
    symbolTable.addEntry('SP', 0)
    expect(symbolTable.contains('SP')).toBeTruthy()
  })
  //
  it('should return the symbol address.', () => {
    expect(symbolTable.getAddress('SP')).toBe(0)
  })
  //
  it('should delete the entry.', () => {
    symbolTable.deleteEntry('SP')
    expect(symbolTable.contains('SP')).toBeFalsy()
  })
  //
  it('should clear all entries.', () => {
    symbolTable.addEntry('LCL', 1)
    symbolTable.addEntry('ARG', 2)
    symbolTable.clearEntries()
    expect(symbolTable.contains('LCL')).toBeFalsy()
    expect(symbolTable.contains('ARG')).toBeFalsy()
  })
  //
  it('should return all entries.', () => {
    symbolTable.addEntry('LCL', 1)
    symbolTable.addEntry('ARG', 2)
    expect(symbolTable.entries.length === 2).toBeTruthy()
    expect(
      symbolTable.entries.find(
        ([symbol, address]) => symbol === 'LCL' && address === 1,
      ),
    ).toBeTruthy()
  })
})
