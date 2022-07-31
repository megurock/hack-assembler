export default class SymbolTable {
    symbolMap;
    /**
     *
     * @param symbolMap
     */
    constructor() {
        this.symbolMap = new Map();
    }
    /**
     *
     * @param symbol
     * @param address in decimal expression
     */
    addEntry(symbol, address) {
        this.symbolMap.set(symbol, address);
    }
    /**
     *
     * @param symbol
     * @returns true if the symbol exists in the symbol map.
     */
    contains(symbol) {
        return this.symbolMap.has(symbol);
    }
    /**
     *
     * @param symbol
     * @returns the address bind to the symbol in decimal expression.
     */
    getAddress(symbol) {
        return this.symbolMap.get(symbol);
    }
    /**
     *
     * @param symbol
     */
    deleteEntry(symbol) {
        this.symbolMap.delete(symbol);
    }
    /**
     *
     */
    clearEntries() {
        this.symbolMap.clear();
    }
    /**
     *
     */
    get entries() {
        return Array.from(this.symbolMap.entries());
    }
}
