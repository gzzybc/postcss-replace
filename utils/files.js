const Path = require("path");
const fs = require('fs')
/**
 * 获取文件夹下所有文件路径
 * @returns
 * @param path
 */
function readDirSync(path) {
    const result = []
        //获取目录下所有文件及文件夹
        const help = function (path) {
            const pa = fs.readdirSync(path);
            pa.forEach(function (ele) {
                const _path = `${path}/${ele}`
                const info = fs.statSync(_path);
                if (info.isDirectory()) {
                    help(_path)
                } else {
                    if(/\.(scss)$/.test(ele)){
                    result.push({
                        path: _path,
                        dirPath: path,
                        filename: ele
                    })
                    }
                }
            })
        }
        help(path)
    return result
}

function writeFilSync(dirPath,filename="", source) {
    try {
        fs.writeFileSync(Path.join(dirPath, filename), source)
    } catch (error) {
        fs.mkdirSync(dirPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
        fs.writeFileSync(Path.join(dirPath, filename), source)
    }

}

function appendFileSync(dirPath, filename="", source) {
    try {
        fs.appendFileSync(Path.join(dirPath, filename), source)
    } catch (error) {
        fs.mkdirSync(dirPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
        fs.appendFileSync(Path.join(dirPath, filename), source)
    }

}

const BASE_VARIABLE = "_base_variable"
module.exports = {
    appendFileSync,
    readDirSync,
    writeFilSync,
    fs,
    Path,
    BASE_VARIABLE
}
