import { transformComment, indent, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';
const stripIndent = require('strip-indent');

import { ClassMember, Kind, ClassMethod, Access, Implementation, MemberFlags, MemberPrinter, FunctionPrinter, Printer, } from './index';

export class EnumPrinter extends Printer {


    constructor(private _name: string, private _members: string[]) {
        super();
    }

    print() {
        let result: string = `enum ${this._name} {\n`;
        result += indentMultiline(this._members.join(',\n'))
        return result += '\n}';
    }
}