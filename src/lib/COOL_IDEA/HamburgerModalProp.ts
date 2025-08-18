import { writable } from "svelte/store";

function createModal(state: boolean) {
  const { subscribe, set } = writable(state);
  return {
    subscribe,
    open: () => set(true),
    close: () => set(false),
  };
}
export const modalProp = createModal(false);
