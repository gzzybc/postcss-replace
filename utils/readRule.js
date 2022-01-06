const { fs, writeFileSync, readDirSync, BASE_VARIABLE } = require("./files");

const postcssScss = require("postcss-scss");
const plugin = require("../index.js");
const Path = require("path");
const postcss = require("postcss");

const getRule = (config) => {
    /**
     * 默认支持变量替换
     */
    const { isReplaceVariable = true } = config;
    try {
        if (!config) throw new Error("请配置 rule 属性");
        if (!config.from)
            throw new Error(`必须配置规则目录,新规则也将生成到该目录`);
        const variable = new Map();
        const variableMap = new Map();
        let mapTable = config.transform || {};
        for (let value of Object.values(mapTable)) {
            let _value = value;
            if (!Array.isArray(value)) {
                _value = value.attr;
            }
            _value.map((item) => variable.set(item, new Map()));
        }

        // 写入规则
        {
            const variableArray = Object.keys(config.variable || {}).map((key) => {
                // TODO: 必须是$ 开头的变量
                if (/^\$.*/.test(key)) {
                    return `${key}: ${config.variable[key]} !default; \n`; //[key, config.variable[key]]
                }
                console.warn(
                    `scss变量必须以$开头 ${key}: ${config.variable[key]} 已经被忽略`
                );
                return null;
            });
            writeFileSync(
                config.newFileDir,
                config.newFilename,
                variableArray.filter((item) => item !== null).join("")
            );
        }

        const paths = readDirSync(config.from);
        for (const file of paths) {
            const data = fs.readFileSync(file.path, "utf-8");
            const error = new Array();
            postcss([
                plugin({
                    variable,
                    mapTable,
                    variableMap,
                    error,
                    type: "rule",
                }),
            ])
                .process(data, {
                    from: undefined,
                    syntax: postcssScss,
                })
                .then((result) => {
                    writeFileSync(file.dirPath, file.filename, result.css);
                });
            if (error.length > 0) {
                const p = Path.relative(config.configPath, file.dirPath);
                writeFileSync(
                    Path.join(config.configPath, config.errorPath, p),
                    file.filename,
                    error.join("")
                );
            }
        }
        // eslint-disable-next-line no-unused-vars
        for (const [_, value] of variable) {
            for (const [key2, value2] of value) {
                if (variableMap.get(key2)) {
                    value.set(variableMap.get(key2), value2);
                }
            }
        }

        {
            /**
             * 是否需要构造 变量替换规则
             */
            const _vm = new Map();
            if (isReplaceVariable) {
                for (const [key, value] of variableMap) {
                    _vm.set(value, key);
                }
            }
            variable.set(BASE_VARIABLE, _vm);
        }
        return variable;
    } catch (error) {
        console.error(error && error.message);
    }
};

module.exports = {
    getRule,
    BASE_VARIABLE,
};
