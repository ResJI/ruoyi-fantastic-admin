import handleTree from '@/utils/ruoyi/handleTree'
import request from '../index'

function filterAuth(data) {
  for (let i = 0; i < data.children?.length; i++) {
    if (!data.children[i]?.children || data.children[i]?.children.length === 0) {
      if (data.children[i]?.perms === '' && data.children[i]?.path !== 'auth_token') {
        delete data.children[i]
      }
    }
    else {
      const _data = filterAuth(data.children[i])
      if (!_data.children || _data.children.length === 0) {
        if (_data.perms === '') {
          delete data.children[i]
        }
      }
    }
  }
  data.children = data.children.filter(item => item)
  return data
}

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query,
  }).then((res) => {
    return filterAuth({ children: handleTree(res.data, 'menuId') }).children
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: `/system/menu/${menuId}`,
    method: 'get',
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/system/menu/list',
    method: 'get',
  }).then((res) => {
    return filterAuth({ children: handleTree(res.data.map(item => ({
      id: item.menuId,
      label: item.menuName,
      ...item,
    })), 'menuId') }).children
  })
  // return request({
  //   url: '/system/menu/treeselect',
  //   method: 'get',
  // })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  const fun1 = request({
    url: `/system/menu/roleMenuTreeselect/${roleId}`,
    method: 'get',
  })
  const fun2 = request({
    url: '/system/menu/list',
    method: 'get',
  }).then((res) => {
    return filterAuth({ children: handleTree(res.data.map(item => ({
      id: item.menuId,
      label: item.menuName,
      ...item,
    })), 'menuId') }).children
  })
  return Promise.all([fun1, fun2]).then(([data1, data2]) => {
    data1.menus = data2
    return data1
  })
  // return request({
  //   url: '/system/menu/roleMenuTreeselect/' + roleId,
  //   method: 'get'
  // })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/system/menu',
    method: 'post',
    data,
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/system/menu',
    method: 'put',
    data,
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: `/system/menu/${menuId}`,
    method: 'delete',
  })
}
