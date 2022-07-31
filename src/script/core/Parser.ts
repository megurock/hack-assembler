export default class Parser {
  public static readonly A_COMMAND = 'A_COMMAND'
  public static readonly C_COMMAND = 'C_COMMAND'
  public static readonly L_COMMAND = 'L_COMMAND'
  public static readonly BLANK_LINE = 'BLANK_LINE'
  protected lines: string[] = []
  protected head = 0

  /**
   *
   * @param assembly
   */
  public constructor(assembly: string) {
    this.setAssembly(assembly)
  }

  /**
   *
   * @param value
   */
  public setAssembly(value: string) {
    const breakCode = '\n'
    this.lines = value.replace(/\r?\n/g, breakCode).split(breakCode)
    this.head = 0
  }

  /**
   *
   */
  public get command() {
    // remove whitespace and comment
    return this.lines[this.head].replace(/\s/g, '').replace(/\/\/.*/, '')
  }

  /**
   *
   */
  public advance() {
    this.head++
  }

  /**
   *
   */
  public get hasMoreCommands() {
    return this.head < this.lines.length - 1
  }

  /**
   *
   */
  public get commandType() {
    if (this.command === '') return Parser.BLANK_LINE
    else if (this.command.startsWith('@')) return Parser.A_COMMAND
    else if (/^\(.+\)$/.test(this.command)) return Parser.L_COMMAND
    else return Parser.C_COMMAND
  }

  /**
   *
   */
  public get symbol() {
    switch (this.commandType) {
      case Parser.A_COMMAND:
        return this.command.slice(1)
      case Parser.L_COMMAND:
        return this.command.replace(/\((.+)\)/, '$1')
      default:
        return null
    }
  }

  /**
   *
   */
  public get dest() {
    if (this.commandType === Parser.C_COMMAND) {
      if (this.hasDest()) return this.command.split('=')[0]
    }
    return null
  }

  /**
   *
   */
  public get jump() {
    if (this.commandType === Parser.C_COMMAND) {
      if (this.hasJump()) return this.command.split(';')[1]
    }
    return null
  }

  /**
   *
   */
  public get comp() {
    if (this.commandType === Parser.C_COMMAND) {
      let comp = this.command
      if (this.hasDest()) comp = comp.split('=')[1]
      if (this.hasJump()) comp = comp.split(';')[0]
      return comp
    }
    return null
  }

  /**
   *
   */
  public reset() {
    this.head = 0
  }

  /**
   *
   */
  protected hasDest() {
    return /=/.test(this.command)
  }

  /**
   *
   */
  protected hasJump() {
    return /;/.test(this.command)
  }
}
