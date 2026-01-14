/**
 * @file 图片在线生成
 */
import { useRef, useCallback, useEffect } from "react";

import PageLayout from "@/components/PageLayout";
import { useValue } from "@/hooks";

function createFileHasSpecialSize(size: number) {
  const buffer = new ArrayBuffer(size);
  const longInt8View = new Uint8Array(buffer);
  for (var i = 0; i < longInt8View.length; i++) {
    longInt8View[i] = i % 255;
  }
  return buffer;
}
function downloadImage(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const $a = document.createElement("a");
  $a.download = name;
  $a.href = url;
  $a.click();
}
function createImageWithCanvasAndTargetSize(
  $canvas: HTMLCanvasElement,
  targetSize: number,
): Promise<[Blob | null, Error | null]> {
  return new Promise((resolve, reject) => {
    $canvas.toBlob((blob) => {
      if (blob === null) {
        reject([null, new Error("$canvas create blob failed.")]);
        return;
      }
      const { size } = blob;
      const target = targetSize;
      const remaining = target - size;
      if (remaining < 0) {
        reject([
          null,
          new Error("目标文件大小已小于该宽高下的最小图片大小，生成失败"),
        ]);
        return;
      }
      const padding = createFileHasSpecialSize(remaining);
      blob.arrayBuffer().then((buf) => {
        const file = new Blob([buf, padding]);
        resolve([file, null]);
        // download(file);
      });
    });
  });
}
function filename({
  width,
  height,
  size,
  unit,
  ext,
}: {
  width?: number;
  height?: number;
  size: number;
  unit: string;
  ext: string;
}) {
  return `${width}x${height}-${size}${unit}.${ext}`;
}
function calcWidthAndHeightByUnitAndSize({
  size,
  unit,
}: {
  size: number;
  unit: "MB" | "KB";
}) {
  // if ()
}

function validateFileSize({
  width,
  height,
  targetSize,
  format,
}: {
  width: number;
  height: number;
  targetSize: number;
  format: string;
}): { isValid: boolean; message?: string } {
  // 估算最小文件大小（基于像素数量和格式）
  const pixelCount = width * height;
  let minEstimatedSize = 0;

  switch (format.toLowerCase()) {
    case "png":
      // PNG 最小大小大约是像素数量的 1/10（非常粗略的估计）
      minEstimatedSize = Math.max(pixelCount * 0.1, 1000);
      break;
    case "jpg":
    case "jpeg":
      // JPEG 最小大小大约是像素数量的 1/50
      minEstimatedSize = Math.max(pixelCount * 0.02, 500);
      break;
    case "bmp":
      // BMP 最小大小是像素数量 * 3 (RGB) + header
      minEstimatedSize = pixelCount * 3 + 54;
      break;
    default:
      minEstimatedSize = 1000;
  }

  if (targetSize < minEstimatedSize) {
    return {
      isValid: false,
      message: `目标文件大小太小。对于 ${width}x${height} 的${format.toUpperCase()}图片，最小建议大小约为 ${Math.ceil(minEstimatedSize / 1024)}KB`,
    };
  }

  return { isValid: true };
}
function rgb2hex(rgb: [number, number, number]) {
  return rgb
    .map((v) => {
      const r = v.toString(16);
      if (r.length < 2) {
        return `0${r}`;
      }
      return r;
    })
    .join("");
}

const CreateImgPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [width, onWidthChange, setWidth] = useValue(200);
  const [height, onHeightChange, setHeight] = useValue(200);
  const [unit, onUnitChange] = useValue("MB");
  const [size, onSizeChange] = useValue(2, {});
  const [type, onTypeChange] = useValue("png");

  const renderPreview = useCallback(() => {
    if (ctxRef.current === null) {
      return;
    }
    // console.log("[PAGE]renderPreview ", width, height);
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f1f2f3";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "black";

    const sizeText = String(size);
    const typeText = unit;

    // 智能计算最优字体大小，最大化空间利用率
    const calculateOptimalFontSize = () => {
      // 创建临时canvas来精确测量文字
      const measureCanvas = document.createElement("canvas");
      const measureCtx = measureCanvas.getContext("2d")!;

      // 智能字体大小计算函数
      const calculateFontSize = (
        targetWidth: number,
        targetHeight: number,
        text: string,
        font: string = "sans-serif",
      ) => {
        let fontSize = Math.min(targetWidth * 0.8, targetHeight * 0.8);
        let minFontSize = Math.max(targetWidth * 0.1, 8);

        // 二分查找最优字体大小
        while (fontSize > minFontSize) {
          measureCtx.font = `bold ${fontSize}px ${font}`;
          const metrics = measureCtx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = fontSize; // 近似高度

          if (
            textWidth <= targetWidth * 0.95 &&
            textHeight <= targetHeight * 0.9
          ) {
            break;
          }
          fontSize -= 2;
        }

        return Math.max(fontSize, minFontSize);
      };

      // 两行布局：每行占用一半高度减去间距
      const lineHeight = (height * 0.9) / 2;
      const twoLineSize = calculateFontSize(
        width * 0.95,
        lineHeight,
        sizeText,
        "sans-serif",
      );
      const twoLineType = calculateFontSize(
        width * 0.95,
        lineHeight,
        typeText,
        "monospace",
      );

      // 一行布局：使用整个高度
      const oneLineSize = calculateFontSize(
        width * 0.6,
        height * 0.9,
        sizeText,
        "sans-serif",
      );
      const oneLineType = calculateFontSize(
        width * 0.35,
        height * 0.9,
        typeText,
        "monospace",
      );

      return { twoLineSize, twoLineType, oneLineSize, oneLineType };
    };

    const fontSizes = calculateOptimalFontSize();

    // 测试一行显示是否能容纳
    ctx.font = `bold ${fontSizes.oneLineSize}px sans-serif`;
    const sizeTextWidth = ctx.measureText(sizeText).width;
    ctx.font = `bold ${fontSizes.oneLineType}px monospace`;
    const typeTextWidth = ctx.measureText(typeText).width;
    const totalWidthForOneLine = sizeTextWidth + typeTextWidth + width * 0.05; // 减小间距

    // 智能布局判断：优先垂直排列
    // 计算总文字高度，判断是否足够垂直排列
    const totalTextHeight =
      fontSizes.oneLineSize + fontSizes.oneLineType + height * 0.1;
    const heightAllowsVertical = height > totalTextHeight * 1.3; // 高度足够时优先垂直
    const widthRequiresVertical = totalWidthForOneLine > width * 0.95; // 宽度不够时垂直
    const aspectRatio = width / height;
    const isPortrait = aspectRatio < 0.8; // 竖图优先垂直

    // 判断布局方式：优先考虑垂直排列
    const useTwoLines =
      heightAllowsVertical || widthRequiresVertical || isPortrait;

    if (useTwoLines) {
      // 两行显示 - 垂直居中
      ctx.font = `bold ${fontSizes.twoLineSize}px sans-serif`;
      const adjustedSizeWidth = ctx.measureText(sizeText).width;
      // 第一行：图片高度的40%位置
      ctx.fillText(sizeText, (width - adjustedSizeWidth) / 2, height * 0.4);

      ctx.font = `bold ${fontSizes.twoLineType}px monospace`;
      const adjustedTypeWidth = ctx.measureText(typeText).width;
      // 第二行：图片高度的70%位置
      ctx.fillText(typeText, (width - adjustedTypeWidth) / 2, height * 0.7);
    } else {
      // 一行显示 - 水平垂直都居中
      const spacing = width * 0.03; // 3%间距
      const totalTextWidth = sizeTextWidth + typeTextWidth + spacing;
      const startX = (width - totalTextWidth) / 2;

      // 使用baseline对齐，确保垂直居中
      const centerY = height * 0.5;

      ctx.font = `bold ${fontSizes.oneLineSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(sizeText, startX, centerY);

      ctx.font = `bold ${fontSizes.oneLineType}px monospace`;
      ctx.textBaseline = "middle";
      ctx.fillText(typeText, startX + sizeTextWidth + spacing, centerY);

      // 恢复默认baseline
      ctx.textBaseline = "alphabetic";
    }
  }, [width, height, unit, size, type]);

  useEffect(() => {
    const $canvas = canvasRef.current;
    if ($canvas === null) {
      return;
    }
    const ctx = $canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    ctxRef.current = ctx;
    renderPreview();
  }, []);

  // 自动更新预览当参数改变时
  useEffect(() => {
    renderPreview();
  }, [width, height, unit, size, type, renderPreview]);

  const download = useCallback(async () => {
    const $canvas = canvasRef.current;
    if ($canvas === null) {
      return;
    }
    renderPreview();

    const targetSizeBytes = (() => {
      if (unit.toLowerCase() === "mb") {
        return Number(size) * 1024 * 1024;
      }
      if (unit.toLowerCase() === "kb") {
        return Number(size) * 1024;
      }
      return 0;
    })();

    // 验证文件大小
    const validation = validateFileSize({
      width,
      height,
      targetSize: targetSizeBytes,
      format: type,
    });

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    const name = filename({
      width,
      height,
      size,
      unit,
      ext: type,
    });
    const [file, error] = await createImageWithCanvasAndTargetSize(
      $canvas,
      targetSizeBytes,
    );
    if (error) {
      alert(error.message);
      return;
    }
    downloadImage(file!, name);
  }, [width, height, size, unit, type]);

  return (
    <PageLayout title="ImageCreate">
      <div className="flex space-x-2">
        <input
          className="input"
          placeholder="请输入宽度"
          value={width}
          onChange={onWidthChange}
        />
        <input
          className="input"
          placeholder="请输入高度"
          value={height}
          onChange={onHeightChange}
        />
        <input
          className="input"
          placeholder="请输入文件大小"
          value={size}
          onChange={onSizeChange}
        />
        <select
          className="input w-24"
          placeholder="请输入文件大小"
          value={unit}
          onChange={onUnitChange}
        >
          <option>KB</option>
          <option>MB</option>
        </select>
        <select
          className="input w-24"
          placeholder="请输入文件大小"
          value={type}
          onChange={onTypeChange}
        >
          <option>png</option>
          <option>jpg</option>
          <option>jpeg</option>
          <option>bmp</option>
        </select>
        <button className="btn btn--primary" onClick={renderPreview}>
          预览
        </button>
        <button className="btn btn--primary" onClick={download}>
          下载
        </button>
      </div>
      <div className="mt-8">
        <div className="w-120">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              maxWidth: "100%",
              height: "auto",
              aspectRatio: `${width}/${height}`,
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateImgPage;
