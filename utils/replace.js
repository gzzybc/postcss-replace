
const { fs, writeFileSync, readDirSync } = require('./files')
const postcssScss = require('postcss-scss')
const plugin = require('../index.js')
const Path = require("path");
const postcss = require("postcss");
const picocolors = require('picocolors')

const replace = (config, {
    variable,
}) => {
    try {
        if (!config.from) throw new Error('请定义目标文件夹')
        const paths = readDirSync(config.from)
        for (const file of paths) {
            const error = new Array()
            const data = fs.readFileSync(file.path, 'utf-8');
            const p = Path.relative(config.configPath, file.dirPath)
            postcss([plugin({
                variable,
                error,
                type: 'replace'
            })]).process(data, {
                from: undefined,
                syntax: postcssScss
            }).then(result => {
                writeFileSync(Path.join(config.to || "", p), file.filename, result.css)
            })
            if (error.length > 0) {
                error.unshift(file.path + '\n')
                const outPath = Path.join(config.configPath, config.errorPath)
                console.log('\n 替换失败文件地址->');
                console.log(picocolors.red(outPath));
                console.log();
                writeFileSync(Path.join(outPath, p), file.filename, error.join(''))
            }
        }
    } catch (error) {
        console.error(error && error.message);
    }
}

module.exports = {
    replace
}
