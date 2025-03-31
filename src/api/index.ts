import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import useUserStore from '@/store/modules/user'
import axios from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import qs from 'qs'

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 1000 * 60,
})

function removeEmptyData(data: any) {
  data = data ?? null
  if (data !== null && typeof data === 'object') {
    for (const key in data) {
      if ([undefined, null, ''].includes(data[key])) {
        delete data[key]
      }
    }
    if (data.length === 0) {
      return null
    }
  }
  return data
}

type MyInternalAxiosRequestConfig = InternalAxiosRequestConfig & {
  __noMessage: boolean
  __withHeaders: boolean
}
api.interceptors.request.use(
  (_request) => {
    const request = _request as MyInternalAxiosRequestConfig
    request.__noMessage = request.headers.__noMessage === 'true'
    request.__withHeaders = request.headers.__withHeaders === 'true'
    delete request.headers.__noMessage
    delete request.headers.__withHeaders
    const userStore = useUserStore()
    userStore.isLogin && (request.headers.authorization = `Bearer ${userStore.token}`)
    request.params = removeEmptyData(request.params)
    if (request.method === 'get') {
      if (request.params !== null && typeof request.params === 'object') {
        request.url = `${request.url}?${qs.stringify(request.params)}`
        request.params = {}
      }
    }
    return request
  },
)

const errorCode: { [index: keyof any]: string } = {
  401: '认证失败，无法访问系统资源',
  403: '当前操作没有权限',
  404: '访问资源不存在',
  default: '系统未知错误，请反馈给管理员',
}
api.interceptors.response.use(
  async (_res) => {
    const res = _res as AxiosResponse & {
      config: InternalAxiosRequestConfig & {
        __noMessage: boolean
        __withHeaders: boolean
      }
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    if (code === 200) {
      if (res.config.__withHeaders) {
        return res
      }
      else {
        return res.data
      }
    }
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode.default
    switch (code) {
      case 401:
        await useUserStore().logout()
        return
      case 500:
        !res.config.__noMessage && ElMessage({ message: msg, type: 'error' })
        return Promise.reject(new Error(msg))
      case 601:
        !res.config.__noMessage && ElMessage({ message: msg, type: 'warning' })
        return Promise.reject(new Error(msg))
      default:
        !res.config.__noMessage && ElNotification.error({ title: msg })
        return Promise.reject(new Error('error'))
    }
  },
  (error) => {
    let message = ''
    if (error.response) {
      message = `系统接口${error.response.status}异常`
    }
    else if (error.request) {
      message = error.code === 'ERR_NETWORK' ? '后端接口连接异常' : '系统接口请求超时'
    }
    else {
      message = '请求异常'
    }
    ElMessage({ message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  },
)

export default api
