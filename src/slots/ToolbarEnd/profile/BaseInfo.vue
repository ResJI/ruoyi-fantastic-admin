<script setup lang="ts">
import userApi from '@/api/modules/user.ts'
import useUserStore from '@/store/modules/user.ts'
import { ElMessage } from 'element-plus'
import UserAvatar from './UserAvatar.vue'

const userStore = useUserStore()

const form = ref({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '',
})

watch(
  [
    () => userStore.nickName,
    () => userStore.phoneNumber,
    () => userStore.email,
    () => userStore.sex,
  ],
  (info) => {
    form.value = {
      nickName: info[0],
      phonenumber: info[1],
      email: info[2],
      sex: info[3],
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  await userApi.updateUserProfile(form.value)
  ElMessage.success('保存成功')
}
</script>

<template>
  <div w-full flex>
    <div mr-4 h-full w-0 flex-1>
      <ElForm :model="form" label-width="80px" label-suffix="：" @submit.prevent="handleSubmit">
        <ElFormItem label="昵 称">
          <ElInput v-model="form.nickName" placeholder="请输入你的名称" />
        </ElFormItem>
        <ElFormItem label="手机号">
          <ElInput v-model="form.phonenumber" placeholder="请输入你的手机号" />
        </ElFormItem>
        <ElFormItem label="邮箱">
          <ElInput v-model="form.email" placeholder="请输入你的 QQ 号" />
        </ElFormItem>
        <ElFormItem>
          <el-radio-group v-model="form.sex" size="small">
            <el-radio value="0" border class="mr-[15px]">
              男
            </el-radio>
            <el-radio value="1" border>
              女
            </el-radio>
          </el-radio-group>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" native-type="submit">
            保存
          </ElButton>
        </ElFormItem>
      </elform>
    </div>
    <div h-150px w-150px>
      <UserAvatar />
    </div>
  </div>
</template>
