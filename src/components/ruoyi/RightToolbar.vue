<script setup>
const props = defineProps({
  /* 是否显示检索条件 */
  showSearch: {
    type: Boolean,
    default: true,
  },
  /* 显隐列信息 */
  columns: {
    type: Array,
  },
  /* 是否显示检索图标 */
  search: {
    type: Boolean,
    default: true,
  },
  /* 显隐列类型（transfer穿梭框、checkbox复选框） */
  showColumnsType: {
    type: String,
    default: 'checkbox',
  },
  /* 右外边距 */
  gutter: {
    type: Number,
    default: 10,
  },
})

const emits = defineEmits(['update:showSearch', 'queryTable'])

// 显隐数据
const value = ref([])
// 弹出层标题
const title = ref('显示/隐藏')
// 是否显示弹出层
const open = ref(false)

const style = computed(() => {
  const ret = {}
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`
  }
  return ret
})

// 搜索
function toggleSearch() {
  emits('update:showSearch', !props.showSearch)
}

// 刷新
function refresh() {
  emits('queryTable')
}

// 右侧列表元素变化
function dataChange(data) {
  for (const item in props.columns) {
    const key = props.columns[item].key
    // eslint-disable-next-line vue/no-mutating-props
    props.columns[item].visible = !data.includes(key)
  }
}

// 打开显隐列dialog
function showColumn() {
  open.value = true
}

if (props.showColumnsType === 'transfer') {
  // 显隐列初始默认隐藏列
  for (const item in props.columns) {
    if (props.columns[item].visible === false) {
      value.value.push(Number.parseInt(item))
    }
  }
}

// 勾选
function checkboxChange(event, label) {
  props.columns.filter(item => item.label === label)[0].visible = event
}
</script>

<template>
  <div class="top-right-btn" :style="style" style="margin-left: auto;">
    <el-row>
      <el-tooltip v-if="search" class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
        <el-button circle @click="toggleSearch()">
          <template #icon>
            <FaIcon name="i-ep:search" />
          </template>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button circle @click="refresh()">
          <template #icon>
            <FaIcon name="i-ep:refresh" />
          </template>
        </el-button>
      </el-tooltip>
      <el-tooltip v-if="columns" class="item" effect="dark" content="显隐列" placement="top">
        <el-button v-if="showColumnsType === 'transfer'" circle @click="showColumn()">
          <template #icon>
            <FaIcon name="i-ep:menu" />
          </template>
        </el-button>
        <el-dropdown v-if="showColumnsType === 'checkbox'" trigger="click" :hide-on-click="false" style="padding-left: 12px;">
          <el-button circle>
            <template #icon>
              <FaIcon name="i-ep:menu" />
            </template>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <template v-for="item in columns" :key="item.key">
                <el-dropdown-item>
                  <el-checkbox :checked="item.visible" :label="item.label" @change="checkboxChange($event, item.label)" />
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </el-row>
    <el-dialog v-model="open" :title="title" append-to-body>
      <el-transfer
        v-model="value"
        :titles="['显示', '隐藏']"
        :data="columns"
        @change="dataChange"
      />
    </el-dialog>
  </div>
</template>

<style lang='scss' scoped>
:deep(.el-transfer__button) {
  display: block;
  margin-left: 0;
  border-radius: 50%;
}

:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}

:deep(.el-dropdown-menu__item) {
  padding: 0 17px;
  line-height: 30px;
}
</style>
