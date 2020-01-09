
import { FlattenDocument, FlattenFragment } from 'graphql-codegen-plugin-helpers/dist/flatten-types';

import { ClassPrinter, MemberPrinter, FunctionPrinter } from '../printers/core';
import { pascalCase } from 'pascal-case';
import configureHelpers, { Config as HelperConfig } from "../helpers";
import configureClassExtends from '../helpers/class-extends';
import { BuilderContext } from './document';
import fragmentClassNames from "../helpers/fragment-class-names";
import { dedupe } from '../helpers/utils';
import { getFields } from '../helpers/hack-fragment-fields';
import { SelectionSetFieldNode } from 'graphql-codegen-core';
import { AnnotationPrinter } from '../printers/core/annotation';
import { pascalCase as toPascalCase } from 'pascal-case';
import { addSelectionSet } from './utils';
/*

*/
// TODO: resolvetype
export function buildFragment(context: BuilderContext, fragment: FlattenFragment) {

    const helpers = configureHelpers(context.rawSchema, context.config);
    const mixins = helpers.resolveMixins(fragment.fields);

    const fields: SelectionSetFieldNode[] = dedupe(
        fragment.fragmentsSpread.reduce(
            (fragFields, frag) => [...fragFields, ...getFields(frag.fragmentName)],
            fragment.fields
        )
    );



    const className = pascalCase(fragment.name);


    const fragMixin = new ClassPrinter(className)
        .isMixin(fragment.onType)
        .with(mixins)
        .implements(fragmentClassNames(fragment.fragmentsSpread))
        .addClassMember(
            new MemberPrinter('typeName')
                .withFlag('static')
                .required()
                .withType('String')
                .withValue(`'${fragment.onType}'`)
        );

    addSelectionSet(fragMixin, fields, helpers.resolveTypeV2, fragment.innerModels);

    fragMixin.addClassMethod(new FunctionPrinter(`from`, {
        flags: { static: true },
        implType: 'inline',
        implementation: `${className}SelectionSet.from(other)`,
        args: [new MemberPrinter('other')
            .withType(toPascalCase(fragment.onType))
            .required()]
    }).withType(`${className}SelectionSet`))

    fragMixin.addClassMethod(new FunctionPrinter(`fromJson`, {
        flags: { static: true },
        implType: 'inline',
        implementation: `${className}SelectionSet.fromJson(json)`,
        args: [new MemberPrinter('json')
            .withType('Map<String, dynamic>')
            .required()]
    }).withType(`${className}SelectionSet`))

    // TODO: cover scenerio for selection field else

    console.log('\n\n\n\n\n\n\n')


    console.log(fragMixin.print());
    return fragMixin.print();
}