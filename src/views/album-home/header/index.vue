<script setup lang="ts">
import { computed } from "vue"; // 导入 computed
import { useSiteConfigStore } from "@/store/modules/siteConfig"; // 导入站点配置 Store

defineOptions({
  name: "HeaderComponent" // 给组件一个有意义的名字
});

const siteConfigStore = useSiteConfigStore();

// 计算属性，从 Pinia Store 获取站点配置
const siteConfig = computed(() => siteConfigStore.getSiteConfig);

// 动态获取网站名称
const siteName = computed(() => siteConfig.value?.APP_NAME || "鱼鱼相册");

// 动态获取关于链接
const aboutLink = computed(() => siteConfig.value?.ABOUT_LINK || "#");

// 动态获取 ICP 备案号
const icpNumber = computed(() => siteConfig.value?.ICP_NUMBER || "");
</script>

<template>
  <header id="header">
    <a style="cursor: pointer">
      <img
        class="site-logo"
        :src="
          siteConfig?.USER_AVATAR ||
          'https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg'
        "
        alt="网站Logo"
      />
    </a>
    <h1>
      <a style="cursor: pointer"
        ><strong>{{ siteName }}</strong></a
      >
    </h1>
    <nav>
      <ul class="nav_links">
        <li class="nav-item">
          <a style="cursor: pointer" :href="aboutLink" target="_blank">关于</a>
        </li>
        <li class="nav-item">
          <a
            class="footer-bar-link"
            target="_blank"
            rel="noopener external nofollow noreferrer"
            href="https://beian.miit.gov.cn/"
            :title="icpNumber"
            >{{ icpNumber }}
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
/* 关键帧动画 */
@keyframes header-slide-up {
  to {
    transform: translateY(0);
  }
}

@keyframes header-fade-in {
  to {
    opacity: 1;
  }
}

#header {
  position: fixed;
  top: calc(100vh - 80px);
  left: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  padding: 0 1.5em;
  line-height: 1;
  user-select: none;

  /* 基础样式 */
  background: rgb(18 18 18 / 80%);
  backdrop-filter: saturate(180%) blur(20px);
  opacity: 0;

  /* 过渡效果（用于其他交互） */
  transition: transform 1s ease;

  /* 初始状态 */
  transform: translateY(4em);

  /* 动画效果 */
  animation:
    header-slide-up 0.8s ease-out 1s forwards,
    header-fade-in 0.6s ease-in 1s forwards;

  /* 减少运动设置 */
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: translateY(0);
    animation: none;
  }

  h1 {
    display: flex;
    align-items: center;
    height: 4em;
    margin: 0;
    font-size: 1em;
    line-height: 4.5em;
    color: #a0a0a1;
    vertical-align: middle;

    a {
      line-height: 1;
      color: inherit;
      border: 0;

      &:hover {
        color: inherit !important;
      }
    }
  }

  nav {
    margin-left: auto;

    > ul {
      display: flex;
      padding: 0;
      margin: 0;
      list-style: none;

      > li {
        position: relative;
        display: flex;
        justify-content: center;
        padding: 0;
        list-style-type: none;

        &.nav-item {
          .nav-item-child {
            position: absolute;
            bottom: 64px;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: fit-content;
            padding: 8px;
            margin-bottom: 0;
            pointer-events: none;
            background: rgb(0 0 0 / 60%);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            opacity: 0;
            transition: 0.3s;

            > ul {
              padding-left: 0;
            }

            &::before {
              position: absolute;
              bottom: -40px;
              left: 0;
              width: 100%;
              height: 40px;
              content: "";
            }
          }

          &:hover {
            .nav-item-child {
              display: flex;
              pointer-events: all;
              opacity: 1;
            }
          }

          .category-parent {
            font-size: 14px;
            border-radius: 6px;
            transition: 0.3s;

            &:hover {
              background: #0d00ff;
            }

            &.category-level-0 {
              width: 100%;
              text-align: center;

              a {
                width: 100%;
                text-align: center;
              }
            }
          }
        }

        a {
          display: inline-block;
          padding: 8px 16px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
          cursor: pointer;
          border: 0;
          border-radius: 8px;
          transition: background-color 0.5s ease;

          &.icon {
            &::before {
              float: right;
              margin-left: 0.75em;
              color: #505051;
            }
          }

          &:hover {
            color: #fff !important;
            background: #ffffff1e;
          }

          &.active {
            background-color: #30343f;
          }
        }
      }
    }
  }

  .discription {
    margin-left: 8px;
  }

  .site-logo {
    width: 30px;
    height: 30px;
    margin-right: 1rem;
    border-radius: 20px;
  }

  @media screen and (width <= 736px) {
    top: 0;
    bottom: auto;
    height: 60px;
    padding: 0 1em;
    transform: translateY(0);

    .nav-item {
      font-size: 0.7em;
    }

    h1 {
      font-size: 0.8em;
      color: #fff;
      display: none !important;
    }
  }
}
</style>
