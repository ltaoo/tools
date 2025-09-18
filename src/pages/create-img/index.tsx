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
    ctx.font = `${width * 0.6}px sans-serif`;
    const sizeText = String(size);
    const { width: sizeTextWidth } = ctx.measureText(sizeText);
    ctx.fillText(sizeText, (width - sizeTextWidth) / 2, height * 0.56);
    ctx.font = `${width * 0.4}px monospace`;
    const typeText = unit;
    const { width: typeTextWidth } = ctx.measureText(typeText);
    ctx.fillText(typeText, (width - typeTextWidth) / 2, height * 0.89);
  }, [width, height, unit, size, type]);

  const download = useCallback(async () => {
    const $canvas = canvasRef.current;
    if ($canvas === null) {
      return;
    }
    renderPreview();
    const name = filename({
      width,
      height,
      size,
      unit,
      ext: type,
    });
    const [file, error] = await createImageWithCanvasAndTargetSize(
      $canvas,
      (() => {
        if (unit.toLowerCase() === "mb") {
          return Number(size) * 1024 * 1024;
        }
        if (unit.toLowerCase() === "kb") {
          return Number(size) * 1024;
        }
        return 0;
      })(),
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
            className="w-full"
            ref={canvasRef}
            width={width}
            height={height}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateImgPage;
