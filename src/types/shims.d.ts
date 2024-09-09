declare interface Window {
  webkitDevicePixelRatio: any
  mozDevicePixelRatio: any
}

declare module 'virtual:app-loading' {
  const loadingFadeOut: () => void
  export {
    loadingFadeOut,
  }
}

declare const __SYSTEM_INFO__: {
  pkg: {
    dependencies: Recordable<string>
    devDependencies: Recordable<string>
  }
  lastBuildTime: string
}

declare module 'vue-esign'
declare module '@bytemd/plugin-gfm/lib/locales/zh_Hans.json'
