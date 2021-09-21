/**
 * Simple utilities to measure the speed of execution of
 * a given block of code. The implementation makes it possible
 * to profile code inside components, creating and stopping
 * the timer only once given a unique timer name.
 *
 * Example usage:
 *
 * start("farms");
 * const { farms } = MiniFarms.useContainer();
 * end("farms", farms);
 *
 * The timer will be stopped as soon as variable `farms`
 * holds a value. Note that `name` given to both `start`
 * and `end` functions needs to be identical.
 */
export const start = (name: string) => {
  if (typeof window === "undefined") return;

  const key = `${name}_started`;

  if (!(window as any)[key]) {
    console.time(`tracking_${name}`);

    (window as any)[key] = true;
  }
};

export const end = (name: string, value: any) => {
  if (typeof window === "undefined") return;

  const key = `${name}_ended`;

  if (!(window as any)[key]) {
    // Handle 0 values.
    if (value || typeof value === "number") {
      console.timeEnd(`tracking_${name}`);
      (window as any)[key] = true;
    }
  }
};
