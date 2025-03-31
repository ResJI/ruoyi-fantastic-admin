import api from '../index'

export default {
  // 登录
  login: (data: {
    account: string
    password: string
  }) => api.post('/login', {
    username: data.account,
    password: data.password,
  }),

  getInfo: () => api.get('/getInfo'),

  // 获取权限
  permission: () => api.get('/getInfo').then((res: any) => ({
    permissions: res.permissions,
    roles: res.roles ?? ['ROLE_DEFAULT'],
  })),

  // 修改密码
  passwordEdit: (data: {
    password: string
    newPassword: string
  }) => api({
    method: 'put',
    url: '/system/user/profile/updatePwd',
    params: {
      oldPassword: data.password,
      newPassword: data.newPassword,
    },
  }),

  updateUserProfile: (data: any) => api.put('/system/user/profile', data),
  uploadAvatar: (data: any) => api.post('/system/user/profile/avatar', data),
}
