const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "../");
const DIST_DIR = path.resolve(BASE_DIR, "dist");

const TIP_HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>常用工具集</title>
</head>

<body>
  <div>本域名已废弃，请使用下面域名访问</div>
  <a href="http://tools.funzm.com/">http://tools.funzm.com/</a>
</body>

</html>`;

function run() {
  try {
    fs.mkdirSync(DIST_DIR);
  } catch (err) {}
  fs.writeFileSync(path.resolve(DIST_DIR, "index.html"), TIP_HTML_CONTENT);
}
run();
