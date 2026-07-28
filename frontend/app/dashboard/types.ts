export interface LogItem {
  time: string;
  text: string;
  color: string;
}

export interface SensorStatus {
  id: string;
  name: string;
  status: "OK" | "WARNING" | "ERROR";
  iconName: "Camera" | "Video" | "Activity" | "Navigation" | "Cpu" | "Zap";
}

export interface TelemetryData {
  speed: number;
  steeringAngle: number;
  clutchLevel: number;
  brakeLevel: number;
  gasLevel: number;
  isDriveMode4WD: boolean;
  ping: number;
  fps: number;
  latitude: number;
  longitude: number;
  heading: number;
  batteryVoltage: number;
  cpuTemperature: number;
  firmwareVersion: string;
}
