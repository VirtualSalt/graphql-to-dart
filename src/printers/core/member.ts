
import { Printer, Access, MemberFlags } from '.';
import {
    camelCase,
} from "../../helpers/utils";
export type ClassMember = { value: string; name: string; access: Access; type: string; annotations: string[]; flags: MemberFlags };
export type jsonCofig = 'from_class' | 'custom_parse' | 'normal';
export interface MemberJsonItem {
    config: {
        type: 'class';
        class: string
    } | { customParsingType: string; type: 'custom'; } | { type: 'normal' }
    name: string;
    isList?: boolean;

}
export class MemberPrinter extends Printer {
    private _value: string;

    private access: Access;

    private annotations: string[];
    private flags: MemberFlags;
    private type: string;
    private _required = false;
    private _forConstructor = false;
    private _includeInConstructor = false;
    private _tojson: MemberJsonItem;

    constructor(private _name: string, other: Partial<Omit<ClassMember, 'name'>> = {}) {

        super();
        this._name = camelCase(_name);
        this.annotations = other.annotations && other.annotations.filter(v => v) || [];
        this.type = other.type;
        this.flags = {
            static: false,
            final: false,
            ...(other.flags || {})
        };
        this.access = other.access || 'public';
        this._value = other.value;
    }

    get name(): string {
        return this._name;
    }

    get isRequired(): boolean {
        return !!this.flags['final'];
    }

    get value(): string {
        return this._value;
    }
    get includeInConstructor(): boolean {
        return this._includeInConstructor = true;
    }
    get json(): MemberJsonItem {
        return this._tojson;
    }
    withName(name: string) {
        this._name = name;
        return this;
    }

    withFlag(flag: Exclude<keyof MemberFlags, 'final'>): MemberPrinter {
        this.flags[flag] = true;
        return this;
    }

    withType(type: string): MemberPrinter {

        this.type = type;

        return this;
    }

    required() {
        this.flags['final'] = true;
        return this;
    }

    allowJson(config: Omit<MemberJsonItem, 'name'> & { name?: string }) {

        this._tojson = {
            ...config,
            name: config.name || this.name
        };
        return this;
    }


    withValue(value: string) {

        this._value = value;
        return this;
    }
    allowInput() {
        this._includeInConstructor = true;
        return this;
    }


    print(forConstructor = false): string {



        const conditional = forConstructor ? [] : [
            this.flags.static ? 'static' : null,
            this.flags.final ? 'final' : null,
            this.type,
        ];



        const pieces = [
            // member.access,
            ...(this.annotations || []).map(annotation => `@${annotation}`),
            ...conditional,



            this.printAccessPrefix(this.access) + this.name,
        ].filter(f => f);

        return pieces.join(' ') + (this._value ? ` = ${this._value}` : '');
    }
}




