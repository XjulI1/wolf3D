import { readonly, ref, type Ref } from 'vue'

/** Callbacks accepted by `registerSW` from `virtual:pwa-register` (the subset in use). */
export type RegisterOptions = {
  onNeedRefresh?: () => void
  onOfflineReady?: () => void
  onRegisterError?: (error: unknown) => void
}

/** Signature of `registerSW`: returns the function that activates the waiting version. */
export type RegisterServiceWorker = (options: RegisterOptions) => (reloadPage?: boolean) => Promise<void>

export type UpdateState = {
  /** True once a new version is downloaded and waits to be activated. */
  updateReady: Readonly<Ref<boolean>>
  /** Activates the waiting version and reloads the page. */
  applyUpdate: () => Promise<void>
}

/** "New version ready" state; without a registration function it stays false. */
export function createUpdateState(register?: RegisterServiceWorker): UpdateState {
  const updateReady = ref(false)
  if (!register) return { updateReady: readonly(updateReady), applyUpdate: async () => {} }

  const updateServiceWorker = register({
    onNeedRefresh: () => {
      updateReady.value = true
    },
    onOfflineReady: () => {},
    onRegisterError: () => {},
  })
  return { updateReady: readonly(updateReady), applyUpdate: () => updateServiceWorker(true) }
}
