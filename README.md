# scss-replace


这是一个可以简单生成和替换scss变量的脚本.

## Usage
  **Step 1:** npx:
  - npx scss-replace *.config.js

## Usage
  **Step 2:** Install plugin:
  - npm install scss-replace



## example
```js
module.exports = {
  rule: {
    /**
     * 规则读取
     * 新增的函数变量 会插入到rule相应的文件中
     */
    from: './rule',
    transform: {
      'get-font-color': {
        attr: ['color'],
        argument: {
          red: '$red'
        }
      },
    },
    /**
     * 新增变量的文件地址
     */
    variableFile: 'newFile.scss',
    /**
     * 是否以变量形式替换
     */
    isReplaceVariable: true,
    /**
     * 替换的变量名
     */
    variable: {
      $red: 'red'
    }
  },
  /**
   * 需要转换的文件
   */
  target: {
    from: './style',
    /**
     * 新文件输出
     * 不配置会覆盖源文件（一般不需要配置）
     */
    to: '../dist'
  },
  /**
   * 错误日志地址 默认 node_modules/.scss-replace-error
   */
  errorPath: 'error'
}
```


 

<!-- [PostCSS]: https://github.com/postcss/postcss

```css
.foo {
  /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

