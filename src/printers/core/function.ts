import { Printer, Access, MemberFlags, Implementation } from '.';
import { indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { MemberPrinter } from './member';
import { AnnotationPrinter } from './annotation';
export type ClassMethod = { annotations: AnnotationPrinter[]; args: MemberPrinter[]; implementation: string; name: string; access: Access; returnType: string | null; returnTypeAnnotations: string[]; flags: MemberFlags; implType: Implementation };
export class FunctionPrinter extends Printer implements ClassMethod {
    readonly annotations: AnnotationPrinter[];
    readonly args: MemberPrinter[];
    readonly implementation: string;

    readonly access: Access;
    private _returnType: string | null;
    readonly returnTypeAnnotations: string[];
    readonly flags: MemberFlags;
    readonly implType: Implementation;
    private _getset: 'get' | 'none' | 'set' = 'none';
    get getset() {
        return this._getset;
    }

    get returnType() {
        return this._returnType;
    }




    constructor(public readonly name: string, options: Partial<Omit<ClassMethod, 'name'>>) {
        super();

        this.args = options.args || [];
        this.returnTypeAnnotations = options.returnTypeAnnotations || [];
        this.access = options.access || null;
        this.flags = options.flags || {};
        this.annotations = options.annotations || [];
        this.implType = options.implType || 'block';
        this.implementation = options.implementation;
        this._returnType = options.returnType;
        this.flags = {
            static: false,
            final: false,
            ...(options.flags || {})
        };
    }

    get() {
        this._getset = 'get';
        return this;
    }
    set() {
        this._getset = 'set';
        return this;
    }

    // set() {
    //     this._getset = 'set';
    // }

    withType(type: string) {
        this._returnType = type;
        return this;
    }

    buildPieces(): string[] {
        const pieces = [
            ...this.annotations.map(a => `${a.print()}\n`),

            this.flags.static ? 'static ' : null,
            this.flags.final ? 'final ' : null,
            ...(this.returnTypeAnnotations || []).map(annotation => `@${annotation}\n`),
            this.returnType ? this.returnType + ' ' : null,
            this._getset === 'none' ? null : `${this._getset} `,
            this.printAccessPrefix(this.access) + this.name,
            this.printArgs()
        ].filter(f => f);
        return pieces;
    }

    printArgs(): string {
        if (this._getset === 'get') return '';
        const required = this.args.filter(a => a.isRequired).map(arg => arg.print()).join(', ');
        const optional = this.args.filter(a => !a.isRequired).map(arg => arg.print()).join(', ');
        return `(${required}${required && optional ? ', ' : ''}${optional.length > 0 ? `{${optional}}` : ''})`;
    }

    print(): string {



        var impl = {
            before: '{',
            after: '}'
        };

        switch (this.implType) {
            case 'inline':
                impl.before = '=> ';
                impl.after = ';';
                break;
        }

        // (this.implType === 'inline' ? this.implementation : indentMultiline(this.implementation)) +
        //     impl.after

        const implementation = this.implementation ? ' ' + impl.before + (this.implType === 'inline' ? this.implementation : indentMultiline(this.implementation)) + impl.after

            : ';';
        return `${this.buildPieces().join('')}${implementation}`;
    }
}