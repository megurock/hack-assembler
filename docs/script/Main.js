import Parser from './core/Parser.js';
import Code from './core/Code.js';
import SymbolTable from './core/SymbolTable.js';
import defaultAssembly from './default-assembly.js';
export default class Main {
    assembly = defaultAssembly;
    parser = new Parser(this.assembly);
    code = new Code();
    symbolTable = new SymbolTable();
    variableAddress = 16;
    sourcePane = document.querySelector('#js-source');
    destinationPane = document.querySelector('#js-destination');
    downloadButton = document.querySelector('#js-download-button');
    uploadButton = document.querySelector('#js-upload-button');
    /**
     *
     */
    constructor() {
        this.sourcePane.value = this.assembly;
        this.onSourceUpdate = this.onSourceUpdate.bind(this);
        this.onDownloadClick = this.onDownloadClick.bind(this);
        this.onUploadClick = this.onUploadClick.bind(this);
        this.sourcePane.addEventListener('change', this.onSourceUpdate);
        this.downloadButton.addEventListener('click', this.onDownloadClick);
        this.uploadButton.addEventListener('change', this.onUploadClick);
        this.sourcePane.dispatchEvent(new Event('change'));
    }
    /**
     * Kill app
     */
    dispose() {
        this.sourcePane.removeEventListener('change', this.onSourceUpdate);
        this.downloadButton.removeEventListener('click', this.onDownloadClick);
        this.uploadButton.removeEventListener('change', this.onUploadClick);
    }
    /**
     *
     * @param parser
     */
    resetSymbolTable() {
        this.symbolTable.clearEntries();
        // add predefined symbols
        const predefinedSymbols = [
            ['SP', 0],
            ['LCL', 1],
            ['ARG', 2],
            ['THIS', 3],
            ['THAT', 4],
            ['SCREEN', 16384],
            ['KBD', 24576],
        ];
        const registerSymbols = [...Array(16)].map((_, i) => [
            `R${i}`,
            i,
        ]);
        predefinedSymbols
            .concat(registerSymbols)
            .forEach(([symbol, address]) => this.symbolTable.addEntry(symbol, address));
        // add runtime symbols
        let index = 0;
        const parseLine = () => {
            switch (this.parser.commandType) {
                case Parser.A_COMMAND:
                case Parser.C_COMMAND:
                    ++index;
                    break;
                case Parser.L_COMMAND:
                    if (this.parser.symbol)
                        this.symbolTable.addEntry(this.parser.symbol, index);
            }
        };
        //
        while (this.parser.hasMoreCommands) {
            parseLine();
            this.parser.advance();
        }
        parseLine();
    }
    /**
     *
     * @param decimal
     * @param minLength
     * @returns
     */
    decimal2Binary(decimal, minLength = 15) {
        let binary = decimal.toString(2);
        while (binary.length < minLength)
            binary = `0${binary}`;
        return binary;
    }
    /**
     *
     * @returns
     */
    getBinary(symbolTable) {
        switch (this.parser.commandType) {
            case Parser.A_COMMAND:
                const { symbol } = this.parser;
                if (symbol) {
                    let address;
                    const isNumber = /\d/.test(symbol);
                    if (isNumber) {
                        address = symbol;
                    }
                    else {
                        const hasSymbol = symbolTable.contains(symbol);
                        if (!hasSymbol)
                            symbolTable.addEntry(symbol, this.variableAddress++);
                        const labelAddress = symbolTable.getAddress(symbol);
                        if (labelAddress)
                            address = labelAddress.toString();
                    }
                    if (address)
                        return `0${this.decimal2Binary(Number(address))}`;
                }
                throw new Error(`We cannot resolve the symbol for ${this.parser.symbol}`);
            case Parser.C_COMMAND:
                return [
                    '111',
                    this.code.comp(this.parser.comp),
                    this.code.dest(this.parser.dest),
                    this.code.jump(this.parser.jump),
                ].join('');
            default:
                return '';
        }
    }
    /**
     *
     * @param parser
     * @param code
     * @returns
     */
    createBinaryCommands() {
        const errors = [];
        const commands = [];
        const parseLine = () => {
            try {
                commands.push(this.getBinary(this.symbolTable));
            }
            catch (error) {
                errors.push(error.message);
            }
        };
        //
        while (this.parser.hasMoreCommands) {
            parseLine();
            this.parser.advance();
        }
        parseLine();
        if (errors.length) {
            this.showErrors(errors);
            return [];
        }
        return commands;
    }
    /**
     *
     * @param errors
     */
    showErrors(errors) {
        const OPEN_MODIFIER = 'hk-alert--show';
        const errorPanel = document.querySelector('#js-alert');
        const errorList = document.querySelector('#js-alert-list');
        const closeButton = document.querySelector('#js-close-alert-button');
        if (errorList) {
            errorList.innerHTML = errors
                .map(message => `<div>${message}</div>`)
                .join('');
        }
        errorPanel?.classList.add(OPEN_MODIFIER);
        closeButton?.addEventListener('click', () => errorPanel?.classList.remove(OPEN_MODIFIER), { once: true });
    }
    /**
     *
     * @param event
     */
    onSourceUpdate(event) {
        this.assembly = event.target.value;
        this.parser.setAssembly(this.assembly);
        if (this.assembly !== '') {
            // [1 First pass] We will create a symbol table.
            this.resetSymbolTable();
            // [2 Second pass]
            // Here we generate the Hack machine language in binary representation
            // while resolving the addresses of the symbols in the following way.
            // - Assign addresses to the label symbols of the A-instruction using the symbol table
            // - Assign addresses to the variable symbols if the symbol table does not contain the symbol
            this.parser.reset();
            this.destinationPane.value = this.createBinaryCommands()
                .filter(command => command !== '')
                .join('\n');
        }
        else {
            this.destinationPane.value = '';
        }
    }
    /**
     *
     * @param event
     */
    onDownloadClick(event) {
        const blob = new Blob([this.destinationPane.value], { type: 'text/plain' });
        this.downloadButton.href = URL.createObjectURL(blob);
    }
    /**
     *
     * @param event
     */
    onUploadClick(event) {
        const files = this.uploadButton.files;
        if (files) {
            const [file] = Array.from(files);
            const reader = new FileReader();
            const onFileLoad = (event) => {
                if (reader.result) {
                    const downloadFileName = file.name.split('.')[0] + '.hack';
                    this.downloadButton.setAttribute('download', downloadFileName);
                    this.sourcePane.value = reader.result;
                    this.sourcePane.dispatchEvent(new Event('change'));
                }
            };
            reader.addEventListener('load', onFileLoad, { once: true });
            try {
                reader.readAsText(file);
            }
            catch (error) {
                alert('Oops, something wrong!');
            }
        }
    }
}
