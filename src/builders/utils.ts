import { SelectionSetFieldNode } from 'graphql-codegen-core';
import { ClassPrinter, FunctionPrinter, MemberPrinter } from '../printers/core';
import { AnnotationPrinter } from '../printers/core/annotation';
import { ResolveType } from '../helpers/resolve-type';
import { FlattenModel } from 'graphql-codegen-plugin-helpers/dist/flatten-types';

export function addSelectionSet(cls: ClassPrinter, fields: SelectionSetFieldNode[], resolveType: ResolveType, innerModels: FlattenModel[]) {
    fields.forEach(field => {

        const get = new FunctionPrinter(field.name, {
            implementation: `fields.${field.schemaFieldName}`,
            implType: 'inline',
            annotations: [new AnnotationPrinter('JsonKey', {
                name: `r'${field.name}'`,
                required: field.isRequired.toString(),
                disallowNullValue: field.isRequired.toString()
            })]
        }).get();
        // TODO: set is conditional? mixin Home on Human  ==> planet example
        const set = new FunctionPrinter(field.name, {
            implementation: `fields.${field.schemaFieldName} = ${field.name}`,
            implType: 'inline',
            args: [new MemberPrinter(field.name).withType(
                resolveType(field, innerModels)
            ).required()]
        }).set();

        cls.addClassMethod(get);
        cls.addClassMethod(set);
    });
}