'use server'

type Streamable<T> = {
  value: T | undefined;
  update: (value: T) => void;
  done: () => void;
};

export function createStreamableValue<T>(initialValue?: T): Streamable<T> {
  let currentValue = initialValue;
  const listeners = new Set<(value: T) => void>();

  return {
    get value() { return currentValue; },
    update(value: T) {
      currentValue = value;
      listeners.forEach(l => l(value));
    },
    done() {
      listeners.clear();
    },
  };
}