/**
 * 生成二维码
 */
import { QRCode } from "./core";

type CanvasDrawingProps = {
  width: number;
  height: number;

  ctx: CanvasRenderingContext2D;
};
interface QRCode {
  getModuleCount(): number;
  isDark(x: number, y: number): boolean;
}
/**
 * Drawing QRCode by using canvas
 *
 * @constructor
 * @param {Object} htOption QRCode Options
 */
export class CanvasDrawing {
  /** canvas 绘制上下文 */
  ctx: CanvasRenderingContext2D;
  /** 是否绘制完成 */
  isPainted = false;

  options: {
    width: number;
    height: number;
  };

  constructor(options: CanvasDrawingProps) {
    const { ctx } = options;
    this.options = options;
    this.ctx = ctx;
  }

  /**
   * 绘制 logo
   */
  //   async drawLogo(img) {
  //     const ctx = this.ctx;
  //     return new Promise((resolve, reject) => {
  //       const image = document.createElement("img");
  //       image.src = img;
  //       image.crossOrigin = "anonymous";
  //       image.onload = (event) => {
  //         const { target } = event;
  //         // (256 / 2) - (48 / 2) === 104
  //         const size = 54;
  //         const x = 256 / 2 - size / 2;
  //         ctx.drawImage(image, x, x, size, size);
  //         resolve();
  //       };
  //       image.onerror = () => {
  //         resolve(Result.Err("Logo 加载失败"));
  //       };
  //     });
  //   }
  /**
   * Draw the QRCode
   *
   * @param {QRCode} model
   */
  draw(model: QRCode) {
    const { ctx } = this;
    const { options } = this;
    const nCount = model.getModuleCount();
    const nWidth = options.width / nCount;
    const nHeight = options.height / nCount;
    const nRoundedWidth = Math.round(nWidth);
    const nRoundedHeight = Math.round(nHeight);

    this.clear();

    for (let row = 0; row < nCount; row++) {
      for (let col = 0; col < nCount; col++) {
        const isDark = model.isDark(row, col);
        const nLeft = col * nWidth;
        const nTop = row * nHeight;
        ctx.strokeStyle = isDark ? "#000000" : "#ffffff";
        ctx.lineWidth = 1;
        ctx.fillStyle = isDark ? "#000000" : "#ffffff";
        ctx.fillRect(nLeft, nTop, nWidth, nHeight);
        // console.log(Math.floor(nLeft), Math.floor(nTop), isDark, ctx.fillStyle);
        ctx.strokeRect(
          Math.floor(nLeft) + 0.5,
          Math.floor(nTop) + 0.5,
          nRoundedWidth,
          nRoundedHeight
        );
        ctx.strokeRect(
          Math.ceil(nLeft) - 0.5,
          Math.ceil(nTop) - 0.5,
          nRoundedWidth,
          nRoundedHeight
        );
      }
    }
    this.isPainted = true;
  }

  /**
   * Make the image from Canvas if the browser supports Data URI.
   */
  // makeImage() {
  //   if (this._bIsPainted) {
  //     _safeSetDataURI.call(this, _onMakeImage);
  //   }
  // }

  /**
   * Clear the QRCode
   */
  clear() {
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    this.isPainted = false;
  }

  /**
   * @private
   * @param {Number} nNumber
   */
  round(nNumber: number) {
    if (!nNumber) {
      return nNumber;
    }

    return Math.floor(nNumber * 1000) / 1000;
  }
}

export async function createQRCode(text: string, options: CanvasDrawingProps) {
  const { width, height } = options;
  const drawer = new CanvasDrawing(options);
  // @ts-ignore
  const model: QRCode = await new QRCode({ width, height }).fetchModel(
    text,
    options
  );
  drawer.draw(model);
}
