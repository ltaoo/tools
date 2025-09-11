/**
 * @file curl 解析
 * @reference https://jsfiddle.net/2Y587/80/
 */
import { useCallback, useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

import { base, Handler } from "@/domains/base";
import { parse } from "@/domains/curl/parser";
import { RequestBuilderModel } from "@/domains/request_builder/request_builder";

import { useViewModel } from "@/hooks";

fabric.FabricObject.ownDefaults.transparentCorners = false;

function CURLParseViewModel(props: {}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    parseCURL(content: string) {
      ui.$builder.parseCURLCommand(content);
    },
  };
  const ui = {
    $builder: RequestBuilderModel({}),
  };

  const _state = {
    get data() {
      return ui.$builder.state;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$builder.onStateChange(() => methods.refresh());

  return {
    methods,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type CURLParseViewModel = ReturnType<typeof CURLParseViewModel>;

interface IMemory {
  id: number;
  case: string;
}
const MemoryKey = "page_curl";
function getMemories(): IMemory[] {
  return JSON.parse(localStorage.getItem(MemoryKey) || "[]");
}
function updateMemories(nextMemories: IMemory[]) {
  return localStorage.setItem(MemoryKey, JSON.stringify(nextMemories));
}
const CurlParsePage = () => {
  const [case1, setCase1] = useState(
    (() => {
      const cachedCase1 = localStorage.getItem("curl") || "";
      return cachedCase1;
    })(),
  );
  const [existingMemories, setExistingMemories] = useState(getMemories());
  const [result, setResult] = useState<null | ReturnType<typeof parse>>(null);
  const { editor, onReady } = useFabricJSEditor();

  const [state, vm] = useViewModel(CURLParseViewModel, [{}]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const canvas = editor.canvas;
    // 画布拖拽相关变量
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;
    // 设置画布可以拖拽
    canvas.on("mouse:down", function (opt) {
      console.log("[]mouse:down", opt.target, opt.subTargets);
      const isClickObject = opt.target;
      if (isClickObject) {
        // console.log("[]mouse:down");
        return;
      }
      isDragging = true;
      canvas.defaultCursor = "grabbing";
      canvas.hoverCursor = "grabbing";
      const event = opt.e as MouseEvent;
      lastPosX = event.clientX;
      lastPosY = event.clientY;
      canvas.selection = false;
    });

    canvas.on("mouse:move", function (opt) {
      // console.log("[]mouse:move - ", isDragging, opt.target);
      if (!isDragging) {
        return;
      }
      const isClickObject = opt.target;
      if (isClickObject) {
        return;
      }
      const event = opt.e as MouseEvent;
      const currentPosX = event.clientX;
      const currentPosY = event.clientY;

      const deltaX = currentPosX - lastPosX;
      const deltaY = currentPosY - lastPosY;

      const vpt = canvas.viewportTransform;
      //   console.log("[]mouse:move - ", vpt, deltaX, deltaY);
      if (vpt) {
        vpt[4] += deltaX;
        vpt[5] += deltaY;

        // 限制拖拽边界，防止画布被拖拽到看不见的地方
        const zoom = canvas.getZoom();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const viewportWidth = canvasWidth / zoom;
        const viewportHeight = canvasHeight / zoom;
        canvas.setViewportTransform(vpt);
      }
      lastPosX = currentPosX;
      lastPosY = currentPosY;
    });

    canvas.on("mouse:up", function () {
      isDragging = false;
      canvas.defaultCursor = "grab";
      canvas.hoverCursor = "grab";
      canvas.selection = false;
    });

    // 触摸设备支持变量（为将来扩展预留）
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    // 启用鼠标滚轮缩放
    canvas.on("mouse:wheel", function (opt) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }, [editor]);

  const parseCurl = useCallback(
    (content) => {
      vm.methods.parseCURL(content);
      localStorage.setItem("curl", content);

      if (!editor) {
        return;
      }

      const r = parse(content);
      // 清空画布
      editor.canvas.clear();

      const canvas = editor.canvas;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // 设置画布背景
      const background = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
        fill: "#ffffff",
        selectable: false,
        evented: false,
      });
      canvas.add(background);

      let currentY = 30;
      const leftMargin = 30;
      const fieldWidth = canvasWidth - 60;
      const fieldHeight = 50;
      const spacing = 20;

      // 渲染 URL 字段 - 独占一行
      const urlGroup = createUrlField(
        r.url || "N/A",
        leftMargin,
        currentY,
        fieldWidth,
        fieldHeight + 12,
      );
      canvas.add(urlGroup);
      currentY += fieldHeight + spacing;

      // 渲染 Headers 字段 - 带缩进
      if (r.headers && Object.keys(r.headers).length > 0) {
        const { group: headersGroup, y } = renderHeaderFields(
          r.headers,
          leftMargin + 40, // 增加缩进
          currentY,
          fieldWidth - 80,
          fieldHeight,
        );
        canvas.add(headersGroup);
        currentY += y + spacing;
      }

      //       if (r.cookies && r.cookies.length > 0) {
      //         const { group: cookiesGroup, y } = createCookiesField(
      //           r.cookies,
      //           leftMargin + 40, // 增加缩进
      //           currentY,
      //           fieldWidth - 80,
      //           fieldHeight
      //         );
      //         canvas.add(cookiesGroup);
      //         currentY += y + spacing;
      //       }

      //       if (r.body && Object.keys(r.body).length > 0) {
      //         const { group: bodyGroup, y } = createBodyField(
      //           typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2),
      //           leftMargin + 40, // 增加缩进
      //           currentY,
      //           fieldWidth - 80,
      //           fieldHeight
      //         );
      //         canvas.add(bodyGroup);
      //         currentY += y + spacing;
      //       }

      canvas.setHeight(1200);

      // 启用画布交互功能
      canvas.selection = false;
      //       canvas.defaultCursor = "grab";
      //       canvas.hoverCursor = "grab";

      //       canvas.renderAll();
    },
    [editor],
  );

  // 创建 URL 字段
  const createUrlField = (
    url: string,
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    const group = new fabric.Group([], {
      left,
      top,
      selectable: false,
      evented: false,
    });

    // 背景矩形 - 使用渐变效果
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: new fabric.Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: width, y2: 0 },
        colorStops: [
          { offset: 0, color: "#667eea" },
          { offset: 1, color: "#764ba2" },
        ],
      }),
      rx: 12,
      ry: 12,
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.1)",
        blur: 10,
        offsetX: 0,
        offsetY: 4,
      }),
      selectable: false,
      evented: false,
    });

    // URL 标签
    const labelText = new fabric.Text("🌐 URL", {
      left: 20,
      top: 12,
      fontSize: 18,
      fontWeight: "bold",
      fill: "#ffffff",
      selectable: false,
      evented: false,
    });

    // URL 值
    const urlText = new fabric.Text(url, {
      left: 20,
      top: 35,
      fontSize: 14,
      fill: "#ffffff",
      selectable: false,
      evented: false,
      width: width - 40,
      wordWrap: "break-word",
    });

    group.add(bg);
    group.add(labelText);
    group.add(urlText);

    return group;
  };

  // 创建 Headers 字段
  const renderHeaderFields = (
    headers: Record<string, string>,
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    const group = new fabric.Group([], {
      left,
      top,
      stroke: "#e0f2fe",
      strokeWidth: 1,
      subTargetCheck: true,
      selectable: false,
      evented: true,
    });
    let cur_y = top;
    // 默认收起状态
    const bg = new fabric.Rect({
      left: left,
      top: cur_y,
      width,
      height,
      fill: "#f0f9ff",
      rx: 10,
      ry: 10,
      stroke: "#0ea5e9",
      strokeWidth: 1,
      //       shadow: new fabric.Shadow({
      //         color: "rgba(0,0,0,0.05)",
      //         blur: 5,
      //         offsetX: 0,
      //         offsetY: 2,
      //       }),
      selectable: false,
      evented: false,
    });
    cur_y += 12;
    // Headers 标签
    const labelText = new fabric.FabricText("📋 Headers", {
      left: left + 20,
      top: cur_y,
      fontSize: 16,
      fontWeight: "bold",
      fill: "#0ea5e9",
      selectable: false,
      evented: false,
    });

    cur_y += 16;
    // 显示 headers 数量
    const countText = new fabric.FabricText(
      `${Object.keys(headers).length} items`,
      {
        left: left + 20 + 24,
        top: cur_y,
        fontSize: 14,
        fill: "#0ea5e9",
        selectable: false,
        evented: false,
      },
    );

    cur_y += height / 2 - 10;
    const expandBtn = new fabric.Circle({
      left: width - 30,
      top: cur_y,
      radius: 12,
      fill: "#0ea5e9",
      selectable: true,
      evented: true,
      data: { type: "expand", field: "headers" },
      //       shadow: new fabric.Shadow({
      //         color: "rgba(0,0,0,0.1)",
      //         blur: 3,
      //         offsetX: 0,
      //         offsetY: 2,
      //       }),
    });

    cur_y += height / 2 - 10;
    //     const expandIcon = new fabric.FabricText("▶", {
    //       left: width - 30,
    //       top: cur_y,
    //       fontSize: 14,
    //       fill: "#ffffff",
    //       selectable: false,
    //       evented: false,
    //       originX: "center",
    //       originY: "center",
    //     });

    //     group.on("mousedown", (e) => {
    //       console.log("[]group.on mousedown", e);
    //     });
    //     expandBtn.on("mousemove", function () {
    //       console.log("[]expandBtn.on mousemove");
    //     });
    //     expandBtn.on("mousedown:before", function () {
    //       console.log("[]expandBtn.on click");
    //     });
    let isExpanded = false;
    // 添加展开事件
    expandBtn.on("mousedown", function () {
      console.log("[]expandBtn.on mousedown");
      //       const isExpanded = expandIcon.text === "▼";

      if (isExpanded) {
        isExpanded = true;
        editor?.canvas.setHeight(800);
        // 收起
        bg.set({ height: height });
        group.set({ height: height });
        countText.set({ visible: true });
        // 隐藏展开的内容
        const expandedItems = group.getObjects().filter((obj) => {
          const fabricObj = obj as any;
          return fabricObj.data && fabricObj.data.type === "header-item";
        });
        expandedItems.forEach((item) => item.set({ visible: false }));
      } else {
        isExpanded = false;
        // 展开
        // expandIcon.set({ text: "▼" });
        const headersList = Object.entries(headers);
        const newHeight = height + headersList.length * 35 + 20;
        bg.set({ height: newHeight });
        group.set({ height: newHeight });
        countText.set({ visible: false });

        // 显示每个 header
        headersList.forEach(([key, value], index) => {
          const headerBg = new fabric.Rect({
            left: 30,
            top: cur_y + height + index * 35,
            width: width - 60,
            height: 30,
            fill: "#ffffff",
            rx: 6,
            ry: 6,
            stroke: "#e0f2fe",
            strokeWidth: 1,
            selectable: false,
            evented: false,
            data: { type: "header-item" },
          });

          const headerText = new fabric.Text(`${key}: ${value}`, {
            left: 35,
            top: cur_y + height + index * 35 + 8,
            fontSize: 13,
            fill: "#0f172a",
            selectable: false,
            evented: false,
            data: { type: "header-item" },
          });

          group.add(headerBg);
          group.add(headerText);
        });
      }

      //       editor?.canvas.renderAll();
    });

    //     editor?.canvas.add(bg);
    //     editor?.canvas.add(labelText);
    //     editor?.canvas.add(countText);
    //     editor?.canvas.add(expandBtn);

    group.add(bg);
    group.add(labelText);
    group.add(countText);
    group.add(expandBtn);

    // group.add(expandIcon);

    return {
      group,
      y: cur_y,
    };
  };

  // 创建 Cookies 字段
  const createCookiesField = (
    cookies: { key: string; value: string }[],
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    let cur_y = top;
    const group = new fabric.Group([], {
      left,
      top: cur_y,
      subTargetCheck: true,
      selectable: false,
      evented: true,
    });

    // 默认收起状态
    const bg = new fabric.Rect({
      left: left,
      top: cur_y,
      width,
      height: height,
      fill: "#fef3c7",
      rx: 10,
      ry: 10,
      stroke: "#f59e0b",
      strokeWidth: 1,
      //       shadow: new fabric.Shadow({
      //         color: "rgba(0,0,0,0.05)",
      //         blur: 5,
      //         offsetX: 0,
      //         offsetY: 2,
      //       }),
      selectable: false,
      evented: false,
    });

    cur_y += 12;
    // Cookies 标签
    const labelText = new fabric.FabricText("🍪 Cookies", {
      left: left + 20,
      top: cur_y,
      fontSize: 16,
      fontWeight: "bold",
      fill: "#f59e0b",
      selectable: false,
      evented: false,
    });

    cur_y += 35;
    // 显示 cookies 数量
    const countText = new fabric.FabricText(`${cookies.length} items`, {
      left: left + 20,
      top: cur_y,
      fontSize: 14,
      fill: "#f59e0b",
      selectable: false,
      evented: false,
    });

    cur_y += height / 2 - 10;
    const expandBtn = new fabric.Circle({
      left: width - 30,
      top: cur_y,
      radius: 12,
      fill: "#f59e0b",
      selectable: true,
      evented: true,
      data: { type: "expand", field: "cookies" },
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.1)",
        blur: 3,
        offsetX: 0,
        offsetY: 2,
      }),
    });

    cur_y += height / 2 - 10;
    const expandIcon = new fabric.FabricText("▶", {
      left: width - 30,
      top: cur_y,
      fontSize: 14,
      fill: "#ffffff",
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    });

    // 添加展开事件
    expandBtn.on("mousedown", function () {
      const isExpanded = expandIcon.text === "▼";

      if (isExpanded) {
        // 收起
        expandIcon.set({ text: "▶" });
        bg.set({ height: height });
        group.set({ height: height });
        countText.set({ visible: true });
        // 隐藏展开的内容
        const expandedItems = group
          .getObjects()
          .filter(
            (obj) =>
              (obj as any).data && (obj as any).data.type === "cookie-item",
          );
        expandedItems.forEach((item) => item.set({ visible: false }));
      } else {
        // 展开
        expandIcon.set({ text: "▼" });
        const newHeight = height + cookies.length * 35 + 40;
        bg.set({ height: newHeight });
        group.set({ height: newHeight });
        countText.set({ visible: false });

        // 显示每个 cookie
        cookies.forEach((cookie, index) => {
          const cookieBg = new fabric.Rect({
            left: 30,
            top: cur_y + height + index * 35,
            width: width - 60,
            height: 30,
            fill: "#ffffff",
            rx: 6,
            ry: 6,
            stroke: "#fde68a",
            strokeWidth: 1,
            selectable: false,
            evented: false,
            data: { type: "cookie-item" },
          });

          const cookieText = new fabric.FabricText(
            `${cookie.key}=${cookie.value}`,
            {
              left: 35,
              top: cur_y + height + index * 35 + 8,
              fontSize: 13,
              fill: "#92400e",
              selectable: false,
              evented: false,
              data: { type: "cookie-item" },
            },
          );

          const deleteBtn = new fabric.Circle({
            left: width - 50,
            top: cur_y + height + index * 35 + 15,
            radius: 8,
            fill: "#ef4444",
            selectable: true,
            evented: true,
            data: { type: "delete", field: "cookies", index },
            shadow: new fabric.Shadow({
              color: "rgba(0,0,0,0.1)",
              blur: 2,
              offsetX: 0,
              offsetY: 1,
            }),
          });

          const deleteIcon = new fabric.FabricText("×", {
            left: width - 50,
            top: cur_y + height + index * 35 + 15,
            fontSize: 12,
            fill: "white",
            selectable: false,
            evented: false,
            originX: "center",
            originY: "center",
            data: { type: "cookie-item" },
          });

          group.add(cookieBg);
          group.add(cookieText);
          group.add(deleteBtn);
          group.add(deleteIcon);

          // 添加删除事件
          deleteBtn.on("mousedown", function () {
            deleteCookie(index);
          });
        });

        // 添加新增按钮
        const addBtn = new fabric.Rect({
          left: 30,
          top: cur_y + height + cookies.length * 35,
          width: 80,
          height: 30,
          fill: "#10b981",
          rx: 6,
          ry: 6,
          selectable: true,
          evented: true,
          data: { type: "add", field: "cookies" },
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.1)",
            blur: 2,
            offsetX: 0,
            offsetY: 1,
          }),
        });

        const addText = new fabric.Text("+ Add", {
          left: 35,
          top: cur_y + height + cookies.length * 35 + 8,
          fontSize: 12,
          fill: "white",
          selectable: false,
          evented: false,
          data: { type: "cookie-item" },
        });

        group.add(addBtn);
        group.add(addText);

        // 添加新增事件
        addBtn.on("mousedown", function () {
          addCookie();
        });
      }

      editor?.canvas.renderAll();
    });

    group.add(bg);
    group.add(labelText);
    group.add(countText);
    group.add(expandBtn);
    group.add(expandIcon);

    return { group, y: cur_y };
  };

  // 创建 Body 组
  const createBodyField = (
    body: string,
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    let cur_y = top;
    const group = new fabric.Group([], {
      left,
      top: cur_y,
      selectable: false,
      evented: true,
    });

    // 默认收起状态
    const bg = new fabric.Rect({
      left: 0,
      top: cur_y,
      width,
      height: height,
      fill: "#fce4ec",
      rx: 8,
      ry: 8,
      stroke: "#c2185b",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    cur_y += 10;
    const labelText = new fabric.Text("Body", {
      left: 15,
      top: cur_y,
      fontSize: 16,
      fontWeight: "bold",
      fill: "#c2185b",
      selectable: false,
      evented: false,
    });

    // 显示 body 预览（默认收起）
    cur_y += 25;
    const displayBody = body.length > 50 ? body.substring(0, 50) + "..." : body;
    const bodyText = new fabric.Text(displayBody, {
      left: 15,
      top: cur_y,
      fontSize: 12,
      fill: "#c2185b",
      selectable: false,
      evented: false,
      width: width - 30,
      wordWrap: "break-word",
    });

    const expandBtn = new fabric.Circle({
      left: width - 30,
      top: height / 2 - 10,
      radius: 10,
      fill: "#c2185b",
      selectable: true,
      evented: true,
      data: { type: "expand", field: "body" },
    });

    cur_y += height / 2 - 10;
    const expandIcon = new fabric.Text("▶", {
      left: width - 30,
      top: cur_y,
      fontSize: 12,
      fill: "#fce4ec",
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    });

    cur_y += height + 10;
    // 编辑按钮（默认隐藏）
    const editBtn = new fabric.Rect({
      left: 20,
      top: cur_y,
      width: 60,
      height: 25,
      fill: "#2196f3",
      rx: 4,
      ry: 4,
      selectable: true,
      evented: true,
      data: { type: "edit", field: "body" },
      visible: false,
    });

    cur_y += height + 15;
    const editText = new fabric.Text("Edit", {
      left: 25,
      top: cur_y,
      fontSize: 12,
      fill: "white",
      selectable: false,
      evented: false,
      visible: false,
    });

    group.add(bg);
    group.add(labelText);
    group.add(bodyText);
    group.add(expandBtn);
    group.add(expandIcon);
    group.add(editBtn);
    group.add(editText);

    // 添加编辑事件
    editBtn.on("mousedown", function () {
      editBody();
    });

    // 添加展开事件
    expandBtn.on("mousedown", function () {
      const isExpanded = expandIcon.text === "▼";

      if (isExpanded) {
        // 收起
        expandIcon.set({ text: "▶" });
        bodyText.set({ text: displayBody });
        bg.set({ height: height });
        group.set({ height: height });
        editBtn.set({ visible: false });
        editText.set({ visible: false });
      } else {
        // 展开
        expandIcon.set({ text: "▼" });
        bodyText.set({ text: body });
        const newHeight = Math.max(
          height,
          Math.ceil(body.length / 60) * 20 + height + 40,
        );
        bg.set({ height: newHeight });
        group.set({ height: newHeight });
        editBtn.set({ visible: true });
        editText.set({ visible: true });
      }

      editor?.canvas.renderAll();
    });

    return { group, y: cur_y };
  };

  // 字段展开/收起功能
  const toggleFieldExpansion = (
    field: string,
    fullValue: string,
    group: fabric.Group,
    bg: fabric.Rect,
    valueText: fabric.Text,
    expandIcon: fabric.Text,
  ) => {
    const isExpanded = expandIcon.text === "▼";

    if (isExpanded) {
      // 收起
      expandIcon.set({ text: "▶" });
      valueText.set({
        text:
          fullValue.length > 50
            ? fullValue.substring(0, 50) + "..."
            : fullValue,
      });
      bg.set({ height: 40 });
      group.set({ height: 40 });
    } else {
      // 展开
      expandIcon.set({ text: "▼" });
      valueText.set({ text: fullValue });
      const newHeight = Math.max(
        40,
        Math.ceil(fullValue.length / 60) * 20 + 40,
      );
      bg.set({ height: newHeight });
      group.set({ height: newHeight });
    }

    editor?.canvas.renderAll();
  };

  // 删除 cookie
  const deleteCookie = (index: number) => {
    if (result && result.cookies) {
      const newCookies = [...result.cookies];
      newCookies.splice(index, 1);
      setResult({ ...result, cookies: newCookies });
      // 重新渲染
      parseCurl(case1);
    }
  };

  // 添加 cookie
  const addCookie = () => {
    if (result) {
      const newCookie = { key: "new_key", value: "new_value" };
      const newCookies = [...(result.cookies || []), newCookie];
      setResult({ ...result, cookies: newCookies });
      // 重新渲染
      parseCurl(case1);
    }
  };

  // 编辑 body
  const editBody = () => {
    if (result && result.body) {
      const currentBody =
        typeof result.body === "string"
          ? result.body
          : JSON.stringify(result.body, null, 2);
      const newBody = prompt("Edit body:", currentBody);
      if (newBody !== null) {
        // 尝试解析为 JSON，如果失败则保持为字符串
        let parsedBody;
        try {
          parsedBody = JSON.parse(newBody);
        } catch {
          parsedBody = newBody;
        }
        setResult({ ...result, body: parsedBody });
        // 重新渲染
        parseCurl(case1);
      }
    }
  };

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Curl Parse</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入curl"
            value={case1}
            onChange={(event) => {
              const content = event.target.value;
              setCase1(content);
            }}
          />
        </div>
      </div>
      <div className="regexp flex space-x-2">
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            parseCurl(case1);
          }}
        >
          解析
        </button>
        <button
          className="py-1 px-4 rounded text-black"
          onClick={() => {
            if (!case1) {
              alert("必须输入 curl");
              return;
            }
            const existingMemories = getMemories();
            const timestamp = new Date().valueOf();
            const hasSameRegexpAndCase = existingMemories.find((memory) => {
              const { case: c } = memory;
              if (c === case1) {
                return true;
              }
              return false;
            });
            if (hasSameRegexpAndCase) {
              alert("已经有相同的 curl");
              return;
            }
            const memory = {
              id: timestamp,
              case: case1,
            };
            const nextMemories = [memory, ...existingMemories];
            updateMemories(nextMemories);
            setExistingMemories(nextMemories);
          }}
        >
          暂存
        </button>
      </div>
      <div className="panel">
        <div className="mb-4">
          <p className="text-lg">解析结果</p>
          {state.data.url ? (
            <div>
              <div className="text-2xl">{state.data.url}</div>
              <div>{state.data.method}</div>
              <div className="p-2">
                <div className="flex items-center space-x-2">
                  <div className="text-xl">Headers</div>
                  <div>{state.data.headers.length}</div>
                </div>
                <div className="ml-4">
                  <table>
                    <thead></thead>
                    <tbody>
                      {state.data.headers.map((v) => {
                        return (
                          <tr key={v.key}>
                            <td className="text-gray-500 whitespace-nowrap">
                              {v.key}
                            </td>
                            <td className="break-all">{v.value}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-2">
                <div className="flex items-center space-x-2">
                  <div className="text-xl">Cookies</div>
                  <div>{state.data.cookies.length}</div>
                </div>
                <div className="ml-4">
                  <table>
                    <thead></thead>
                    <tbody>
                      {state.data.cookies.map((v) => {
                        return (
                          <tr key={v.name}>
                            <td className="text-gray-500 whitespace-nowrap">
                              {v.name}
                            </td>
                            <td className="break-all">{v.value}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
          {/* <div className="flex space-x-2">
            <button
              className="py-2 px-3 rounded bg-blue-500 text-white text-sm"
              onClick={() => {
                if (editor) {
                  editor.canvas.setZoom(1);
                  editor.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                  editor.canvas.renderAll();
                }
              }}
            >
              重置视图
            </button>
            <button
              className="py-2 px-3 rounded bg-green-500 text-white text-sm"
              onClick={() => {
                if (editor) {
                  const zoom = editor.canvas.getZoom();
                  editor.canvas.setZoom(zoom * 1.2);
                  editor.canvas.renderAll();
                }
              }}
            >
              放大
            </button>
            <button
              className="py-2 px-3 rounded bg-yellow-500 text-white text-sm"
              onClick={() => {
                if (editor) {
                  const zoom = editor.canvas.getZoom();
                  editor.canvas.setZoom(zoom * 0.8);
                  editor.canvas.renderAll();
                }
              }}
            >
              缩小
            </button>
          </div> */}
        </div>
        {/* <div
          style={{
            width: "800px",
            height: "800px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <FabricJSCanvas className="sample-canvas" onReady={onReady} />
        </div> */}
      </div>
      <div className="py-12">
        <p className="mt-6">历史记录</p>
        <div className="mt-2 space-y-4">
          {existingMemories.map((memory) => {
            const { id, case: c } = memory;
            return (
              <div key={id} className="">
                <div className="py-2 px-4 bg-gray-100 rounded">
                  <div>{c}</div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-gray-400">
                      <span>{new Date(id).toLocaleDateString()}</span>
                      <span className="ml-4">
                        {new Date(id).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="py-1 px-2 text-sm rounded bg-gray-800 text-white"
                        onClick={() => {
                          setCase1(c);
                        }}
                      >
                        恢复
                      </button>
                      <button
                        className="py-1 px-2 text-sm rounded bg-gray-800 text-white"
                        onClick={() => {
                          const nextMemories = existingMemories.filter(
                            (memory) => memory.id !== id,
                          );
                          updateMemories(nextMemories);
                          setExistingMemories(nextMemories);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurlParsePage;
