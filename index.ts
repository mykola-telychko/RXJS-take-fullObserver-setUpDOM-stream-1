import { take } from 'rxjs/operators';
import { fullObserver, setUpDOM, stream } from './utils';

// https://indepth.dev/reference/rxjs/operators/take
const operator = 'takeUntil';

setUpDOM(operator);

const streamSrc$ = stream('a', 200, 10);

// only mirror 3 values
streamSrc$.pipe(take(3)).subscribe(fullObserver(operator));
