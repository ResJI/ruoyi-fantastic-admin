<script setup>
import { download } from '@/api/ruoyi/download'
import { addPost, delPost, getPost, listPost, updatePost } from '@/api/ruoyi/post'
import DictTag from '@/components/ruoyi/DictTag.vue'
import Pagination from '@/components/ruoyi/Pagination.vue'
import RightToolbar from '@/components/ruoyi/RightToolbar.vue'
import { useDict } from '@/utils/ruoyi/dict'
import $modal from '@/utils/ruoyi/modal'
import { parseTime } from '@/utils/ruoyi/ruoyi'

const { sys_normal_disable } = useDict('sys_normal_disable')

const postRef = ref()
const queryRef = ref()
const postList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: undefined,
    postName: undefined,
    status: undefined,
  },
  rules: {
    postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
    postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
    postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }],
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位列表 */
function getList() {
  loading.value = true
  listPost(queryParams.value).then((response) => {
    postList.value = response.rows
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
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined,
  }
  watch(postRef, (data) => {
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
  queryRef.value.resetFields()
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.postId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加岗位'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const postId = row.postId || ids.value
  getPost(postId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改岗位'
  })
}
/** 提交按钮 */
function submitForm() {
  postRef.value.validate((valid) => {
    if (valid) {
      if (form.value.postId !== undefined) {
        updatePost(form.value).then(() => {
          $modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      }
      else {
        addPost(form.value).then(() => {
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
  const postIds = row.postId || ids.value
  $modal.confirm(`是否确认删除岗位编号为"${postIds}"的数据项？`).then(() => {
    return delPost(postIds)
  }).then(() => {
    getList()
    $modal.msgSuccess('删除成功')
  }).catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  download('system/post/export', {
    ...queryParams.value,
  }, `post_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>

<template>
  <FaPageMain>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
          v-model="queryParams.postCode"
          placeholder="请输入岗位编码"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input
          v-model="queryParams.postName"
          placeholder="请输入岗位名称"
          clearable
          style="width: 200px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable style="width: 200px;">
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
          v-auth="['system:post:add']"
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
          v-auth="['system:post:edit']"
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
          v-auth="['system:post:remove']"
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
          v-auth="['system:post:export']"
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
      <RightToolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="岗位编号" align="center" prop="postId" />
      <el-table-column label="岗位编码" align="center" prop="postCode" />
      <el-table-column label="岗位名称" align="center" prop="postName" />
      <el-table-column label="岗位排序" align="center" prop="postSort" />
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
      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-auth="['system:post:edit']" link type="primary" @click="handleUpdate(scope.row)">
            <template #icon>
              <FaIcon name="i-ep:edit" />
            </template>
            修改
          </el-button>
          <el-button v-auth="['system:post:remove']" link type="primary" @click="handleDelete(scope.row)">
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

    <!-- 添加或修改岗位对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body>
      <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
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
