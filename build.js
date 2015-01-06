var fs = require("fs");
var browserify = require("browserify");
var to5ify = require("6to5ify");

var options = {
    fullPaths: false,
    standalone: "iframeOverlay"
};

browserify(options)
    .transform(to5ify)
    .require("./src/iframe-overlay.js", { entry: true })
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(fs.createWriteStream("./dist/iframe-overlay.js"));
