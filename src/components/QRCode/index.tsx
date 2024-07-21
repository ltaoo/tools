import React, { useEffect, useRef } from "react";

import { CanvasDrawing } from "@/domains/qrcode";
// @ts-ignore
import { QRCode as QRCodeCore } from "@/domains/qrcode/core";

export function QRCode(
  props: {
    text?: string;
    width: number;
    height: number;
  } & React.HTMLAttributes<HTMLCanvasElement>
) {
  const { text, width, height, ...rest } = props;

  const ref = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasDrawing>(null);

  useEffect(() => {
    const $canvas = ref.current;
    console.log("before if (!$canvas");
    if (!$canvas) {
      return;
    }
    const ctx = $canvas.getContext("2d");
    console.log("before if (!ctx");
    if (!ctx) {
      return;
    }
    const drawer = new CanvasDrawing({ width, height, ctx });
    // @ts-ignore
    ctxRef.current = drawer;
    console.log("before if (!$text1");
    if (!text) {
      return;
    }
    (async () => {
      // @ts-ignore
      const model: QRCode = await new QRCodeCore({ width, height }).fetchModel(
        text,
        {
          width,
          height,
        }
      );
      drawer.draw(model);
    })();
  }, []);
  useEffect(() => {
    const drawer = ctxRef.current;
    console.log("before if (!drawer");
    if (!drawer) {
      return;
    }
    console.log("before if (!text2", text, `'${text}'`);
    if (!text) {
      return;
    }
    (async () => {
      // @ts-ignore
      const model: QRCode = await new QRCodeCore({ width, height }).fetchModel(
        text,
        {
          width,
          height,
        }
      );
      drawer.draw(model);
    })();
  }, [text]);

  return (
    <div
      className="relative"
      style={{ width, height, backgroundColor: "#f8f9fa" }}
    >
      <div className="absolute inset-0"></div>
      <canvas {...rest} ref={ref} width={width} height={height} />
    </div>
  );
}
