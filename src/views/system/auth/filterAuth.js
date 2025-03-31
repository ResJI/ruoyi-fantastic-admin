function treeTrim(data) {
  for (let i = 0; i < data.children.length; i++) {
    if (!data.children[i].children || data.children[i].children.length === 0) {
      if (data.children[i].perms === '' && data.children[i].path !== 'auth_token') {
        delete data.children[i]
      }
    }
    else {
      const _data = treeTrim(data.children[i])
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

export default function (list) {
  return treeTrim({ children: list }).children
}
