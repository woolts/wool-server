import * as path from 'path';

// -- Types

type Opaque<K, T> = T & { __TYPE__: K };

interface Route {
  url: string;
  createAttrs: (params?: any) => Array<Attribute>;
  createBody: (params?: any) => Body;
}

interface CompiledRoute {
  url: string;
  responder: (req: any, res: any) => void;
}

type Body = String;
type Attribute = Status | Header;

type Header = Opaque<'header', { name: HeaderName; value: string }>;
type HeaderName = 'Content-Type';

type ContentType = 'text' | 'html';

type Status = Opaque<'status', { code: StatusCode }>;
type StatusCode = 'ok' | 'notFound';

// -- Attributes

export const header = (name: HeaderName, value: string): Header =>
  ({
    name,
    value,
  } as Header);

export const status = (code: StatusCode): Status => ({ code } as Status);
export const type = (type: ContentType) => header('Content-Type', type);

// -- Routers

export function route(
  url: string,
  createAttrs: (params?: any) => Array<Attribute>,
  createBody: (params?: any) => Body,
): Route {
  return {
    url,
    createAttrs,
    createBody,
  };
}

export function group(
  url: string,
  createAttrs: (params?: any) => Array<Attribute>,
  routes: Array<Route | Array<Route>>,
): Array<Route> {
  return routes.reduce(
    (acc, child) => groupHelper(url, createAttrs, acc, child),
    [],
  );
}

function groupHelper(url, createAttrs, acc: any, child: Route | Array<Route>) {
  if (Array.isArray(child)) {
    return acc.concat(...child.map(c => groupHelper(url, createAttrs, [], c)));
  }
  return acc.concat(
    route(
      path.join(url, (<Route>child).url),
      (params: any) => createAttrs(params).concat(child.createAttrs(params)),
      child.createBody,
    ),
  );
}

function withAttrs(attrs: Array<Attribute>) {
  return (url, createBody) => route(url, () => attrs, createBody);
}

export const plain = withAttrs([type('text')]);

// --- Resolver

export function compile(routes: Array<Route>): Array<CompiledRoute> {
  return flatten(routes).map(r => ({
    url: r.url,
    responder: createResponder(r),
  }));
}

function createResponder(r: Route) {
  return (req, res) => {
    const attrs = r.createAttrs(req.params);
    attrs.forEach(attr => {
      if ((<Status>attr).code) {
        res.statusCode = 200;
      } else {
        res.setHeader((<Header>attr).name, (<Header>attr).value);
      }
    });

    const body = r.createBody(req.params);
    const responseBody = { headers: {}, method: 'GET', url: r.url, body };

    res.write(JSON.stringify(responseBody));
  };
}

// TODO: import lodash?
function flatten(xs) {
  return xs.reduce((acc, x) => {
    if (Array.isArray(x)) {
      return acc.concat(flatten(x));
    }
    return acc.concat(x);
  }, []);
}

export function resolve(
  routes: Array<CompiledRoute>,
  req,
): CompiledRoute | void {
  let found;
  routes.forEach(r => {
    if (r.url === req.url) {
      found = r;
      return;
    }
  });
  return found;
}
