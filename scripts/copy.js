const fs = require("fs");

function main() {
  fs.copyFileSync("./.nojekyll", "./dist/.nojekyll");
}

main();
