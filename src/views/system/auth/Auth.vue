<script setup>
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/ruoyi/menu'
import RightToolbar from '@/components/ruoyi/RightToolbar.vue'
import $modal from '@/utils/ruoyi/modal'
import { parseTime } from '@/utils/ruoyi/ruoyi'

const menuRef = ref()
const queryRef = ref()
const menuList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const menuOptions = ref([])
const isExpandAll = ref(false)
const refreshTable = ref(true)

const formDefault = {
  icon: '404',
  isCache: '0',
  isFrame: '1',
  menuName: '',
  menuType: 'M',
  orderNum: 0,
  parentId: 0,
  path: 'auth_token',
  status: '0',
  visible: '1',
  perms: '',
}

const data = reactive({
  form: { ...formDefault },
  queryParams: {
    menuName: undefined,
    visible: undefined,
  },
  rules: {},
})

const { queryParams, form, rules } = toRefs(data)

/** 查询菜单列表 */
function getList() {
  loading.value = true
  listMenu(queryParams.value).then((response) => {
    menuList.value = response
    loading.value = false
  })
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuOptions.value = []
  listMenu().then((response) => {
    const menu = { menuId: 0, menuName: '主类目', children: [] }
    menu.children = response
    menuOptions.value.push(menu)
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = { ...formDefault }
  watch(menuRef, (data) => {
    data && data.resetFields()
  }, { once: true })
}
/** 搜索按钮操作 */
function handleQuery() {
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  queryRef.value.resetFields()
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd(row) {
  getTreeselect()
  reset()
  if (row != null && row.menuId) {
    form.value.parentId = row.menuId
  }
  else {
    form.value.parentId = 0
  }
  open.value = true
  title.value = '添加权限'
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  await getTreeselect()
  getMenu(row.menuId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改权限'
  })
}
/** 提交按钮 */
function submitForm() {
  menuRef.value.validate((valid) => {
    if (valid) {
      if (form.value.menuId !== undefined) {
        updateMenu(form.value).then(() => {
          $modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      }
      else {
        addMenu(form.value).then(() => {
          $modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  $modal.confirm(`是否确认删除名称为"${row.menuName}"的数据项?`).then(() => {
    return delMenu(row.menuId)
  }).then(() => {
    getList()
    $modal.msgSuccess('删除成功')
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" @submit.prevent="handleQuery">
      <el-form-item label="权限名称" prop="menuName">
        <el-input
          v-model.trim="queryParams.menuName"
          placeholder="请输入权限名称"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">
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
          v-auth="['system:menu:add']"
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
          type="info"
          plain
          @click="toggleExpandAll"
        >
          <template #icon>
            <FaIcon name="i-ep:sort" />
          </template>
          展开/折叠
        </el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      border
    >
      <el-table-column prop="menuName" label="权限名称" :show-overflow-tooltip="true" width="160" />
      <el-table-column prop="orderNum" label="排序" width="60" />
      <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" width="180" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-auth="['system:menu:edit']" link type="primary" @click="handleUpdate(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:edit" />
            </template>
            修改
          </el-button>
          <el-button v-auth="['system:menu:add']" link type="primary" @click="handleAdd(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:plus" />
            </template>
            新增
          </el-button>
          <el-button v-auth="['system:menu:remove']" link type="primary" @click="handleDelete(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:delete" />
            </template>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改权限对话框 -->
    <el-dialog v-model="open" :title="title" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级权限">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                value-key="menuId"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="权限类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="M">
                  目录
                </el-radio>
                <el-radio value="F">
                  权限
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'M'" :span="12">
            <el-form-item>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                    <el-icon>
                      <FaIcon name="i-ph:question-fill" />
                    </el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
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
  </FaPageMain>
</template>
