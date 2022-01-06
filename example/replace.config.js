module.exports = {
  rule: {
    from: './rule',
    transform: {
      'get-animation-time': ['animation-time'],
      'get-font-color': {
        attr: ['color'],
        argument: {
          color333: '$color333'
        }
      },
      'get-base-color': {
        attr: ['border-color', 'border', 'background', 'background-color'],
        argument: {
          color456: '$mall-color-456',
          color789: '$mall-color-789'
        }
      },
      'get-status-color': ['get-status-color'],
      'get-font-size': {
        attr: ['font-size'],
        argument: {
          // 参数名称  变量名称
          fontSize100: '$font-size-100'
        }
      },
      'get-z-index': ['z-index']
    },
    variableFile: '2.scss',
    /**
     * 是否以变量形式替换
     */
    isReplaceVariable: true,
    variable: {
      $index: 100,
      $red: 'red',
      '$mall-color-456': '#456',
      '$font-size-100': '100px',
      $color333: '#333'
    }
  },
  target: {
    from: './style',
    to: '../dist'
  },
  /**
   * 错误日志地址 默认 node_modules/.scss-replace-error
   */
  errorPath: '.'
}

// other.scss

/**
 * new file
 *  other.scss
 * $mall-color-456: "#456" !default,
 * source
 * .demo{ background-color: #456;}
 * target
 * .demo{ background-color: get-base-color($color456);}
 * isReplaceVariable: true,
 * .demo{color: red}
 * target 
 * .demo
 *
 */
