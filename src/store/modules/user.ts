import apiUser from '@/api/modules/user'
import router from '@/router'
import useMenuStore from './menu'
import useRouteStore from './route'
import useSettingsStore from './settings'
import useTabbarStore from './tabbar'

const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const settingsStore = useSettingsStore()
    const routeStore = useRouteStore()
    const menuStore = useMenuStore()
    const tabbarStore = useTabbarStore()

    const localUserInfo = localStorage.userInfo ? JSON.parse(localStorage.userInfo) : {}

    const token = ref(localStorage.token ?? '')
    const account = ref(localUserInfo.account ?? '')
    const avatar = ref(localUserInfo.avatar ?? '')
    const permissions = ref<string[]>([])
    const id = ref(localUserInfo.id ?? null)
    const nickName = ref(localUserInfo.nickName ?? '')
    const phoneNumber = ref(localUserInfo.phoneNumber ?? '')
    const email = ref(localUserInfo.email ?? '')
    const sex = ref(localUserInfo.sex ?? '')
    const userId = ref(localUserInfo.userId ?? null)
    const deptId = ref(localUserInfo.deptId ?? null)
    const roles = ref<string[]>([])
    const isLogin = computed(() => !!token.value)

    // 登录
    async function login(data: {
      account: string
      password: string
    }) {
      const res = await apiUser.login(data)
      localStorage.setItem('token', res.token)
      token.value = res.token
      const userInfo = await apiUser.getInfo()
      id.value = userInfo.user.userId
      account.value = data.account
      nickName.value = userInfo.user.nickName
      avatar.value = userInfo.user.avatar !== '' ? import.meta.env.VITE_APP_BASE_API + userInfo.user.avatar : ''
      phoneNumber.value = userInfo.user.phonenumber
      email.value = userInfo.user.email
      sex.value = userInfo.user.sex
      deptId.value = userInfo.user.deptId
      userId.value = userInfo.user.userId
      localStorage.setItem('userInfo', JSON.stringify({
        id: id.value,
        account: account.value,
        nickName: nickName.value,
        avatar: avatar.value,
        phoneNumber: phoneNumber.value,
        email: email.value,
        sex: sex.value,
        deptId: deptId.value,
        userId: userId.value,
      }))
    }

    // 手动登出
    function logout(redirect = router.currentRoute.value.fullPath) {
      // 此处仅清除计算属性 isLogin 中判断登录状态过期的变量，以保证在弹出登录窗口模式下页面展示依旧正常
      localStorage.removeItem('token')
      token.value = ''
      router.push({
        name: 'login',
        query: {
          ...(redirect !== settingsStore.settings.home.fullPath && router.currentRoute.value.name !== 'login' && { redirect }),
        },
      }).then(logoutCleanStatus)
    }
    // 请求登出
    function requestLogout() {
      // 此处仅清除计算属性 isLogin 中判断登录状态过期的变量，以保证在弹出登录窗口模式下页面展示依旧正常
      localStorage.removeItem('token')
      token.value = ''
      router.push({
        name: 'login',
        query: {
          ...(
            router.currentRoute.value.fullPath !== settingsStore.settings.home.fullPath
            && router.currentRoute.value.name !== 'login'
            && {
              redirect: router.currentRoute.value.fullPath,
            }
          ),
        },
      }).then(logoutCleanStatus)
    }
    // 登出后清除状态
    function logoutCleanStatus() {
      localStorage.removeItem('account')
      localStorage.removeItem('avatar')
      account.value = ''
      avatar.value = ''
      permissions.value = []
      settingsStore.updateSettings({}, true)
      tabbarStore.clean()
      routeStore.removeRoutes()
      menuStore.setActived(0)
    }

    // 获取权限
    async function getPermissions() {
      const res = await apiUser.permission()
      permissions.value = res.permissions
      roles.value = res.roles
    }
    // 修改密码
    async function editPassword(data: {
      password: string
      newPassword: string
    }) {
      await apiUser.passwordEdit(data)
    }

    return {
      id,
      nickName,
      phoneNumber,
      email,
      sex,
      deptId,
      userId,
      account,
      token,
      avatar,
      permissions,
      isLogin,
      login,
      logout,
      requestLogout,
      getPermissions,
      editPassword,
    }
  },
)

export default useUserStore
