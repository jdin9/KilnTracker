class BaseSchema<T = any> {
  optional() {
    return this;
  }
  nullable() {
    return this;
  }
  min(_value: number) {
    return this;
  }
  max(_value: number) {
    return this;
  }
  nonempty() {
    return this;
  }
  array() {
    return new ArraySchema(this);
  }
  superRefine(cb: (val: any, ctx: any) => void) {
    cb as unknown as void;
    return this;
  }
  default(_value: any) {
    return this;
  }
  parse(input: any): T {
    return input as T;
  }
}

class StringSchema extends BaseSchema<string> {}
class NumberSchema extends BaseSchema<number> {
  int() {
    return this;
  }
  nonnegative() {
    return this;
  }
}
class BooleanSchema extends BaseSchema<boolean> {}
class DateSchema extends BaseSchema<Date> {}

class EnumSchema<T extends readonly [string, ...string[]]> extends BaseSchema<T[number]> {
  values: T;
  constructor(values: T) {
    super();
    this.values = values;
  }
}

type InferSchema<T> = any;

class ObjectSchema<TShape extends Record<string, any>> extends BaseSchema<{ [K in keyof TShape]: InferSchema<TShape[K]> }> {
  shape: TShape;
  constructor(shape: TShape) {
    super();
    this.shape = shape;
  }
  partial() {
    return this;
  }
}

class ArraySchema<TSchema extends BaseSchema<any>> extends BaseSchema<InferSchema<TSchema>[]> {
  constructor(private inner: TSchema) {
    super();
  }
}
type Infer<T> = T extends BaseSchema<infer U> ? U : never;

const base = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  date: () => new DateSchema(),
  enum: <T extends readonly [string, ...string[]]>(values: T) => new EnumSchema(values),
  nativeEnum: (_values: any) => new BaseSchema<any>(),
  object: <T extends Record<string, any>>(shape: T) => new ObjectSchema(shape),
  coerce: {
    date: () => new DateSchema(),
  },
};

export const z = base as typeof base & { infer: unknown };

export namespace z {
  export type infer<T> = Infer<T>;
}
