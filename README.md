# Wool Server

**This project is very early pre-alpha, not everything described here exists, and much of it will not work as expected.**

Wool Server is a collection of packages for creating servers with [wool](https://github.com/woolts/wool).

## Getting Started

## Philosophy

Wool Server is a functional library for creating views on to a server, in a style similar to [Wool Browser](https://github.com/woolts/wool) for websites.

It comprises two packages: [program](#wool-server--program) and [router](#wool-server--router).

## Wool Server / Program

```ts
import { sandbox } from 'wool-server/program';

const router = () => route('/', () => [], () => 'Hello!'); // See router

sandbox({ router })(8080);
```

```ts
import { sessionProgram } from 'wool-server/program';

const init = () => 0;
const router = model => route('/', () => [], () => 'Hello!'); // See router
const update = (model, msg) => model;

sessionProgram({ init, router, update })(8080);
```

## Wool Server / Router

A 'view' onto your server.

```ts
import { group, plain, route, status, type } from 'wool-server/router';
import { route as static } from 'wool-browser/static';
import { div, text } from 'wool-browser/html';

export default group(
  '/',
  [],
  [
    route('/', () => [status(200), type('text/plain')], () => 'Home']),
    plain('plain', () => 'A plain text page'),
    route('html',
      () => [status(200), type('text/html')],
      () => '<html><body><div>A hand-written HTML page</div></body></html>',
    ),
    static('static', () => [], () => div([], text`A statically rendered page`)),
    group('nested', [], [route('child', () => [[], 'A nested page'])]),
  ],
);
```
