export class TRPCError extends Error {
  code: string;
  constructor(opts: { code: string; message?: string }) {
    super(opts.message ?? opts.code);
    this.code = opts.code;
  }
}

type MiddlewareFn = (opts: { ctx: any; next: (opts?: { ctx?: any }) => any }) => any;

type Procedure = {
  use: (mw: MiddlewareFn) => Procedure;
  input: (_schema: any) => Procedure;
  mutation: (resolver: any) => any;
  query: (resolver: any) => any;
};

function createProcedure(): Procedure {
  const chain: Procedure = {
    use: () => chain,
    input: () => chain,
    mutation: (resolver) => resolver,
    query: (resolver) => resolver,
  };
  return chain;
}

function createBuilder() {
  const procedure = createProcedure();
  const middleware = (fn: MiddlewareFn) => fn;
  const router = (shape: Record<string, any>) => shape;
  const mergeRouters = (...routers: any[]) => Object.assign({}, ...routers);

  return { middleware, router, mergeRouters, procedure };
}

export const initTRPC = {
  context: <TContext>() => ({
    create: () => createBuilder(),
  }),
};
