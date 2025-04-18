<script setup>
import { download } from '@/api/ruoyi/download'
import { addUser, changeUserStatus, delUser, deptTreeSelect, getUser, listUser, resetUserPwd, updateUser } from '@/api/ruoyi/user.js'
import Pagination from '@/components/ruoyi/Pagination.vue'
import RightToolbar from '@/components/ruoyi/RightToolbar.vue'
import useUserStore from '@/store/modules/user'
import { useDict } from '@/utils/ruoyi/dict'
import $modal from '@/utils/ruoyi/modal'
import { addDateRange, parseTime } from '@/utils/ruoyi/ruoyi'
import { ElMessageBox } from 'element-plus'

const uploadRef = ref()
const userRef = ref()
const userStore = useUserStore()
const router = useRouter()
const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable', 'sys_user_sex')

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const deptName = ref('')
const deptOptions = ref(undefined)
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
/** * 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: `Bearer ${userStore.token}` },
  // 上传的地址
  url: `${import.meta.env.VITE_APP_BASE_API}/system/user/importData`,
})
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户编号`, visible: true },
  { key: 1, label: `用户名称`, visible: true },
  { key: 2, label: `用户昵称`, visible: true },
  { key: 3, label: `部门`, visible: true },
  { key: 4, label: `手机号码`, visible: true },
  { key: 5, label: `状态`, visible: true },
  { key: 6, label: `创建时间`, visible: true },
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined,
  },
  rules: {
    userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }, { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }],
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }, { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phonenumber: [{ pattern: /^1[3-9|]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 通过条件过滤节点  */
function filterNode(value, data) {
  if (!value) {
    return true
  }
  return data.label.includes(value)
}
/** 根据名称筛选部门树 */
const deptTreeRef = ref()
watch(deptName, (val) => {
  deptTreeRef.value.filter(val)
})
/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data
  })
}
/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    userList.value = res.rows
    total.value = res.total
  })
}
/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id
  handleQuery()
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
const queryRef = ref()
function resetQuery() {
  dateRange.value = []
  queryRef.value?.resetFields()
  queryParams.value.deptId = undefined
  deptTreeRef.value.setCurrentKey(null)
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value
  $modal.confirm(`是否确认删除用户编号为"${userIds}"的数据项？`).then(() => {
    return delUser(userIds)
  }).then(() => {
    getList()
    $modal.msgSuccess('删除成功')
  }).catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  download('system/user/export', {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`)
}
/** 用户状态修改  */
function handleStatusChange(row) {
  const text = row.status === '0' ? '启用' : '停用'
  $modal.confirm(`确认要"${text}""${row.userName}"用户吗?`).then(() => {
    return changeUserStatus(row.userId, row.status)
  }).then(() => {
    $modal.msgSuccess(`${text}成功`)
  }).catch(() => {
    row.status = row.status === '0' ? '1' : '0'
  })
}
/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId
  router.push(`/user/authRole/${userId}`)
}
/** 重置密码按钮操作 */
function handleResetPwd(row) {
  ElMessageBox.prompt(`请输入"${row.userName}"的新密码`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(() => {
      $modal.msgSuccess(`修改成功，新密码是：${value}`)
    })
  }).catch(() => {})
}
/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 导入按钮操作 */
function handleImport() {
  upload.title = '用户导入'
  upload.open = true
}
/** 下载模板操作 */
function importTemplate() {
  download('system/user/importTemplate', {
  }, `user_template_${new Date().getTime()}.xlsx`)
}
/** 文件上传中处理 */
function handleFileUploadProgress() {
  upload.isUploading = true
}
/** 文件上传成功处理 */
function handleFileSuccess(response, file) {
  upload.open = false
  upload.isUploading = false
  uploadRef.value.handleRemove(file)
  ElMessageBox.alert(`<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>${response.msg}</div>`, '导入结果', { dangerouslyUseHTMLString: true })
  getList()
}
/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value.submit()
}
/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: [],
  }
  watch(userRef, (data) => {
    data && data.resetFields()
  }, { once: true })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  getUser().then((response) => {
    postOptions.value = response.posts
    roleOptions.value = response.roles
    open.value = true
    title.value = '添加用户'
    form.value.password = initPassword.value
  })
};
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const userId = row.userId || ids.value
  getUser(userId).then((response) => {
    form.value = response.data
    postOptions.value = response.posts
    roleOptions.value = response.roles
    form.value.postIds = response.postIds
    form.value.roleIds = response.roleIds
    open.value = true
    title.value = '修改用户'
    form.value.password = ''
  })
}
/** 提交按钮 */
function submitForm() {
  userRef.value.validate((valid) => {
    if (valid) {
      if (form.value.userId !== undefined) {
        updateUser(form.value).then(() => {
          $modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      }
      else {
        addUser(form.value).then(() => {
          $modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
};

onMounted(() => {
  getDeptTree()
  getList()
})
</script>

<template>
  <FaPageMain class="app-container">
    <el-row :gutter="20">
      <!-- 部门数据 -->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            prefix-icon="Search"
            style="margin-bottom: 20px;"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            node-key="id"

            default-expand-all highlight-current
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!-- 用户数据 -->
      <el-col :span="20" :xs="24">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              style="width: 240px;"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 240px;"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              style="width: 240px;"
            >
              <el-option
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px;">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">
              <template #icon>
                <FaIcon name="i-ep:search" />
              </template>
              搜索
            </el-button>
            <el-button @click="resetQuery">
              <template #icon>
                <FaIcon name="i-ep:refresh" />
              </template>
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-auth="['system:user:add']"
              type="primary"
              plain
              @click="handleAdd"
            >
              <template #icon>
                <FaIcon name="i-ep:plus" />
              </template>
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-auth="['system:user:edit']"
              type="success"
              plain
              :disabled="single"
              @click="handleUpdate"
            >
              <template #icon>
                <FaIcon name="i-ep:edit" />
              </template>
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-auth="['system:user:remove']"
              type="danger"
              plain
              :disabled="multiple"
              @click="handleDelete"
            >
              <template #icon>
                <FaIcon name="i-ep:delete" />
              </template>
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-auth="['system:user:import']"
              type="info"
              plain
              @click="handleImport"
            >
              <template #icon>
                <FaIcon name="i-ep:upload" />
              </template>
              导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-auth="['system:user:export']"
              type="warning"
              plain
              @click="handleExport"
            >
              <template #icon>
                <FaIcon name="i-ep:download" />
              </template>
              导出
            </el-button>
          </el-col>
          <RightToolbar v-model:show-search="showSearch" :columns="columns" @query-table="getList" />
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" key="userId" label="用户编号" align="center" prop="userId" />
          <el-table-column v-if="columns[1].visible" key="userName" label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[2].visible" key="nickName" label="用户昵称" align="center" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[3].visible" key="deptName" label="部门" align="center" prop="dept.deptName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[4].visible" key="phonenumber" label="手机号码" align="center" prop="phonenumber" width="120" />
          <el-table-column v-if="columns[5].visible" key="status" label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="columns[6].visible" label="创建时间" align="center" prop="createTime" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip v-if="scope.row.userId !== 1" content="修改" placement="top">
                <el-button v-auth="['system:user:edit']" link type="primary" @click="handleUpdate(scope.row)">
                  <template #icon>
                    <FaIcon name="i-ep:edit" />
                  </template>
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="删除" placement="top">
                <el-button v-auth="['system:user:remove']" link type="primary" @click="handleDelete(scope.row)">
                  <template #icon>
                    <FaIcon name="i-ep:delete" />
                  </template>
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="重置密码" placement="top">
                <el-button v-auth="['system:user:resetPwd']" link type="primary" @click="handleResetPwd(scope.row)">
                  <template #icon>
                    <FaIcon name="i-ep:key" />
                  </template>
                </el-button>
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="分配角色" placement="top">
                <el-button v-auth="['system:user:edit']" link type="primary" @click="handleAuthRole(scope.row)">
                  <template #icon>
                    <FaIcon name="i-ep:circle-check" />
                  </template>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择归属部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId === undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId === undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :value="dict.value"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status === 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog v-model="upload.open" :title="upload.title" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="`${upload.url}?updateSupport=${upload.updateSupport}`"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <!--            <upload-filled /> -->
          <FaIcon name="i-ep:upload-filled" />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px;vertical-align: baseline;" @click="importTemplate">
              下载模板
            </el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">
            确 定
          </el-button>
          <el-button @click="upload.open = false">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </FaPageMain>
</template>
