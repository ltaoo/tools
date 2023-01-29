import { JSONSchema, JSONSchemaTypes } from "@/utils/typescript";

export function enumPluginFactory(regexp: RegExp) {
  const plugin = {
    value(v: JSONSchema) {
      const { description } = v;
      if (!description || !regexp.test(description)) {
        return v;
      }
      const r: (number | string)[] = [];
      let d = description;
      while (d) {
        const result = d.match(regexp);
        if (!result) {
          break;
        }
        d = d.slice((result.index || 0) + result[0].length);
        const v = result[1];
        r.push(/[0-9]{1,}/.test(v) ? Number(v) : v);
      }
      const node = {
        type: JSONSchemaTypes.Enum,
        enum: r,
        description,
      } as JSONSchema;
      return node;
    },
  };
  return plugin;
}

// enum Status {

// };
