import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import {
  getWallpapertList,
  addWallpapert,
  updateWallpaper,
  deleteWallpaper
} from "@/api/album-home";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "./types";
import { deviceDetection } from "@pureadmin/utils";
import type { PaginationProps, LoadingConfig } from "@pureadmin/table";

export function useDept() {
  const form = reactive({
    createdAt: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const columns: TableColumnList = [
    {
      label: "id",
      prop: "id",
      minWidth: 70
    },
    {
      label: "图片URL",
      prop: "imageUrl",
      minWidth: 70
    },
    {
      label: "大图",
      prop: "bigImageUrl",
      minWidth: 70
    },
    {
      label: "下载地址",
      prop: "downloadUrl",
      minWidth: 70
    },
    {
      label: "大图参数",
      prop: "bigParam",
      minWidth: 70
    },
    {
      label: "缩略参数",
      prop: "thumbParam",
      minWidth: 70
    },
    {
      label: "标签",
      prop: "tags",
      minWidth: 70
    },
    {
      label: "查看次数",
      prop: "viewCount",
      minWidth: 70
    },
    {
      label: "图片大小",
      prop: "fileSize",
      minWidth: 70,
      formatter: (row: any) => {
        const size = row.fileSize;
        if (size >= 1024 * 1024) {
          return (size / 1024 / 1024).toFixed(2) + " MB";
        } else if (size >= 1024) {
          return (size / 1024).toFixed(2) + " KB";
        } else {
          return size + " B";
        }
      }
    },
    {
      label: "长宽比",
      prop: "aspectRatio",
      minWidth: 70
    },
    {
      label: "下载次数",
      prop: "downloadCount",
      minWidth: 70
    },
    {
      label: "宽*高",
      prop: "widthAndHeight",
      minWidth: 90
    },
    {
      label: "创建时间",
      minWidth: 150,
      prop: "createdAt",
      formatter: ({ createdAt }) =>
        dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    form.createdAt = null; // 清空时间筛选
    onSearch();
  }

  async function onSearch() {
    loading.value = true;

    const { currentPage, pageSize } = pagination;

    const { data } = await getWallpapertList({
      page: currentPage,
      pageSize: pageSize,
      createdAt: form.createdAt
    });

    dataList.value = data.list;
    pagination.total = data.total;
    pagination.currentPage = data.pageNum;
    pagination.pageSize = data.pageSize;

    setTimeout(() => {
      loading.value = false;
    }, 300);
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}图片`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          imageUrl: row?.imageUrl ?? "",
          bigImageUrl: row?.bigImageUrl ?? "",
          downloadUrl: row?.downloadUrl ?? "",
          thumbParam: row?.thumbParam ?? "",
          bigParam: row?.bigParam ?? "",
          tags: (() => {
            const tags: any = row?.tags;
            if (tags === undefined || tags === null) return [];
            if (Array.isArray(tags)) return tags;
            if (typeof tags === "string")
              return tags
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
            return [];
          })(),
          viewCount: row?.viewCount ?? 1,
          downloadCount: row?.downloadCount ?? 0
        }
      },
      width: "50%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      sureBtnLoading: true,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options, closeLoading }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了一张图片`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }

        function getImageMeta(url: string): Promise<{
          width: number;
          height: number;
          fileSize: number;
          format: string;
          aspectRatio: string;
          fileHash: string; // 新增哈希值返回
        }> {
          return new Promise(async (resolve, reject) => {
            if (!url) {
              reject(new Error("图片 URL 不能为空。"));
              return;
            }

            const img = new Image();
            img.crossOrigin = "Anonymous"; // 跨域图片需要
            // const hashCache: Record<string, string> = {}; // 缓存哈希值 - 考虑在更高层级管理缓存

            img.onload = async function () {
              const width = img.width;
              const height = img.height;
              const aspectRatio = reduceRatio(width, height);

              // 获取文件大小和格式
              let fileSize = 0;
              let format = "unknown";
              let fileHash = "";

              try {
                const res = await fetch(url);
                if (!res.ok) {
                  console.warn(
                    `获取图片元数据失败，来自 ${url}: ${res.status} ${res.statusText}`
                  );
                  resolve(getDefaultMetadata());
                  return;
                }
                const blob = await res.blob();
                fileSize = blob.size;

                // 获取文件格式
                const extension = url.split(".").pop()?.toLowerCase();
                format = extension || "unknown";

                // 获取文件哈希值
                fileHash = await getFileHash(blob);

                resolve({
                  width,
                  height,
                  fileSize,
                  format,
                  aspectRatio,
                  fileHash // 返回哈希值
                });
              } catch (error) {
                console.warn(
                  `获取或处理来自 ${url} 的图片数据时发生错误:`,
                  error
                );
                resolve(getDefaultMetadata());
              } finally {
                // 清理图片对象以释放资源
                img.onload = null;
                img.onerror = null;
              }
            };

            img.onerror = function () {
              console.warn(`加载来自 ${url} 的图片失败`);
              resolve(getDefaultMetadata());
              // 清理图片对象
              img.onload = null;
              img.onerror = null;
            };

            img.src = url;
          });
        }

        // 比例化简函数
        function reduceRatio(width: number, height: number): string {
          if (width === 0 || height === 0) {
            return "0:0";
          }
          const gcd = (a: number, b: number): number =>
            b === 0 ? a : gcd(b, a % b);
          const factor = gcd(width, height);
          return `${width / factor}:${height / factor}`;
        }

        // 计算文件哈希值（使用 SHA-256 作为示例）
        async function getFileHash(blob: Blob): Promise<string> {
          try {
            const buffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest("SHA-256", buffer); // 使用 SHA-256 算法计算哈希
            const hashArray = Array.from(new Uint8Array(hashBuffer)); // 转换为字节数组
            const hashHex = hashArray
              .map(byte => byte.toString(16).padStart(2, "0"))
              .join(""); // 转为十六进制字符串
            return hashHex;
          } catch (error) {
            console.error("计算文件哈希值时发生错误:", error);
            return ""; // 失败时返回空哈希值
          }
        }

        // 默认的元数据返回值
        function getDefaultMetadata() {
          return {
            width: 0,
            height: 0,
            fileSize: 0,
            format: "unknown",
            aspectRatio: "0:0",
            fileHash: ""
          };
        }

        FormRef.validate(async valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              // 🧠 获取图片宽高并写入 curData
              const imageInfo = await getImageMeta(curData.imageUrl);
              addWallpapert({
                ...curData,
                ...imageInfo
              }).then(res => {
                if (res.code === 200) {
                  chores();
                } else {
                  message(res.message, { type: "error" });
                  closeLoading();
                }
              });
            } else {
              updateWallpaper(curData).then(res => {
                if (res.code === 200) {
                  chores();
                } else {
                  message(res.message, { type: "error" });
                }
              });
            }
          }
        });
      }
    });
  }

  function handleDelete(row) {
    deleteWallpaper(row).then(res => {
      if (res.code === 200) {
        message(`您删除了图片id为${row.id}的这条数据`, {
          type: "success"
        });
        onSearch();
      } else {
        message(res.message, { type: "error" });
      }
    });
  }

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    pageSizes: [10, 12, 24, 50, 100],
    total: 0,
    align: "right",
    background: true,
    size: "default",
    style: {
      paddingRight: "20px"
    }
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  function onSizeChange(val) {
    pagination.pageSize = val;
    pagination.currentPage = 1; // 切换页容量后回到首页
    onSearch();
  }

  function onCurrentChange(val) {
    pagination.currentPage = val;
    loadingConfig.text = `正在加载第${val}页...`;
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSizeChange,
    onCurrentChange,
    loadingConfig,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改图片 */
    openDialog,
    /** 删除图片 */
    handleDelete
  };
}
