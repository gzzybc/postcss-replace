const Color = require('color');
const { BASE_VARIABLE } = require('./utils/files')
const rgba = /rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)/gi;
const MARK_RGBA = '_rgba'

const formatMessage = (decl) => {
  return `line: ${decl.source.start.line} column: ${decl.source.start.column}-${decl.source.end.column} ${decl.prop}: ${decl.value}\n`
}

const isRgba = (str) => {
  var reg = new RegExp("^" + MARK_RGBA + ".*");
  return reg.test(str)
}
const replaceRgba = (str) => {
  /**
   * 转换失败 需要还原
   * background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 25%,
    rgba(0, 0, 0, 0.09) 44%,
    rgba(117, 90, 90, 0.05) 88%
  )
   */
  let result = {from:[]}
  result.to = str.replace(rgba, (rs) => {
    const color = Color(rs)
    result.from.push(rs)
    return `${MARK_RGBA}|${color.hex()}|${color.alpha()}`
  })
  return result
}
const transformRgba = (str) => {
  const result = str.split("|")
  const hex = result[1]
  const alpha = result[2]
  return [hex, alpha]

}

const transformColor = (value) => {
  try {
    return Color(value).hex()
  } catch (error) {
    return value
  }
}
const transformValue = (decl, variable, error = []) => {

  const { to: _value, from } = replaceRgba(decl.value.toString())

  const getResult = (value, variable) => {
    let table = variable.get(decl.prop)
    if (!table.has(value)) {
      // 尝试全局变量转换
      table = variable.get(BASE_VARIABLE)
    }
    if (table.has(value)) {
      return table.get(value)
    }
    /**
     * 消除 已经修改的报错
     */
    if ([...table.values(), ...variable.get(decl.prop).values()].includes(value)) {
      return value
    }

    throw new Error(decl)
  }
  let error_flag = false
  //  split 无法处理rgba 待升级 
  const result = _value.split(" ").filter(item => item && item.trim()).map(value => {
    try {
      let cloneValue = value
      // transparent 关键字不处理
      if (cloneValue === "transparent") return cloneValue
      if (isRgba(cloneValue)) {
        const origin = from.shift()
        try {
          const [color, alpha] = transformRgba(cloneValue)
          return `rgba(${getResult(color, variable)}, ${alpha})`
        } catch (error) {
          error_flag = true
          return origin
        }
      }
      const color = transformColor(cloneValue)
      return getResult(color, variable)
    } catch (error) {
      error_flag = true
      return value
    }
  }).join(' ')

  if (error_flag) {
    error.push(formatMessage(decl))
  }
  return result
}



/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  // Work with options here

  const {
    mapTable,
    variableMap,
    type,
    error,
    variable
  } = opts

  return {
    postcssPlugin: 'postcss-replace-key',
    Root(root) {
      root.walkDecls(decl => {
        // 获取变量规则
        if (type === "rule" && decl.value.includes('!default')) {
          let value = decl.value.replaceAll('!default', "").trim()
          value = transformColor(value)
          variableMap.set(decl.prop, value)
        }
        // 替换值
        if (type === 'replace' && variable.has(decl.prop)) {
          // 转换规则
          const str = transformValue(decl, variable, error)
          decl.value = str
        }

      })
      root.walkAtRules((atRule => {
        if (type === "rule" && atRule.name === 'function') {
          atRule.walk(node => {
            if (node.type === 'decl') {
              try {
                /**
                 * 获取函数名
                 */
                const functionName = atRule.params.replace(/(\().*?(\))/, "")
                /**
                 * 获取函数名能处理的css 属性
                 */
                const funcs = Array.isArray(mapTable[functionName]) ? mapTable[functionName] : mapTable[functionName].attr
                if (!Array.from(funcs)) throw new Error('暂无映射关系')

                /**
                 * 新增的函数 参数
                 */
                const variableTable = mapTable[functionName].argument || {}
                const variableTableKeys = Object.keys(variableTable)
                let str = variableTableKeys.map(key => {
                  const _new = `'${key}': ${variableTable[key]}`
                  /**
                   * TODO: 略有不妥
                   * 如果存在就不添加了
                   */
                  if (node.value.includes(_new)) {
                    return null
                  }
                  return `${_new},`
                }).filter(Boolean).join("\n ")
                // 去除map的括号
                str = str + node.value.replace(/["(]|[)"]/g, "")
                /**
                 * 给当前函数 写入新的变量参数
                 */
                variableTableKeys.length > 0 && node.assign({
                  prop: node.prop,
                  value: '(' + str + ')'
                })
                // 去除函数名的引号
                const value = str.replace(/"|'|\r\n/g, "")
                // 解析构成对象
                const result = value.split(',').map(item => item.split(':'))
                result.map(item => {
                  funcs.map(key => {
                    variable.get(key).set(item[1].trim(), atRule.params.replace(/(\().*?(\))/, `$1'${item[0].trim()}'$2`))
                  })
                })
              } catch (err) {
                error.push(formatMessage(node))
              }
            }
          })
        }
      }))
    }
  }
}

module.exports.postcss = true