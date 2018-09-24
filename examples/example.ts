import { sandbox } from 'wool-server/program';
import { group, route } from 'wool-server/router';

sandbox({
  router: group('/', () => [], [
    route('/', () => [], () => 'Hello'),
    route('one', () => [], () => 'One'),
    route('two', () => [], () => 'Two'),
    group('nested', () => [], [
      route('one', () => [], () => 'Nested One'),
      route('two', () => [], () => 'Nested Two'),
      group('deeper', () => [], [
        route('one', () => [], () => 'Nested Deeper One'),
        route('two', () => [], () => 'Nested Deeper Two'),
      ]),
    ]),
  ]),
})(8080);
