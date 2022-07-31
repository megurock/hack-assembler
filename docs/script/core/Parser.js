export default class Parser {
    static A_COMMAND = 'A_COMMAND';
    static C_COMMAND = 'C_COMMAND';
    static L_COMMAND = 'L_COMMAND';
    static BLANK_LINE = 'BLANK_LINE';
    lines = [];
    head = 0;
    /**
     *
     * @param assembly
     */
    constructor(assembly) {
        this.setAssembly(assembly);
    }
    /**
     *
     * @param value
     */
    setAssembly(value) {
        const breakCode = '\n';
        this.lines = value.replace(/\r?\n/g, breakCode).split(breakCode);
        this.head = 0;
    }
    /**
     *
     */
    get command() {
        // remove whitespace and comment
        return this.lines[this.head].replace(/\s/g, '').replace(/\/\/.*/, '');
    }
    /**
     *
     */
    advance() {
        this.head++;
    }
    /**
     *
     */
    get hasMoreCommands() {
        return this.head < this.lines.length - 1;
    }
    /**
     *
     */
    get commandType() {
        if (this.command === '')
            return Parser.BLANK_LINE;
        else if (this.command.startsWith('@'))
            return Parser.A_COMMAND;
        else if (/^\(.+\)$/.test(this.command))
            return Parser.L_COMMAND;
        else
            return Parser.C_COMMAND;
    }
    /**
     *
     */
    get symbol() {
        switch (this.commandType) {
            case Parser.A_COMMAND:
                return this.command.slice(1);
            case Parser.L_COMMAND:
                return this.command.replace(/\((.+)\)/, '$1');
            default:
                return null;
        }
    }
    /**
     *
     */
    get dest() {
        if (this.commandType === Parser.C_COMMAND) {
            if (this.hasDest())
                return this.command.split('=')[0];
        }
        return null;
    }
    /**
     *
     */
    get jump() {
        if (this.commandType === Parser.C_COMMAND) {
            if (this.hasJump())
                return this.command.split(';')[1];
        }
        return null;
    }
    /**
     *
     */
    get comp() {
        if (this.commandType === Parser.C_COMMAND) {
            let comp = this.command;
            if (this.hasDest())
                comp = comp.split('=')[1];
            if (this.hasJump())
                comp = comp.split(';')[0];
            return comp;
        }
        return null;
    }
    /**
     *
     */
    reset() {
        this.head = 0;
    }
    /**
     *
     */
    hasDest() {
        return /=/.test(this.command);
    }
    /**
     *
     */
    hasJump() {
        return /;/.test(this.command);
    }
}
