import { Program } from './types';

interface SessionProgramOptions {
  init: () => any;
  router: any;
  update: (model: any, msg: any) => any;
}

export default function sandbox({
  init,
  router,
  update,
}: SessionProgramOptions): Program {
  return () => {};
}
