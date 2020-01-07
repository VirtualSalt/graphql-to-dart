import { transformComment, indent, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';
const stripIndent = require('strip-indent');
import { ConstructorPrinter } from './constructor';
import { ClassMember, Kind, ClassMethod, Access, Implementation, MemberFlags, MemberPrinter, FunctionPrinter, Printer, } from './index';
import { copy } from '../helpers/utils';
type ClassFlags = 'abstract';

export class ClassPrinter extends Printer {

    _extendStr: string[] = [];
    _implementsStr: string[] = [];
    _kind: Kind = null;
    _access: Access = 'public';
    _flags: ClassFlags[] = []

    _block = null;
    _comment = null;
    _annotations: string[] = [];
    private _members: MemberPrinter[] = [];
    _methods: FunctionPrinter[] = [];

    constructor(private _name: string) {
        super();
    }
    get name(): string {
        return this._name;
    }
    get members(): MemberPrinter[] {
        return this._members;
    }



    access(access: Access): ClassPrinter {
        this._access = access;

        return this;
    }

    withFlag(flag: ClassFlags) {
        if (!this._flags.includes(flag)) this._flags.push(flag);
        return this;
    }

    asKind(kind: Kind): ClassPrinter {
        this._kind = kind;

        return this;
    }





    annotate(annotations: string[]): ClassPrinter {
        this._annotations = annotations;

        return this;
    }

    withComment(comment: string | StringValueNode | null): ClassPrinter {
        if (comment) {
            this._comment = transformComment(comment, 0);
        }

        return this;
    }

    withBlock(block: string): ClassPrinter {
        this._block = block;

        return this;
    }

    extends(extendStr: string[]): ClassPrinter {
        this._extendStr = extendStr;

        return this;
    }

    implements(implementsStr: string[]): ClassPrinter {
        this._implementsStr = implementsStr;

        return this;
    }



    printAccessPrefix(access: Access) {
        return access === 'private' || this._access === 'protected' ? '_' : ''
    }




    // addClassMember(name: string, type: string, value: string, typeAnnotations: string[] = [], access: Access = null, flags: MemberFlags = {}): DartDeclarationBlock {

    addClassMember(member: MemberPrinter): ClassPrinter {
        this._members.push(member);

        return this;
    }
    // args: Partial<ClassMember>[] = [], returnTypeAnnotations: string[] = [], access: Access = null, flags: MemberFlags = {}, methodAnnotations: string[] = []
    addClassMethod(method: FunctionPrinter): ClassPrinter {
        this._methods.push(method);
        return this;
    }

    buildPieces(): string[] {
        const annotations = this._annotations.map(a => `@${a}\n`);

        const pieces = [
            ...annotations,
            this._flags.length ? this._flags.join(' ') : null,
            'class',
            this.printAccessPrefix(this._access) + this.name,
            this._extendStr.length > 0 ? `extends ${this._extendStr.join(', ')}` : null,
            this._implementsStr.length > 0 ? `implements ${this._implementsStr.join(', ')}` : null
        ].filter(f => f);
        return pieces;
    }

    buildBody() {
        const addMethods: FunctionPrinter[] = [];
        const requiredInputs = this.members.filter(x => !x.value || (x.includeInConstructor && !x.isRequired)).map(m => {
            var clone: MemberPrinter = copy(m).withType('');
            if (!clone.name.startsWith('this.')) clone.withName(`this.${clone.name}`);

            return clone;
        });
        if (requiredInputs.length && !this._flags.includes('abstract'))
            addMethods.push(new ConstructorPrinter(`${this.name}`, {
                args: requiredInputs,
            }));

        const methods = [...this._methods, ...addMethods];

        const members = this._members.length ? indentMultiline(stripIndent(this._members.map(member => member.print() + ';').join('\n'))) : null;
        const methodsString = methods.length ? indentMultiline(stripIndent(methods.map(method => method.print()).join('\n\n'))) : null;
        return [
            members,
            methodsString,
        ]
    }




    print(): string {
        let result = this.buildPieces().join(' ');


        const before = ' {';
        const after = '}';
        const block = [before,
            ...this.buildBody(),
            this._block, after].filter(f => f).join('\n');
        result += block;

        return (this._comment ? this._comment : '') + result + '\n';
    }
}