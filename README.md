# 📷 Darkroom - 胶卷扫描元数据管理应用

一个专为胶卷摄影师设计的跨平台应用，用于**写入和管理数字化负片的完整 EXIF 元数据**。支持帧级精细参数调整，与 Apple Photos 和 Lightroom 完美集成。

[![Release](https://img.shields.io/github/v/release/veggiewang/darkroom?style=flat-square&color=blue)](https://github.com/veggiewang/darkroom/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/veggiewang/darkroom/total?style=flat-square&color=green)](https://github.com/veggiewang/darkroom/releases)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ 核心功能

### 📊 完整的 EXIF 写入
- ✅ **标准参数**：相机、镜头、光圈、快门、ISO、焦距、日期
- ✅ **胶卷信息**：胶卷型号、感光度、格式
- ✅ **扫描信息**：开发者、扫描仪型号
- ✅ **地点标记**：GPS 坐标（Apple Photos 兼容）
- ✅ **自定义字段**：曝光补偿、备注、作者版权

### 🎬 帧级精细控制
- **逐张调整**：为每张照片设置不同的参数
- **智能继承**：按 Enter 切换下一帧时自动继承当前参数
- **批量操作**：快速处理整卷胶片（通常 36 张）
- **键盘快捷键**：
  - `Enter` / `↓` : 下一帧
  - `↑` : 上一帧

### 💾 完整的胶卷数据库
**79 种胶卷型号**，包括：
- **Kodak**: Portra 系列、T-Max、Tri-X、Vision3 电影卷、Ektar、Ektachrome
- **Fujifilm**: Pro 400H、Acros II、Velvia 系列、Provia、Fujicolor
- **Ilford**: HP5、Delta 系列、Kentmere、FP4、Phoenix
- **CineStill**: 50D、400D、800T（电影卷分装）
- **其他品牌**: FOMA、Rollei、Lucky 等

支持 **135 和 120 格式**的所有主流胶卷。

### 🖼️ 优雅的深色界面
- 赛博朋克风格 UI，适合摄影师审美
- 动态 SVG 胶卷罐组件
- Framer Motion 动画效果
- Tailwind CSS 响应式设计

### 🌍 地点定位
- OpenStreetMap Nominatim API（无需 API Key）
- 自动获取 GPS 坐标
- Apple Photos 地图集成
- 城市/地标搜索

### 📦 文件处理
- 批量导入扫描照片（支持 TIFF、JPEG、BMP）
- BMP → TIFF 自动转换（专业工作流）
- 批量写入 EXIF（一键处理整卷）
- 详细的写入结果反馈

## 📥 下载安装

### 直接下载（推荐）

前往 [**Releases 页面**](https://github.com/veggiewang/darkroom/releases/latest) 下载适合你系统的安装包：

| 平台 | 文件类型 | 芯片架构 |
|------|----------|----------|
| 🍎 **macOS** | `.dmg` | Apple Silicon (M1/M2/M3) 或 Intel |
| 🪟 **Windows** | `.msi` / `.exe` | x64 |
| 🐧 **Linux** | `.deb` / `.AppImage` | x64 |

> 💡 **macOS 用户**：首次打开可能提示"无法验证开发者"，请前往 **系统设置 → 隐私与安全性 → 仍要打开**

---

## 🚀 从源码构建

<details>
<summary>点击展开开发者指南</summary>

### 系统要求
- **macOS 10.15+** / **Windows 10+** / **Linux**
- **Node.js 18+**
- **Rust 1.70+**（用于 Tauri 构建）

### 安装

```bash
# 克隆仓库
git clone https://github.com/veggiewang/darkroom.git
cd darkroom

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 生产构建（当前平台）
npm run tauri build
```

</details>

### 首次使用

1. **启动应用** → 首页显示胶卷库
2. **选择胶卷** → 点击卡片选择（自动记录最近 4 条）
3. **导入照片** → 选择包含扫描照片的文件夹
4. **填写元数据**：
   - 卷级别：适用整卷的信息（开发者、扫描仪等）
   - 帧级别：为每张照片输入光圈、快门、ISO（可选）
5. **写入 EXIF** → 一键写入所有信息
6. **同步到手机** → 导入 iCloud 或使用 AirDrop 同步到 iPhone

## 📸 工作流程示例

### 场景：扫描 Kodak Portra 400 整卷

```
1. 在应用中选择 "Kodak Portra 400 (135)"
   ↓
2. 导入 36 张 TIFF 文件
   ↓
3. 填写卷元数据：
   - 开发者: "Alied Color Labs"
   - 扫描仪: "Fujifilm Frontier SP3000"
   - 拍摄地点: "Shanghai, China"
   ↓
4. 逐帧调整参数（可选）：
   - Frame 1-12: ISO 400, f/8, 1/250
   - Frame 13-24: ISO 400, f/11, 1/125 (光线变化)
   - Frame 25-36: ISO 400, f/5.6, 1/500 (逆光)
   ↓
5. 点击 "写入 EXIF"
   ↓
6. 照片现在包含完整信息，可上传到 Flickr 或 iCloud
```

## 📱 与 Apple Photos 集成

照片导入 iPhone 后显示：
- ✅ 日期和地点（地图标记）
- ✅ 相机、镜头、光圈、快门、ISO
- ✅ 焦距
- ❌ 胶卷型号、开发者（iPhone 不显示 UserComment）

**在 Lightroom 中显示全部信息**，包括胶卷型号和冲扫细节。

## 🛠️ 技术栈

| 层 | 技术 |
|----|------|
| **前端** | React 19 + TypeScript + Tailwind CSS |
| **UI 动画** | Framer Motion |
| **图标** | Lucide React（SVG） |
| **桌面框架** | Tauri v2 |
| **后端** | Rust |
| **EXIF 写入** | exiftool（Rust FFI） |
| **地点 API** | OpenStreetMap Nominatim |
| **构建工具** | Vite |

## 📁 项目结构

```
darkroom/
├── src/                          # React 前端
│   ├── App.tsx                  # 主应用和胶卷库
│   ├── components/
│   │   ├── VectorFilmCanister.tsx   # 3D 胶卷罐 SVG 组件
│   │   ├── LocationInput.tsx        # 地点搜索
│   │   ├── AutocompleteInput.tsx    # 相机/镜头自动完成
│   │   ├── ErrorBoundary.tsx        # 错误处理
│   │   └── workspace/
│   │       └── WorkspaceCanvas.tsx  # 帧处理工作区
│   └── types/
│       └── index.ts             # TypeScript 类型定义
├── src-tauri/                   # Tauri 后端
│   ├── src/
│   │   ├── main.rs
│   │   └── commands/
│   │       ├── exif_engine.rs   # EXIF 写入逻辑
│   │       └── fs_handler.rs    # 文件系统操作
│   └── icons/                   # 应用图标
└── public/                      # 静态资源
```

## 🎨 数据库字段

### 卷元数据（Roll Level）
```typescript
{
  filmStock: { id, brand, name, iso, format },
  iso?: number,                    // 覆盖胶卷默认 ISO
  photographer?: string,
  location?: string,
  latitude?: number,
  longitude?: number,
  developer?: string,              // 冲洗处理商
  scanner?: string,                // 扫描仪型号
  author?: string,                 // 版权信息
  notes?: string,
  dateShotStart?: string,
  dateShotEnd?: string,
  importedFiles?: string[],        // 照片文件路径
}
```

### 帧元数据（Frame Level - 覆盖卷级别）
```typescript
{
  id: string,
  filePath: string,
  aperture?: string,               // f/8, f/11 等
  shutterSpeed?: string,           // 1/250, 2" 等
  iso?: number,                    // 覆盖卷级别
  focalLength?: number,            // 毫米
  ev?: number,                     // 曝光补偿
  location?: string,               // 覆盖卷级别
  latitude?: number,
  longitude?: number,
  notes?: string,
}
```

**优先级**（从高到低）：
1. 帧级别值（Frame）
2. 卷级别值（Roll）
3. 胶卷默认值（Film）

## ⌨️ 快捷键

| 按键 | 功能 |
|------|------|
| `Enter` / `↓` | 切换到下一帧（自动继承参数） |
| `↑` | 切换到上一帧 |

## 🔐 隐私和安全

- ✅ 所有操作本地执行，无云端上传
- ✅ EXIF 直接写入文件，完全离线
- ✅ 地点查询使用开源 OpenStreetMap
- ✅ 开源代码，可审计

## 📝 EXIF 输出示例

写入后的照片包含：
```
Camera Make:        Olympus
Camera Model:       OM-1
Lens Model:         50mm f/1.4
Focal Length:       50.0 mm
F Number:           8.0
Exposure Time:      1/250 sec
ISO:                400
Date Time:          2024-03-23 14:30:00
GPS Latitude:       31.2304° N
GPS Longitude:      121.4737° E
User Comment:       Film: Kodak Portra 400 (135) | Dev: Alied Color Labs | Scanner: Fujifilm Frontier SP3000
```

## 🐛 问题报告

发现 bug？请提交 [Issue](https://github.com/veggiewang/darkroom/issues)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [OpenStreetMap](https://www.openstreetmap.org/) - 地点数据
- [exiftool](https://exiftool.org/) - EXIF 处理

---

**为胶卷摄影师而生。** 🎞️✨
