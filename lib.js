#!/usr/bin/env node
const picocolors = require('picocolors')

try {
    const { Path } = require("./utils/files");
    const args = process.argv.slice(2)
    let relative = './example/replace.config.js'
    if (args.length>0) {
        relative = args[0]
    }
    const configPath = Path.join(process.cwd(), relative)
    const config = require(configPath);
    const {
        getRule
    } = require("./utils/readRule");
    const {
        replace
    } = require("./utils/replace");

    /**
     * config.errorPath === '.' 会覆盖原始文件
     * 默认会生成跟配置文件同一个目录下
     */
    if (config.errorPath === '.' || !config.errorPath) {
        config.errorPath = '.scss-replace-error'
    }
    /**
    * 处理新变量
    */
    const rule = config.rule
    let newFile = {}
    if (rule.variableFile) {
        newFile = Path.parse(rule.variableFile)
    }

    const getAbsolutePath = ((configPath) => (filePath="") => Path.join(Path.dirname(configPath), filePath))(configPath)

    rule.from = getAbsolutePath(config.rule.from)

    const variable = getRule(Object.assign(rule, {
        errorPath: config.errorPath,
        configPath: getAbsolutePath(),
        newFileDir: Path.join(rule.from, newFile.dir || ""),
        newFilename: (newFile.name || 'newScss') + '.scss'
    }))

    replace(Object.assign(config.target, {
        errorPath: config.errorPath,
        configPath: getAbsolutePath(),
        from: getAbsolutePath(config.target.from),
        to: getAbsolutePath(config.target.to),
    }), {
        variable
    })

    console.log(picocolors.green('\n replace Completed'));
} catch (e) {
    console.log();
    console.log(picocolors.red(`请添加配置文件replace.config.js`))
    console.log();
}

