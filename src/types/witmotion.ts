export enum WT9011DCL {
  SERVICE = '0000ffe5-0000-1000-8000-00805f9a34fb',
  READ = '0000ffe4-0000-1000-8000-00805f9a34fb',
  WRITE = '0000ffe9-0000-1000-8000-00805f9a34fb'
}

export enum Bandwidth {
  Hz_256 = 0x00,
  Hz_188 = 0x01,
  Hz_98 = 0x02,
  Hz_42 = 0x03,
  Hz_20 = 0x04,
  Hz_10 = 0x05,
  Hz_5 = 0x06,
}

export enum Orientatation {
  HORIZONTAL,
  VERTICAL
}

export enum OutputFormat {
  INERTIA,
  POSITION
}

export enum RetrievalRate {
  Hz_01 = 0x01,
  Hz_05 = 0x02,
  Hz_1 = 0x03,
  Hz_2 = 0x04,
  Hz_5 = 0x05,
  Hz_10 = 0x06,
  Hz_20 = 0x07,
  Hz_50 = 0x08,
  Hz_100 = 0x09,
  Hz_200 = 0x0B,
}

export interface DeviceStatusReactor {
  onBatteryLevelChanged(value: number): void
  // true for connected, false for disconnected
  onConnectingChanged(value: boolean): void
  onBandwidthChanged(value: Bandwidth): void
  onRetrievalRateChanged(value: RetrievalRate): void
  onOrientationChanged(value: Orientatation): void
  onOuputFormatChanged(value: OutputFormat): void
}

export interface DeviceAgent {
  // 设备基本信息
  id: string
  name: string
  connected: boolean

  // 设备操作方法
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // 数据通信
  startNotifications(): Promise<void>
  stopNotifications(): Promise<void>

  // 设备配置
  configure(options: DeviceOptions): Promise<void>
}

export interface DeviceOptions {
  sampleRate?: number    // 采样率
  outputFormat?: string  // 输出格式
  calibration?: {        // 校准参数
    accelerometer?: number[]
    gyroscope?: number[]
    magnetometer?: number[]
  }
}