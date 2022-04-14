const END_FLAG = "__SAFE_INVOKE_END__";

/**
 * 创建一个 worker 执行指定函数
 * @param f
 * @param params
 * @returns
 */
export function createWorker(f: Function, ...params: any[]) {
  const blob = new Blob([
    `;var records = [];var value = (${f.toString()}).apply(null, ${params});self.postMessage({ type: '${END_FLAG}', value: records });self.close();`,
  ]);
  const url = window.URL.createObjectURL(blob);
  const worker = new Worker(url);
  return worker;
}

/**
 * 函数执行器，支持超出指定时长后终止函数执行
 * @param delay
 * @returns
 */
export function safeInvokeWrap(delay: number) {
  return (fn: Function, ...params: any[]) => {
    return new Promise((resolve, reject) => {
      const worker = createWorker(fn, JSON.stringify(params));

      const timer = setTimeout(() => {
        worker.terminate();
        worker.onmessage = null;
        reject(new Error("方法执行超时"));
      }, delay);
      worker.onerror = (error) => {
        reject(error);
      };
      worker.onmessage = (event) => {
        const {
          data: { type, value },
        } = event;
        if (type === END_FLAG) {
          clearTimeout(timer);
          resolve(value);
          return;
        }
      };
    });
  };
}

/**
 * 根据字符串创建函数
 * @param content
 * @returns
 */
export function generateFn(content: string) {
  //   const lines = content.split("\n");
  //   const functionDeclaration = lines[0];
  //   const paramsMatchResult = functionDeclaration.match(/\((.+)+\)/);
  //   const params = paramsMatchResult
  //     ? paramsMatchResult[1].split(",").map((str) => str.trim())
  //     : [];
  //   const body = lines.slice(1, lines.length - 1).join("\n");
  //   console.log(params, body);
  //   const fn = new Function(...params, body);

  const code = content.replace(/console\.log\(([^\)]*)\)/g, "records.push($1)");
  return new Function(code);
}
