import * as http from 'http';
import { format as error } from 'wool/errors';
import { compile, resolve } from 'wool-server/router';

import { Program } from './types';

interface SandboxProgramOptions {
  router: Array<any>;
}

export default function sandbox({ router }: SandboxProgramOptions): Program {
  const compiledRoutes = compile(router);

  return (port: number) => {
    http
      .createServer((req, res) => {
        const { headers, method, url } = req;
        let chunks = [];

        req
          .on('error', err => {
            // TODO: do nice error
            console.error(err);
          })
          .on('data', chunk => {
            chunks.push(chunk);
          })
          .on('end', () => {
            const body = Buffer.concat(chunks).toString();

            res.on('error', err => {
              // TODO: do nice error
              console.error(err);
            });

            const route = resolveRoute(compiledRoutes, req);
            route(req, res);
            res.end();
          });
      })
      .listen(port);
    console.log(`Started server at http://localhost:${port}`);
  };
}

function resolveRoute(compiledRoutes, req) {
  const resolved = resolve(compiledRoutes, req);

  if (resolved) {
    return resolved.responder;
  }

  const err = [
    error.title('URL resolution error', req.url),
    error.message(`No url matched for '${req.url}'`),
  ].join('\n\n');
  console.log('');
  console.error(err);
  console.log('');

  return (req, res) => {
    res.write('404');
  };
}
