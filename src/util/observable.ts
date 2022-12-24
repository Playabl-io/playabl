type voidFunction = () => void;

export default function createNewObservable() {
  const observers: voidFunction[] = [];

  const observable = {
    subscribe(fn: voidFunction) {
      observers.push(fn);
    },
    unsubscribe(fn: voidFunction) {
      observers.splice(observers.indexOf(fn), 1);
    },
    notify() {
      observers.forEach((fn) => fn());
    },
  };
  return observable;
}
