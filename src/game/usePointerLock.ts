import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue'

/** Captures the mouse inside `target` for mouse look; the browser releases it on Escape. */
export function usePointerLock(target: Readonly<Ref<HTMLElement | null>>) {
  const locked = ref(false)
  const supported = typeof document !== 'undefined' && 'pointerLockElement' in document

  const update = () => {
    locked.value = target.value !== null && document.pointerLockElement === target.value
  }

  onMounted(() => document.addEventListener('pointerlockchange', update))
  onBeforeUnmount(() => {
    document.removeEventListener('pointerlockchange', update)
    if (document.pointerLockElement) document.exitPointerLock()
  })

  /** Resolves to false when the browser refuses to capture the mouse. */
  async function lock(): Promise<boolean> {
    const element = target.value
    if (!supported || !element) return false
    try {
      await element.requestPointerLock()
      return true
    } catch {
      return false
    }
  }

  function unlock(): void {
    if (supported && document.pointerLockElement) document.exitPointerLock()
  }

  return { supported, locked: readonly(locked), lock, unlock }
}
