import type { AxiosRequestConfig, CreateAxiosDefaults } from 'axios'

declare module 'axios' {
  interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>
    create: (config?: CreateAxiosDefaults) => AxiosInstance
    request: <T = any>(config: AxiosRequestConfig) => Promise<T>
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>
    head: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
  }
}
