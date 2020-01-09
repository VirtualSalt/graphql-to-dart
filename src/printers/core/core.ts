export type Access = 'private' | 'public' | 'protected';
export type Kind = 'class' | 'interface' | 'enum';
export type Implementation = 'block' | 'inline';
export type MemberFlags = { final?: boolean; static?: boolean };
export abstract class Printer {
    abstract print();
    printAccessPrefix(access: Access) {
        return access === 'private' || access === 'protected' ? '_' : '';
    }
}