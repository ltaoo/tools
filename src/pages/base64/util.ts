/**
 * 将图片/SVG转换为Data URL
 * @param {string|File|HTMLImageElement|HTMLCanvasElement|SVGElement} source - 图片源
 * @param {string} [type] - 指定输出类型，如'image/png', 'image/jpeg', 'image/webp'
 * @param {number} [quality] - 图片质量(0-1)，仅对JPEG/WebP有效
 * @returns {Promise<string>} 返回Promise，解析为Data URL字符串
 */
export function convertToDataURL(
  source: unknown,
  type: string,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 处理File对象
    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error("文件读取失败"));
      reader.readAsDataURL(source);
      return;
    }
    // 处理URL字符串或Data URL
    if (typeof source === "string") {
      // 如果已经是Data URL，直接返回
      if (source.startsWith("data:")) {
        resolve(source);
        return;
      }
      // 检查是否是SVG字符串
      if (source.trim().startsWith("<svg")) {
        processSvgString(source, type, quality).then(resolve).catch(reject);
        return;
      }
      // 如果是URL字符串，先加载图片
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () =>
        processImageElement(img, type, quality).then(resolve).catch(reject);
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = source;
      return;
    }

    // 处理DOM元素
    if (
      source instanceof HTMLImageElement ||
      source instanceof HTMLCanvasElement ||
      source instanceof SVGElement
    ) {
      processImageElement(source, type, quality).then(resolve).catch(reject);
      return;
    }

    reject(new Error("不支持的源类型"));
  });
}

/**
 * 处理图片元素转换为Data URL
 */
export function processImageElement(
  element: unknown,
  type: string,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject("未知错误");
        return;
      }

      // 如果是SVG元素，需要特殊处理
      if (element instanceof SVGElement) {
        const svgStr = new XMLSerializer().serializeToString(element);
        const svgBlob = new Blob([svgStr], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL(type, quality));
        };
        img.onerror = () => reject(new Error("SVG渲染失败"));
        img.src = url;
        return;
      }
      const $image = element as HTMLImageElement;
      // 处理普通图片和canvas
      canvas.width = $image.width;
      canvas.height = $image.height;
      ctx.drawImage($image, 0, 0);
      resolve(canvas.toDataURL(type, quality));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 处理SVG字符串转换为Data URL
 */
function processSvgString(
  svgStr: string,
  type: string,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 创建一个临时div来解析SVG字符串
      const div = document.createElement("div");
      div.innerHTML = svgStr;
      const svgElement = div.querySelector("svg");

      if (!svgElement) {
        throw new Error("无效的SVG字符串");
      }

      // 使用已有的SVG元素处理逻辑
      processImageElement(svgElement, type, quality)
        .then(resolve)
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
