
import { pascalCase as toPascalCase } from 'pascal-case';
import fragmentClassNames from "./fragment-class-names";
import { dedupe } from "./utils";

export interface MixinConfig {
  /**
   * Adds `with {{name}}` blocks to selection sets/fragments with the given fields,
   * or all selection sets/fragments if `when` is not configured
   *
   * @example { mixins: [{ name: "Entity", fields: [ "id" ] }
   */
  mixins?: Array<{
    /**
     * The name of the mixin class
     */
    name: string;
    /**
     * Condition by which to mixin
     */
    when?: {
      fields: Array<string>;
    };
  }>;
}

// flilter configured mixins based on "when" fields
export const configureResolveMixins = ({ mixins = [] }: MixinConfig & object) =>
  function resolveMixins(fields = []) {
    let fieldNames = fields.map(f => f.name);
    return dedupe(
      mixins
        .filter(({ when = { fields: [] } }) => {
          for (let requiredField of when.fields) {
            if (!fieldNames.includes(requiredField)) {
              return false;
            }
          }
          return true;
        })
        .map(mixin => mixin.name)
    );
  };

const builtinInterfaces = [
  /*"ToJson"*/
];

// apply whatever inheritence keyword
function inherit(inheritanceKeyword, ..._parents) {
  const parents = _parents.filter(p => p);
  if (parents.length == 0) {
    return "";
  }
  return `${inheritanceKeyword} ${parents.map(s => toPascalCase(s)).join(", ")} `;
}

// we extend from interfaces in dart to allow functionality
// piggybacking via replaceTypes
// TODO base type / entity modeling
//   should be done via postgraphile plugin
//   right now we replace Node with Entity, which is hacky
//   ex. Query becomes an "Entity"
export default function configureClassExtends({ mixins }) {
  function classExtends({
    hash: {
      onMixin = false,
      baseType,
      mixins = [],
      fragments = [],
      interfaces = []
    }
  }) {
    if (onMixin) {
      return (
        inherit("on", baseType) +
        inherit(",", ...mixins) +
        inherit(
          "implements",
          // we copy all fragment fields to fragments that spread
          // because dart has strange mixin inheritance
          ...fragmentClassNames(fragments),
          ...builtinInterfaces,
          ...interfaces
        )
      );
    }
    return (
      inherit("extends", baseType) +
      inherit("with", ...mixins, ...fragmentClassNames(fragments)) +
      inherit("implements", ...builtinInterfaces, ...interfaces)
    );
  }
  return classExtends;
}
