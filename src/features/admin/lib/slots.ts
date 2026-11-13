/** Turnos para trabajos caros (el hash de contraseñas usa ~130 MB cada uno): pocos a la vez y una cola corta. Puro. */
export function createSlots(concurrency: number, maxQueue: number) {
  let running = 0;
  const queue: Array<() => void> = [];

  const release = () => {
    running -= 1;
    queue.shift()?.();
  };

  /** Ejecuta `job` cuando haya turno. Devuelve `null` sin ejecutarlo si la cola está llena. */
  return async function run<T>(job: () => Promise<T>): Promise<T | null> {
    if (running >= concurrency) {
      if (queue.length >= maxQueue) return null;
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    running += 1;
    try {
      return await job();
    } finally {
      release();
    }
  };
}
