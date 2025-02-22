[WIP] A web console for wit-motion [BLE devices](https://wit-motion.yuque.com/wumwnr/docs/rwiclb).

## Reference

- [Protocol](https://wit-motion.yuque.com/wumwnr/docs/ycui87fgg1mepk1u#cMiN1)
- [SDK Example](https://github.com/WITMOTION/WitBluetooth_BWT901BLE5_0/blob/main/Android_Java/wit-example-ble5/WitSDK/src/main/java/com/wit/witsdk/Device/DeviceModel.java#L199)
- [Communicating with Bluetooth devices over JavaScript](https://developer.chrome.com/docs/capabilities/bluetooth)
- [Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/index.html)

## Some notes for zsh

`source .zshrc` would help you to set up the node environment. 

If you want auto load `.zshrc` with then vscode terminal, append the following to your `.vscode/settings.json`

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

