import { dartDirective, concat } from '../helpers/utils';
import expectedGeneratedFileFor from '../helpers/expected-generated-file-for';
import { Scalars, DartConfig } from '../build-plugin';
import { ClassPrinter, MemberPrinter } from '../printers/core';
import { pascalCase } from 'pascal-case';
import { FlattenDocument, } from 'graphql-codegen-plugin-helpers/dist/flatten-types';
import {
    SchemaTemplateContext
} from "graphql-codegen-core";
export type BuilderContext = {
    config: DartConfig;
    scalars: Scalars &
    Partial<Scalars> & {
        [type: string]: string;
    };
    primitives: Scalars &
    Partial<Scalars> & {
        [type: string]: string;
    };
    outputFile: string;
}
    & FlattenDocument
    & Omit<SchemaTemplateContext, 'scalars'>;

function buildOperations(ctx: BuilderContext) {
    if (!ctx.hasOperations) return '';
    return ctx.operations.map(operation => {
        const varClass = new ClassPrinter(pascalCase(operation.name) + 'Variables');
        for (let v of operation.variables) {

            varClass.addClassMember(
                new MemberPrinter(v.name, { annotations: [] })
            )
        }
        return [

        ].join('')
    }).join('\n');
}

export function buildDocument(ctx: BuilderContext) {
    const template =
        `
${dartDirective('import', ctx.config.documents.imports)}
${dartDirective('export', ctx.config.documents.exports)}
${dartDirective('part', ctx.config.documents.parts)}

part '${ctx.outputFile}';
`;
}