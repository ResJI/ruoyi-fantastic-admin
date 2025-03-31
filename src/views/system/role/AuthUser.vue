<script setup>
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/ruoyi/role'
import DictTag from '@/components/ruoyi/DictTag.vue'
import useSettingsStore from '@/store/modules/settings.ts'
import { useDict } from '@/utils/ruoyi/dict'
import $modal from '@/utils/ruoyi/modal'
import { parseTime } from '@/utils/ruoyi/ruoyi'
import SelectUser from './SelectUser.vue'

const settingsStore = useSettingsStore()
const tabBar = useTabbar()
const route = useRoute()
const router = useRouter()
const { sys_normal_disable } = useDict('sys_normal_disable')

const selectRef = ref()
const queryRef = ref()
const userList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const multiple = ref(true)
const total = ref(0)
const userIds = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId,
  userName: undefined,
  phonenumber: undefined,
})

/** 查询授权用户列表 */
function getList() {
  loading.value = true
  allocatedUserList(queryParams).then((response) => {
    userList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}
// 返回按钮
async function handleClose() {
  const pageId = route.fullPath
  await router.push({ name: 'roleList' })
  settingsStore.settings.tabbar.enable && tabBar.closeById(pageId)
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  queryRef.value.resetFields()
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId)
  multiple.value = !selection.length
}
/** 打开授权用户表弹窗 */
function openSelectUser() {
  selectRef.value.show()
}
/** 取消授权按钮操作 */
function cancelAuthUser(row) {
  $modal.confirm(`确认要取消该用户"${row.userName}"角色吗？`).then(() => {
    return authUserCancel({ userId: row.userId, roleId: queryParams.roleId })
  }).then(() => {
    getList()
    $modal.msgSuccess('取消授权成功')
  }).catch(() => {})
}
/** 批量取消授权按钮操作 */
function cancelAuthUserAll() {
  const roleId = queryParams.roleId
  const uIds = userIds.value.join(',')
  $modal.confirm('是否取消选中用户授权数据项?').then(() => {
    return authUserCancelAll({ roleId, userIds: uIds })
  }).then(() => {
    getList()
    $modal.msgSuccess('取消授权成功')
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
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
          v-auth="['system:role:add']"
          type="primary"
          plain
          @click="openSelectUser"
        >
          <template #icon>
            <FaIcon name="i-ep:plus" />
          </template>
          添加用户
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-auth="['system:role:remove']"
          type="danger"
          plain
          :disabled="multiple"
          @click="cancelAuthUserAll"
        >
          <template #icon>
            <FaIcon name="i-ep:circle-close" />
          </template>
          批量取消授权
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          @click="handleClose"
        >
          <template #icon>
            <FaIcon name="i-ep:close" />
          </template>
          关闭
        </el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <DictTag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-auth="['system:role:remove']" link type="primary" @click="cancelAuthUser(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:circle-close" />
            </template>
            取消授权
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
    <SelectUser ref="selectRef" :role-id="queryParams.roleId" @ok="handleQuery" />
  </FaPageMain>
</template>
