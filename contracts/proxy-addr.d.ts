declare module 'proxy-addr' {
  type TrustFn = (address: string, index: number) => boolean

  interface ProxyAddr {
    (req: unknown, trust: string | string[] | TrustFn): string
    all(req: unknown, trust?: string | string[] | TrustFn): string[]
    compile(val: string | string[] | TrustFn): TrustFn
  }

  const proxyAddr: ProxyAddr
  export default proxyAddr
}
