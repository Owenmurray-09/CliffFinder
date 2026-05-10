export type PickedImage = { uri: string };

/** Open a hidden <input type="file"> and resolve with a blob URL for the picked image. */
export function pickImage(): Promise<PickedImage | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    let settled = false;
    const settle = (v: PickedImage | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(v);
    };

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return settle(null);
      settle({ uri: URL.createObjectURL(file) });
    };
    // Fires when the chooser closes; on most browsers this is the only signal
    // we get for a "cancel" because no `change` event fires when nothing was
    // chosen. Use a microtask so a real selection sets `settled` first.
    input.oncancel = () => queueMicrotask(() => settle(null));

    document.body.appendChild(input);
    input.click();
  });
}
