import Parser from './core/Parser.js'
import Code from './core/Code.js'
import SymbolTable from './core/SymbolTable.js'
import defaultAssembly from './default-assembly.js'

type SymbolMapEntry = [string, number]

export default class Main {
  private assembly = defaultAssembly
  private parser = new Parser(this.assembly)
  private code = new Code()
  private symbolTable = new SymbolTable()
  private variableAddress = 16

  private sourcePane =
    document.querySelector<HTMLTextAreaElement>('#js-source')!
  private destinationPane =
    document.querySelector<HTMLTextAreaElement>('#js-destination')!
  private downloadButton = document.querySelector<HTMLAnchorElement>(
    '#js-download-button',
  )!
  private uploadButton =
    document.querySelector<HTMLInputElement>('#js-upload-button')!

  /**
   *
   */
  public constructor() {
    this.sourcePane.value = this.assembly
    this.onSourceUpdate = this.onSourceUpdate.bind(this)
    this.onDownloadClick = this.onDownloadClick.bind(this)
    this.onUploadClick = this.onUploadClick.bind(this)
    this.sourcePane.addEventListener('change', this.onSourceUpdate)
    this.downloadButton.addEventListener('click', this.onDownloadClick)
    this.uploadButton.addEventListener('change', this.onUploadClick)
    this.sourcePane.dispatchEvent(new Event('change'))
  }

  /**
   * Kill app
   */
  public dispose() {
    this.sourcePane.removeEventListener('change', this.onSourceUpdate)
    this.downloadButton.removeEventListener('click', this.onDownloadClick)
    this.uploadButton.removeEventListener('change', this.onUploadClick)
  }

  /**
   * Convert macro commands to mnemonics
   */
  private convertMacro2mnemonics(assembly: string) {
    const translatedCommands: string[] = []
    const getAssembly = () => {
      if (this.parser.commandType === Parser.GOTO_COMMAND) {
        translatedCommands.push(...[this.parser.symbol!, '0;JMP'])
      } else {
        translatedCommands.push(this.parser.command)
      }
    }
    //
    while (this.parser.hasMoreCommands) {
      getAssembly()
      this.parser.advance()
    }
    getAssembly()
    return translatedCommands.join('\n')
  }

  /**
   *
   * @param parser
   */
  private resetSymbolTable() {
    this.symbolTable.clearEntries()

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
      .forEach(([symbol, address]) =>
        this.symbolTable.addEntry(symbol, address),
      )

    // add runtime symbols
    let index = 0
    const parseLine = () => {
      switch (this.parser.commandType) {
        case Parser.A_COMMAND:
        case Parser.C_COMMAND:
          ++index
          break
        case Parser.L_COMMAND:
          if (this.parser.symbol)
            this.symbolTable.addEntry(this.parser.symbol, index)
      }
    }
    //
    while (this.parser.hasMoreCommands) {
      parseLine()
      this.parser.advance()
    }
    parseLine()
  }

  /**
   *
   * @param decimal
   * @param minLength
   * @returns
   */
  private decimal2Binary(decimal: number, minLength = 15) {
    return decimal.toString(2).padStart(minLength, '0')
  }

  /**
   *
   * @returns
   */
  private getBinary(symbolTable: SymbolTable) {
    switch (this.parser.commandType) {
      case Parser.A_COMMAND:
        const { symbol } = this.parser
        if (symbol) {
          let address
          const isNumber = /\d/.test(symbol)
          if (isNumber) {
            address = symbol
          } else {
            const hasSymbol = symbolTable.contains(symbol)
            if (!hasSymbol) symbolTable.addEntry(symbol, this.variableAddress++)
            const labelAddress = symbolTable.getAddress(symbol)
            if (labelAddress) address = labelAddress.toString()
          }
          if (address) return `0${this.decimal2Binary(Number(address))}`
        }
        throw new Error(
          `We cannot resolve the symbol for ${this.parser.symbol}`,
        )
      case Parser.C_COMMAND:
        return [
          '111',
          this.code.comp(this.parser.comp),
          this.code.dest(this.parser.dest),
          this.code.jump(this.parser.jump),
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
  private createBinaryCommands() {
    const errors: string[] = []
    const commands: string[] = []
    const parseLine = () => {
      try {
        commands.push(this.getBinary(this.symbolTable))
      } catch (error: any) {
        errors.push(error.message)
      }
    }
    //
    while (this.parser.hasMoreCommands) {
      parseLine()
      this.parser.advance()
    }
    parseLine()
    if (errors.length) {
      this.showErrors(errors)
      return []
    }
    return commands
  }

  /**
   *
   * @param errors
   */
  private showErrors(errors: string[]) {
    const OPEN_MODIFIER = 'hk-alert--show'
    const errorPanel = document.querySelector('#js-alert')
    const errorList = document.querySelector('#js-alert-list')
    const closeButton = document.querySelector('#js-close-alert-button')
    if (errorList) {
      errorList.innerHTML = errors
        .map(message => `<div>${message}</div>`)
        .join('')
    }
    errorPanel?.classList.add(OPEN_MODIFIER)
    closeButton?.addEventListener(
      'click',
      () => errorPanel?.classList.remove(OPEN_MODIFIER),
      { once: true },
    )
  }

  /**
   *
   * @param event
   */
  private onSourceUpdate(event: Event) {
    this.assembly = (event.target as HTMLTextAreaElement).value

    if (this.assembly !== '') {
      // [1. First pass] Convert macro commands to mnemonics.
      this.parser.setAssembly(this.convertMacro2mnemonics(this.assembly))

      // [2 Second pass] We will create a symbol table.
      this.resetSymbolTable()

      // [3. Third pass]
      // Here we generate the Hack machine language in binary representation
      // while resolving the addresses of the symbols in the following way.
      // - Assign addresses to the label symbols of the A-instruction using the symbol table
      // - Assign addresses to the variable symbols if the symbol table does not contain the symbol
      this.parser.reset()
      this.destinationPane.value = this.createBinaryCommands()
        .filter(command => command !== '')
        .join('\n')
    } else {
      this.destinationPane.value = ''
    }
  }

  /**
   *
   * @param event
   */
  private onDownloadClick(event: Event) {
    const blob = new Blob([this.destinationPane.value], { type: 'text/plain' })
    this.downloadButton.href = URL.createObjectURL(blob)
  }

  /**
   *
   * @param event
   */
  private onUploadClick(event: Event) {
    const files = this.uploadButton.files
    if (files) {
      const [file] = Array.from(files)
      const reader = new FileReader()
      const onFileLoad = (event: ProgressEvent) => {
        if (reader.result) {
          const downloadFileName = file.name.split('.')[0] + '.hack'
          this.downloadButton.setAttribute('download', downloadFileName)
          this.sourcePane.value = reader.result as string
          this.sourcePane.dispatchEvent(new Event('change'))
        }
      }
      reader.addEventListener('load', onFileLoad, { once: true })
      try {
        reader.readAsText(file)
      } catch (error) {
        alert('Oops, something wrong!')
      }
    }
  }
}
