import { from, of, timer } from "rxjs";
import { concatMap, delay, map, mapTo, scan, take, tap } from "rxjs/operators";

export function stream(name, delayOrValues, countOrValues, log?) {
  let s;
  if (Array.isArray(countOrValues)) {
    if (Array.isArray(delayOrValues)) {
      console.assert(
        countOrValues.length === delayOrValues.length,
        "Number of intervals and values should match"
      );

      s = from(countOrValues).pipe(
        concatMap((v, index) =>
          timer(delayOrValues[index]).pipe(mapTo(name + `-${v}`))
        )
      );
    } else {
      s = from(countOrValues).pipe(
        concatMap(v => timer(0, delayOrValues).pipe(mapTo(name + `-${v}`)))
      );
    }
  } else {
    if (Array.isArray(delayOrValues)) {
      console.assert(
        countOrValues === delayOrValues.length,
        "Number of intervals and values should match"
      );

      const numbers = Array.from(Array(countOrValues).keys());
      s = from(numbers).pipe(
        concatMap((v, index) => {
          return of(name + `-${v}`).pipe(delay(delayOrValues[index]));
        })
      );
    } else {
      s = timer(0, delayOrValues)
        .pipe(map(v => name + `-${v}`))
        .pipe(take(countOrValues));
    }
  }

  if (log === "full") {
    s = s.pipe(tap(fullObserver(name)));
  } else if (log === "partial") {
    s = s.pipe(tap(partialObserver(name)));
  }

  return s;
}

export function fullObserver(value) {
  return {
    next(v) {
      const message =
        value.length < 5 ? `[${value}]:\t\t${v}` : `[${value}]:\t${v}`;
      log(message);
      console.log(message);
    },
    error() {
      const message =
        value.length < 5 ? `[${value}]:\t\tERROR` : `[${value}]:\tERROR`;
      log(message);
    },
    complete() {
      const message =
        value.length < 5 ? `[${value}]:\t\tCOMPLETE` : `[${value}]:\tCOMPLETE`;
      log(message);
    }
  };
}

export function partialObserver(stream) {
  return {
    error() {
      const message =
        stream.length < 5 ? `[${stream}]:\t\tERROR` : `[${stream}]:\tERROR`;
      log(message);
    },
    complete() {
      const message =
        stream.length < 5
          ? `[${stream}]:\t\tCOMPLETE`
          : `[${stream}]:\tCOMPLETE`;
      log(message);
    }
  };
}

export function log(v) {
  document.body
    .querySelector("pre")
    .appendChild(document.createElement("div")).textContent = v;
}

export function throwOnItem(count, stream) {
  return source =>
    source.pipe(
      scan((acc, value) => [value, ...acc], []),
      map((values: Number[]) => {
        if (values.length === count) {
          throw new Error(`Error on the stream '${stream}'!`);
        }
        return values[0];
      }),
      tap(partialObserver(stream))
    );
}

export function setUpDOM(name) {
  const title = document.createElement("h2");
  title.textContent = name;

  const hr = document.createElement("hr");
  const pre = document.createElement("pre");

  document.body.appendChild(title);
  document.body.appendChild(hr);
  document.body.appendChild(pre);
}
