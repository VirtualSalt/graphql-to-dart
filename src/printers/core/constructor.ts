import { FunctionPrinter, ClassMethod } from './function';
import { indentMultiline } from '@graphql-codegen/visitor-plugin-common';
type ClassConstructor = { assignments: { prop: string; value: string }[] };
export class ConstructorPrinter extends FunctionPrinter implements ClassConstructor {
    assignments: { prop: string; value: string }[];
    constructor(name: string, options: Partial<Omit<ClassMethod, 'name' | 'implType'>> & Partial<ClassConstructor>) {

        super(name, {
            ...options,
            implType: 'block'
        });
        this.assignments = options.assignments || [];
    }

    buildAssignments(): string {
        if (this.assignments.length === 0) return '';
        const assignments = this.assignments.map(a => `${a.prop} = ${a.value}`).join(',');
        return `: ${assignments}`;
    }
    printArgs(): string {
        if (this.getset === 'get') return '';
        const required = this.args.filter(a => a.isRequired).map(arg => arg.print(true)).join(', ');
        const optional = this.args.filter(a => !a.isRequired).map(arg => arg.print(true)).join(', ');
        return `(${required}${required && optional ? ', ' : ''}${optional.length > 0 ? `{${optional}}` : ''})`;
    }
    print(): string {


        var impl = {
            before: '{',
            after: '}'
        };

        this.assignments.map(a => `${a.prop} = ${a.value}`).join(',');

        const implementation = this.implementation ? ` ${impl.before}
            ${indentMultiline(this.implementation)}
            ${impl.after}` : ';';
        return `${this.buildPieces().join('')}${this.buildAssignments()}${implementation}`;
    }

}