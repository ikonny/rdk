
var fs = require('fs');

var args = normalizeArgs(process.argv.slice(2));
global.args = args;
if (args.hasOwnProperty('h')) {
    printUsageAndExit('');
}
if (!args.v || !args.c) {
    printUsageAndExit('version(-v) and code home(-c) is required!');
}
args.c.forEach(folder => {
    if (!fs.existsSync(folder)) {
        printUsageAndExit('code home[' + folder + '] do not exist!');
    }
    if (!fs.lstatSync(folder).isDirectory()) {
        printUsageAndExit('code home[' + folder + '] should be a directory!');
    }
})

console.log('code home:  ' + args.c);
console.log('version:    ' + args.v);
console.log('extensions: ' + args.e);
console.log('excludes:   ' + args.x);
var reFileMatcher = new RegExp(args.e.join('|').replace(/(\w+)/g, '(\\.$1$)'), 'i');

console.log('-------------------------------------------');
args.c.forEach(folder => processFiles(folder));

function processFiles(dir) {
    var files = fs.readdirSync(dir);
    files.forEach(file => {
        var path = `${dir}/${file}`;
        var stat = fs.lstatSync(path);
        if (stat.isDirectory()) {
            processFiles(path);
        } else if (args.x.indexOf(file) == -1 && file.match(reFileMatcher)) {
            console.log('renamming: ' + path);

            var newFile = path.replace(/(.+)(\.\w+?)$/i, '$1-' + args.v + '$2');
            fs.rename(path, newFile)
        }
    })
}

function normalizeArgs(argv) {
    var res = {};
    for (var i = 0; i < argv.length; i++) {
        var arg = argv[i];
        var match = arg.match(/-(\w+)/);
        if (!match) {
            continue;
        }
        var prop = match[1];
        res[prop] = argv[i+1];
    };
    res.e = res.e ? res.e.split(/\s*,\s*/g) : ['js', 'html', 'css'];
    res.x = res.x ? res.x.split(/\s*,\s*/g) : ['index.html'];
    res.c = res.c ? res.c.split(/\s*,\s*/g) : [];
    res.c = res.c.map(folder => folder.match(/[\\\/]\s*$/) ? folder.substring(0, res.c.length-1) : folder);
    return res;
}

function printUsageAndExit(msg) {
    if (msg) {
        console.log(msg);
        console.log();
    }
    console.log('Usage:');
    console.log('  add-version-info -v version -c code-home [-e extensions] [-x excludes] [-h]');
    console.log('     -v 是版本号，例如1.1.1。注意0.0.0是rdk保留的版本号，请别使用。');
    console.log('     -c 是待转换源码所在根，如果需要同时处理多不同根路径的话，请用英文逗号隔开，例如 script1/aa,script2/bb,script3/cc');
    console.log('     -e 是需要处理的文件的扩展名，默认值是 js,html,css。多个扩展名请用英文逗号隔开');
    console.log('     -x 是不需要处理的文件列表，默认值是 index.html。多个文件请用英文逗号隔开');
    console.log('     -h 显示这些信息');
    process.exit(1);
}
