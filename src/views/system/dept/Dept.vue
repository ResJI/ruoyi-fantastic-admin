<script setup>
import { addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept } from '@/api/ruoyi/dept'
import DictTag from '@/components/ruoyi/DictTag.vue'
import RightToolbar from '@/components/ruoyi/RightToolbar.vue'
import { useDict } from '@/utils/ruoyi/dict'
import handleTree from '@/utils/ruoyi/handleTree'
import $modal from '@/utils/ruoyi/modal'
import { parseTime } from '@/utils/ruoyi/ruoyi'

const { sys_normal_disable } = useDict('sys_normal_disable')

const deptRef = ref()
const queryRef = ref()
const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)

const data = reactive({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined,
  },
  rules: {
    parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
    deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [{ pattern: /^1[3-9|]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
function getList() {
  loading.value = true
  listDept(queryParams.value).then((response) => {
    deptList.value = handleTree(response.data, 'deptId')
    loading.value = false
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0',
  }
  watch(deptRef, (data) => {
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
  reset()
  listDept().then((response) => {
    deptOptions.value = handleTree(response.data, 'deptId')
  })
  if (row !== undefined) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = '添加部门'
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
function handleUpdate(row) {
  reset()
  listDeptExcludeChild(row.deptId).then((response) => {
    deptOptions.value = handleTree(response.data, 'deptId')
  })
  getDept(row.deptId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改部门'
  })
}
/** 提交按钮 */
function submitForm() {
  deptRef.value.validate((valid) => {
    if (valid) {
      if (form.value.deptId !== undefined) {
        updateDept(form.value).then(() => {
          $modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      }
      else {
        addDept(form.value).then(() => {
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
  $modal.confirm(`是否确认删除名称为"${row.deptName}"的数据项?`).then(() => {
    return delDept(row.deptId)
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
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable style="width: 200px;">
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-auth="['system:dept:add']"
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
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="deptName" label="部门名称" width="260" />
      <el-table-column prop="orderNum" label="排序" width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <DictTag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-auth="['system:dept:edit']" link type="primary" @click="handleUpdate(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:edit" />
            </template>
            修改
          </el-button>
          <el-button v-auth="['system:dept:add']" link type="primary" @click="handleAdd(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:plus" />
            </template>
            新增
          </el-button>
          <el-button v-if="scope.row.parentId !== 0" v-auth="['system:dept:remove']" link type="primary" @click="handleDelete(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:delete" />
            </template>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                value-key="deptId"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
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
