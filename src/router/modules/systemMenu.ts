import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/layouts/index.vue'),
    redirect: '/user/list',
    name: 'user',
    meta: {
      title: '用户管理',
      icon: 'i-ep:user',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'userList',
        component: () => import('@/views/system/user/User.vue'),
        meta: {
          title: '用户管理',
          menu: false,
          breadcrumb: false,
          activeMenu: '/user',
        },
      },
      {
        path: 'authRole/:userId(\\d+)',
        name: 'userAuthRole',
        component: () => import('@/views/system/user/AuthRole.vue'),
        meta: {
          title: '分配角色',
          menu: false,
          activeMenu: '/user',
          auth: ['system:user:edit'],
        },
      },
    ],
  },
  {
    path: '/role',
    component: () => import('@/layouts/index.vue'),
    redirect: '/role/list',
    name: 'role',
    meta: {
      title: '角色管理',
      icon: 'i-lucide:users',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'roleList',
        component: () => import('@/views/system/role/Role.vue'),
        meta: {
          title: '用户管理',
          menu: false,
          breadcrumb: false,
          activeMenu: '/role',
        },
      },
      {
        path: 'roleAuthUser/:roleId(\\d+)',
        name: 'roleAuthUser',
        component: () => import('@/views/system/role/AuthUser.vue'),
        meta: {
          title: '分配用户',
          menu: false,
          activeMenu: '/role',
          auth: ['system:role:edit'],
        },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/index.vue'),
    redirect: '/auth/list',
    name: 'auth',
    meta: {
      title: '权限管理',
      icon: 'i-octicon:shield-lock-16',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'authList',
        component: () => import('@/views/system/auth/Auth.vue'),
        meta: {
          title: '权限管理',
          menu: false,
          breadcrumb: false,
          activeMenu: '/auth',
        },
      },
    ],
  },
  {
    path: '/dept',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dept/list',
    name: 'dept',
    meta: {
      title: '部门管理',
      icon: 'i-eos-icons:organization',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'deptList',
        component: () => import('@/views/system/dept/Dept.vue'),
        meta: {
          title: '部门管理',
          menu: false,
          breadcrumb: false,
          activeMenu: '/dept',
        },
      },
    ],
  },
  {
    path: '/post',
    component: () => import('@/layouts/index.vue'),
    redirect: '/post/list',
    name: 'post',
    meta: {
      title: '岗位管理',
      icon: 'i-mdi:post-outline',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'postList',
        component: () => import('@/views/system/post/Post.vue'),
        meta: {
          title: '岗位管理',
          menu: false,
          breadcrumb: false,
          activeMenu: '/post',
        },
      },
    ],
  },
  {
    path: '/dict',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dict/list',
    name: 'dict',
    meta: {
      title: '字典管理',
      icon: 'i-streamline:dictionary-language-book',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'dictList',
        component: () => import('@/views/system/dict/Dict.vue'),
        meta: {
          title: '字典管理',
          menu: false,
          breadcrumb: false,
          activeMenu: '/dict',
        },
      },
      {
        path: 'detail/:dictId(\\d+)',
        name: 'dictDetail',
        component: () => import('@/views/system/dict/Data.vue'),
        meta: {
          title: '字典数据',
          menu: false,
          breadcrumb: true,
          activeMenu: '/dict',
          auth: ['system:dict:list'],
        },
      },
    ],
  },
  {
    path: '/config',
    component: () => import('@/layouts/index.vue'),
    redirect: '/config/list',
    name: 'config',
    meta: {
      title: '参数设置',
      icon: 'i-mdi:post-outline',
      auth: ['system'],
    },
    children: [
      {
        path: 'list',
        name: 'configList',
        component: () => import('@/views/system/config/Config.vue'),
        meta: {
          title: '参数设置',
          menu: false,
          breadcrumb: false,
          activeMenu: '/config',
        },
      },
    ],
  },
]

export default routes
