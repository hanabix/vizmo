[WIP] Wit Motion 低功耗蓝牙设备的 Web 控制台， 目前支持：

- [x] [WT9011DCL](https://wit-motion.yuque.com/wumwnr/docs/rwiclb)

## 相关参考

- [蓝牙协议](https://wit-motion.yuque.com/wumwnr/docs/ycui87fgg1mepk1u#cMiN1)
- [SDK 参考代码](https://github.com/WITMOTION/WitBluetooth_BWT901BLE5_0/blob/main/Android_Java/wit-example-ble5/WitSDK/src/main/java/com/wit/witsdk/Device/DeviceModel.java#L199)
- [通过 JavaScript 与蓝牙设备通信](https://developer.chhttps://developer.chrome.com/docs/capabilities/bluetooth?hl=zh-cn)
- [Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/index.html)

## Zsh 用户小贴士

`source .zshrc` 能自动配置项目独立的 node 环境。

若希望与 VS Code 终端集成，可将如下内容添加至 `.vscode/settings.json`：

```json
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.profiles.osx": {
    "zsh": {
      "path": "/bin/zsh",
      "args": [
        "-l"
      ]
    },
    "bash": {
      "path": "/bin/zsh",
      "args": [
        "-l"
      ]
    }
  },
  "terminal.integrated.env.osx": {
    "ZDOTDIR": "${workspaceFolder}"
  }
```

