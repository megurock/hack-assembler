export default class SymbolTable {
  private symbolMap: Map<string, number>

  /**
   *
   * @param symbolMap
   */
  public constructor() {
    this.symbolMap = new Map()
  }

  /**
   *
   * @param symbol
   * @param address in decimal expression
   */
  public addEntry(symbol: string, address: number) {
    this.symbolMap.set(symbol, address)
  }

  /**
   *
   * @param symbol
   * @returns true if the symbol exists in the symbol map.
   */
  public contains(symbol: string) {
    return this.symbolMap.has(symbol)
  }

  /**
   *
   * @param symbol
   * @returns the address bind to the symbol in decimal expression.
   */
  public getAddress(symbol: string) {
    return this.symbolMap.get(symbol)
  }

  /**
   *
   * @param symbol
   */
  public deleteEntry(symbol: string) {
    this.symbolMap.delete(symbol)
  }

  /**
   *
   */
  public clearEntries() {
    this.symbolMap.clear()
  }

  /**
   *
   */
  public get entries() {
    return Array.from(this.symbolMap.entries())
  }
}
