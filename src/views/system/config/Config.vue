<script setup>
import { addConfig, delConfig, getConfig, listConfig, refreshCache, updateConfig } from '@/api/ruoyi/config'
import { download } from '@/api/ruoyi/download'
import DictTag from '@/components/ruoyi/DictTag.vue'
import Pagination from '@/components/ruoyi/Pagination.vue'
import RightToolbar from '@/components/ruoyi/RightToolbar.vue'
import { useDict } from '@/utils/ruoyi/dict'
import $modal from '@/utils/ruoyi/modal'
import { addDateRange, parseTime } from '@/utils/ruoyi/ruoyi'

const { sys_yes_no } = useDict('sys_yes_no')

const queryRef = ref()
const configRef = ref()
const configList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined,
  },
  rules: {
    configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
    configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
    configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }],
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询参数列表 */
function getList() {
  loading.value = true
  listConfig(addDateRange(queryParams.value, dateRange.value)).then((response) => {
    configList.value = response.rows
    total.value = response.total
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
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'Y',
    remark: undefined,
  }
  watch(configRef, (data) => {
    data && data.resetFields()
  }, { once: true })
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  queryRef.value.resetFields()
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加参数'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const configId = row.configId || ids.value
  getConfig(configId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改参数'
  })
}
/** 提交按钮 */
function submitForm() {
  configRef.value.validate((valid) => {
    if (valid) {
      if (form.value.configId !== undefined) {
        updateConfig(form.value).then(() => {
          $modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      }
      else {
        addConfig(form.value).then(() => {
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
  const configIds = row.configId || ids.value
  $modal.confirm(`是否确认删除参数编号为"${configIds}"的数据项？`).then(() => {
    return delConfig(configIds)
  }).then(() => {
    getList()
    $modal.msgSuccess('删除成功')
  }).catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  download('system/config/export', {
    ...queryParams.value,
  }, `config_${new Date().getTime()}.xlsx`)
}
/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    $modal.msgSuccess('刷新缓存成功')
  })
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="参数名称" prop="configName">
        <el-input
          v-model.trim="queryParams.configName"
          placeholder="请输入参数名称"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input
          v-model.trim="queryParams.configKey"
          placeholder="请输入参数键名"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-select v-model="queryParams.configType" placeholder="系统内置" clearable style="width: 200px;">
          <el-option
            v-for="dict in sys_yes_no"
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
          v-auth="['system:config:add']"
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
          v-auth="['system:config:edit']"
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
          v-auth="['system:config:remove']"
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
          v-auth="['system:config:export']"
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
      <el-col :span="1.5">
        <el-button
          v-auth="['system:config:remove']"
          type="danger"
          plain
          @click="handleRefreshCache"
        >
          <template #icon>
            <FaIcon name="i-ep:refresh" />
          </template>
          刷新缓存
        </el-button>
      </el-col>
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="configId" />
      <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="参数键值" align="center" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column label="系统内置" align="center" prop="configType">
        <template #default="scope">
          <DictTag :options="sys_yes_no" :value="scope.row.configType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-auth="['system:config:edit']" link type="primary" @click="handleUpdate(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:edit" />
            </template>
            修改
          </el-button>
          <el-button v-auth="['system:config:remove']" link type="primary" @click="handleDelete(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:delete" />
            </template>
            删除
          </el-button>
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body>
      <el-form ref="configRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio
              v-for="dict in sys_yes_no"
              :key="dict.value"
              :value="dict.value"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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
