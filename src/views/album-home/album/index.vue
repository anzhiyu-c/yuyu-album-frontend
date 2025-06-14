<!--
 * @Description:
 * @Author: 安知鱼
 * @Date: 2025-04-09 12:31:32
 * @LastEditTime: 2025-06-11 13:10:21
 * @LastEditors: 安知鱼
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import AzImage from "@/components/AzImage";
import AzImagePreview from "@/components/AzImagePreview";
import Download from "@/assets/svg/downloads.svg";
import { publicWallpapert } from "@/api/album-home";
import { message } from "@/utils/message";

defineOptions({
  name: "album"
});

const loadedImages = ref<boolean[]>([]);
const previewRef = ref<InstanceType<typeof AzImagePreview>>();

const handleImageLoad = () => {
  loadedImages.value.splice(0, 24, ...Array(24).fill(true));
};

// 存储相册图片数据
const wallpapers = ref<any[]>([]);
// 分页相关
const totalItems = ref<number>(0);
const currentPage = ref<number>(1);
const pageSize = ref<number>(24);

// 请求相册图片列表
const fetchWallpapers = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    };

    const res = await publicWallpapert(params);

    if (res.code === 200) {
      wallpapers.value = res.data.list;
      totalItems.value = res.data.total;
    }
  } catch (error) {
    message("请求错误" + error, {
      type: "error"
    });
  }
};

const handlePreview = index => {
  previewRef.value?.open(wallpapers.value, index);
};

// 监听分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // 平滑滑动到顶部
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });
  fetchWallpapers();
};

const handleDownload = item => {
  previewRef.value?.downImage(item);
};

// 在组件加载时请求数据
onMounted(() => {
  fetchWallpapers();
});
</script>

<template>
  <div id="wrapper">
    <div id="main">
      <div
        v-for="(item, index) in wallpapers"
        :key="item.id"
        :class="{ loaded: loadedImages[index], thumb: true }"
      >
        <AzImage
          :src="item.imageUrl"
          :preview-src-list="wallpapers"
          fit="cover"
          lazy
          @load="handleImageLoad"
          @open-preview="handlePreview(index)"
        />

        <div class="link" @click="handleDownload(item)">
          <Download style="transform: scale(0.8)" />
          <span>下载</span>
        </div>

        <h2>{{ item.width + " x " + item.height }}</h2>
        <div v-if="item.tags" class="tag-info">
          <span class="tag-categorys">
            <a
              v-for="(tag, index) in item.tags.split(',')"
              :key="index"
              href="/"
              class="tag"
            >
              {{ tag.trim() }}
            </a>
          </span>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="an-pagination">
        <el-pagination
          v-if="totalItems > 0"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="total, prev, pager, next, jumper"
          size="large"
          @current-change="handlePageChange"
        />
      </div>

      <AzImagePreview ref="previewRef" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
#wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 0 4em;
  transition: filter 0.5s ease;

  #main {
    display: flex;
    flex-wrap: wrap;
    transition: filter 0.5s ease;
    -webkit-tap-highlight-color: rgb(255 255 255 / 0%);

    /* 减少运动偏好 */
    @media (prefers-reduced-motion: reduce) {
      .thumb {
        opacity: 1 !important;
        transition: none !important;
      }
    }

    /* 响应式设计 */

    @media screen and (width <= 1680px) {
      div.thumb {
        width: 33.3333%;
      }
    }

    @media screen and (width <= 1280px) {
      div.thumb {
        width: 50%;
      }
    }

    @media screen and (width <= 980px) {
      div.thumb {
        height: calc(28.5714vh - 1.3333em);
        min-height: 18em;
      }
    }

    @media screen and (width <= 736px) {
      h2 {
        font-size: 1em;
      }

      h3 {
        font-size: 0.9em;
      }

      h4 {
        font-size: 0.8em;
      }

      h5 {
        font-size: 0.7em;
      }

      h6 {
        font-size: 0.7em;
      }

      form > .fields {
        width: calc(100% + 3em);
        margin: -1.5em 0 2em -1.5em;
      }

      form > .fields > .field {
        width: calc(100% - 1.5em);
        padding: 1.5em 0 0 1.5em;
      }

      form > .fields > .field.half {
        width: calc(100% - 1.5em);
      }

      form > .fields > .field.third {
        width: calc(100% - 1.5em);
      }

      form > .fields > .field.quarter {
        width: calc(100% - 1.5em);
      }

      .panel {
        top: calc(4em - 1px);
        bottom: auto;
        padding: 4em 2em 2em;
        transform: translateY(-100vh);
      }

      .panel.active {
        transform: translateY(0);
      }

      .nav-item .nav-item-child {
        top: 30px;
      }

      body {
        padding: 60px 0 0;
      }

      .pagination-container {
        gap: 6px;
      }

      .page-btn {
        min-width: 36px;
        height: 36px;
        padding: 0 12px;
        font-size: 13px;
      }

      .prev-btn,
      .next-btn {
        padding: 0 15px;
      }
    }

    @media screen and (width <= 480px) {
      div.thumb {
        width: 100%;
      }
    }

    .an-pagination {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin: 20px 0 40px;
      clear: both;
      text-align: center;

      :deep(.el-pager) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0 5px;

        li {
          margin: 0 5px;
        }
      }
    }

    .thumb {
      /* stylelint-disable at-rule-no-unknown */
      @for $i from 1 through 24 {
        &:nth-child(#{$i}) {
          transition-delay: 0.65s + ($i - 1) * 0.15s;
        }
      }

      position: relative;
      width: 25%;
      height: calc(40vh - 2em);
      min-height: 20em;
      overflow: hidden;
      pointer-events: auto;
      opacity: 0; // 初始透明
      transition: opacity 1.25s ease-in-out;
      -webkit-tap-highlight-color: rgb(255 255 255 / 0%);
      /* stylelint-enable at-rule-no-unknown */

      // 当图片加载完成后显示
      &.loaded {
        opacity: 1;
      }

      /* 渐变遮罩 */
      &::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        content: "";
        background: linear-gradient(
          to top,
          rgb(10 17 25 / 35%) 5%,
          transparent 35%
        );
      }

      /* 标题 */
      > h2 {
        position: absolute;
        bottom: 16px;
        left: 16px;
        z-index: 1;
        margin: 0;
        font-size: 14px;
        font-weight: bold;
        color: #fff;
        pointer-events: none;
      }

      .link {
        position: absolute;
        right: 16px;
        bottom: 16px;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 10px 4px 4px;
        margin: 0;
        font-size: 14px;
        font-weight: bold;
        color: #fff;
        cursor: pointer;
        background: rgb(0 0 0 / 80%);
        border-radius: 5px;

        &:hover {
          background: #0d00ff;
        }
      }
    }

    :deep(.el-pager li.is-active),
    :deep(.el-pager li:hover) {
      color: #fff;
      background: #0d00ff;
      transition: 0.2s;
    }

    :deep(.el-pagination button.is-active),
    :deep(.el-pagination button:hover) {
      color: #0d00ff;
    }

    /* 遮罩层 */
    &::after {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      pointer-events: none;
      visibility: hidden;
      content: "";
      background: rgb(36 38 41 / 25%);
      opacity: 0;
      transition:
        opacity 0.5s ease,
        visibility 0.5s;
    }

    .tag-info {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 1;
      display: flex;
      gap: 16px;
      align-items: center;
      margin: 0;
      font-size: 14px;
      font-weight: bold;
      color: #fff;
      pointer-events: none;
    }

    .tag-categorys {
      display: flex;
    }

    .tag-categorys a {
      z-index: 1;
      padding: 8px;
      margin-top: 12px;
      margin-left: 12px;
      font-size: 12px;
      line-height: 1;
      color: #f7f7fa;
      background: rgb(0 0 0 / 30%);
      backdrop-filter: saturate(180%) blur(20px);
      border-radius: 8px;
      transition: 0.3s;
    }

    .tag-categorys a:hover {
      color: #fff;
      background: #0d00ff;
    }
  }
}
</style>
