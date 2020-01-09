import { transformComment, indent, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { StringValueNode, NameNode } from 'graphql';


import { ClassMember, Kind, ClassMethod, Access, Implementation, MemberFlags, MemberPrinter, FunctionPrinter, Printer, } from './index';
interface AnnotationPropertyMap {
    [k: string]: string;
}
export class AnnotationPrinter extends Printer {


    constructor(private _name: string, private _properties: AnnotationPropertyMap = {}) {
        super();
    }
    addProperty(name: string, value: string) {
        this._properties[name] = value;
        return this;
    }



    print() {
        return `@${this._name}(${Object.keys(this._properties).map(n => `${n}: ${this._properties[n]}`).join(', ')})`
    }
}