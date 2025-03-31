import type { Route } from '#/global'
import type { RouteRecordRaw } from 'vue-router'
import useSettingsStore from '@/store/modules/settings'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:meta-layouts'
import BreadcrumbExample from './modules/breadcrumb.example'
import ComponentExample from './modules/component.example'
import EcologyExample from './modules/ecology.example'
import ExternalLinkExample from './modules/external.link.example'
import FeatureExample from './modules/feature.example'
import IconExample from './modules/icon.example'
import JsxExample from './modules/jsx.example'
import KeepAliveExample from './modules/keep.alive.example'
import MockExample from './modules/mock.example'
import MultilevelMenuExample from './modules/multilevel.menu.example'
import PermissionExample from './modules/permission.example'
import PluginExample from './modules/plugin.example'
import systemMenu from './modules/systemMenu'
import TabExample from './modules/tab.example'

// 固定路由（默认路由）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/:all(.*)*',
    name: 'notFound',
    component: () => import('@/views/[...all].vue'),
    meta: {
      title: '找不到页面',
    },
  },
]

// 系统路由
const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: () => useSettingsStore().settings.home.title,
      breadcrumb: false,
    },
    children: [
      {
        path: '',
        component: () => import('@/views/index.vue'),
        meta: {
          title: () => useSettingsStore().settings.home.title,
          icon: 'i-ant-design:home-twotone',
          breadcrumb: false,
        },
      },
      {
        path: 'reload',
        name: 'reload',
        component: () => import('@/views/reload.vue'),
        meta: {
          title: '重新加载',
          breadcrumb: false,
        },
      },
    ],
  },
]

// 动态路由（异步路由、导航栏路由）
const asyncRoutes: Route.recordMainRaw[] = [
  {
    meta: {
      title: '演示',
      icon: 'i-uim:box',
    },
    children: [
      MultilevelMenuExample,
      BreadcrumbExample,
      KeepAliveExample,
      TabExample,
      ComponentExample,
      IconExample,
      FeatureExample,
      PluginExample,
      PermissionExample,
      MockExample,
      JsxExample,
      ExternalLinkExample,
    ],
  },
  {
    meta: {
      title: '生态',
      icon: 'i-icon-park-outline:circular-connection',
    },
    children: [
      ...EcologyExample,
    ],
  },
  {
    meta: {
      title: '系统',
      icon: 'i-iconoir:ios-settings',
    },
    children: [
      ...systemMenu,
    ],
  },
]

const constantRoutesByFilesystem = generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant === true
})

const asyncRoutesByFilesystem = setupLayouts(generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant !== true && item.meta?.layout !== false
}))

export {
  asyncRoutes,
  asyncRoutesByFilesystem,
  constantRoutes,
  constantRoutesByFilesystem,
  systemRoutes,
}
