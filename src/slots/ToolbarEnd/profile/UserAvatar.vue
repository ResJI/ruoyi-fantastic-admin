<script setup>
import userApi from '@/api/modules/user'
import useUserStore from '@/store/modules/user'
import FaIcon from '@/ui/components/FaIcon/index.vue'
import { ElMessage } from 'element-plus'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const Plus = defineComponent(h(FaIcon, { name: 'i-ep:plus' }))
const Minus = defineComponent(h(FaIcon, { name: 'i-ep:minus' }))
const RefreshLeft = defineComponent(h(FaIcon, { name: 'i-ep:refresh-left' }))
const RefreshRight = defineComponent(h(FaIcon, { name: 'i-ep:refresh-right' }))
const Upload = defineComponent(h(FaIcon, { name: 'i-ep:upload' }))

const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const open = ref(false)
const visible = ref(false)
const title = ref('修改头像')
const avatar = computed(() => userStore.avatar)

// 图片裁剪数据
const options = reactive({
  img: '', // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: 'png', // 默认生成截图为PNG格式
  filename: 'avatar', // 文件名称
  previews: {}, // 预览数据
})

watch(avatar, () => {
  if (options.img === '') {
    options.img = userStore.avatar
  }
}, { immediate: true })

/** 编辑头像 */
function editCropper() {
  open.value = true
}
/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true
}
/** 覆盖默认上传行为 */
function requestUpload() {}
/** 向左旋转 */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft()
}
/** 向右旋转 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight()
}
/** 图片缩放 */
function changeScale(num) {
  num = num || 1
  proxy.$refs.cropper.changeScale(num)
}
/** 上传预处理 */
function beforeUpload(file) {
  if (!file.type.includes('image/')) {
    proxy.$modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
  }
  else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result
      options.filename = file.name
    }
  }
}
/** 上传图片 */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob((data) => {
    const formData = new FormData()
    formData.append('avatarfile', data, options.filename)
    userApi.uploadAvatar(formData).then((response) => {
      open.value = false
      userStore.avatar = import.meta.env.VITE_APP_BASE_API + response.imgUrl
      ElMessage.success('修改成功')
      visible.value = false
    })
  })
}
/** 实时预览 */
function realTime(data) {
  options.previews = data
}
/** 关闭窗口 */
function closeDialog() {
  options.img = userStore.avatar
  options.visible = false
}
</script>

<template>
  <div class="user-info-head h-full w-full" @click="editCropper()">
    <img v-if="avatar.trim() !== ''" :src="avatar" title="点击上传头像" class="h-full w-full rounded-[50%]">
    <FaIcon v-else name="i-carbon:user-avatar-filled-alt" size="150px" class="text-gray-400" />
    <el-dialog
      v-model="open"
      :title="title"
      width="800px"
      append-to-body
      @opened="modalOpened"
      @close="closeDialog"
    >
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <VueCropper
            v-if="visible"
            ref="cropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            :output-type="options.outputType"
            @real-time="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }" class="flex items-center justify-center">
          <div class="avatar-upload-preview h-[200px] w-[200px] overflow-hidden rounded-[50%] shadow-2xl">
            <img :src="options.previews.url" :style="options.previews.img">
          </div>
        </el-col>
      </el-row>
      <br>
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              选择
              <el-icon class="el-icon--right">
                <Upload />
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button :icon="Plus" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="Minus" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshLeft" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshRight" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">
            提 交
          </el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
}

.user-info-head:hover::after {
  position: absolute;
  inset: 0;
  padding-left: calc(50% - 8px);
  font-size: 24px;
  font-style: normal;
  line-height: 150px;
  color: #eee;
  cursor: pointer;
  content: "+";
  background: rgb(0 0 0 / 50%);
  border-radius: 50%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
