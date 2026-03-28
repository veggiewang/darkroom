# 📷 Darkroom - 胶卷扫描元数据管理应用

一个专为胶片摄影师设计的跨平台桌面应用，用于**为数字化后的负片写入完整且专业的 EXIF 元数据**。

[![Release](https://img.shields.io/github/v/release/veggiewang/darkroom?style=flat-square&color=blue)](https://github.com/veggiewang/darkroom/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/veggiewang/darkroom/total?style=flat-square&color=green)](https://github.com/veggiewang/darkroom/releases)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 核心突破：开箱即用，极速写入

与同类工具不同，Darkroom 针对胶片工作流进行了深度优化：

- 📦 **100% 内嵌运行时**：应用内置了完整的 ExifTool 运行环境。无论是在 Mac、Windows 还是 Linux 上，**下载即用**，无需安装任何外部依赖或配置环境变量。
- ⚡ **高性能批量写入**：采用单进程批量处理逻辑。处理一卷 36 张底片只需一次启动，写入速度仅受限于你的磁盘 I/O。
- 🛡️ **铁甲化稳定性**：通过 GitHub Actions 自动化构建，确保每个平台的安装包都经过完整性校验。

## ✨ 核心功能

### 📊 完整的 EXIF 映射
- ✅ **标准参数**：相机型号、镜头、光圈、快门、ISO、焦距、日期。
- ✅ **专业胶片字段**：胶片型号、感光度、冲洗商（Developer）、扫描仪型号（Scanner）。
- ✅ **地理位置**：支持 GPS 坐标写入，与 Apple Photos 地图和 Google Photos 完美集成。
- ✅ **兼容性优化**：将详细冲扫信息组合存入 `UserComment`，同时写入 `IPTC` 和 `XMP` 标签。

### 🎬 帧级精细控制
- **智能继承**：输入下一帧参数时自动继承上一帧，极大减少重复录入。
- **批量导入**：支持整文件夹导入 TIFF、JPEG 及 BMP 文件。
- **自动转换**：内置 BMP → TIFF 自动转换功能，适配专业扫描仪输出。

### 💾 丰富的胶卷数据库
预设 **79 种经典胶卷型号**，包括：
- **Kodak**: Portra, T-Max, Tri-X, Gold, Ektar, Vision3 电影卷。
- **Fujifilm**: Pro 400H, Acros, Velvia, Provia, C200。
- **Ilford**: HP5, Delta 系列, XP2, Pan F。
- **其他**: CineStill, Lomography, Foma, Rollei 等。

## 📥 下载安装

请前往 [**Releases 页面**](https://github.com/veggiewang/darkroom/releases/latest) 下载：

| 平台 | 文件类型 | 推荐环境 |
|------|----------|----------|
| 🍎 **macOS** | `.dmg` | Apple Silicon (M1/M2/M3) 或 Intel |
| 🪟 **Windows** | `.exe` / `.msi` | Windows 10/11 (x64) |
| 🐧 **Linux** | `.AppImage` / `.deb` | 主流发行版 |

> 💡 **提示**：应用已内嵌 ExifTool，无需额外安装。macOS 用户首次运行若提示“无法验证开发者”，请在“系统设置 -> 隐私与安全性”中点击“仍要打开”。

## 🛠️ 技术栈

| 模块 | 技术 |
|----|------|
| **桌面框架** | Tauri v2 (Rust 驱动) |
| **前端界面** | React 19 + TypeScript + Tailwind CSS |
| **EXIF 引擎** | **ExifTool (Embedded Resources)** |
| **动画效果** | Framer Motion |
| **地理位置** | OpenStreetMap Nominatim API |

## 🚀 开发者指南

如果你想从源码编译或贡献代码：

```bash
# 克隆仓库
git clone https://github.com/veggiewang/darkroom.git
cd darkroom

# 安装 Node 依赖
npm install

# 运行开发环境
npm run tauri dev

# 编译发布版本
npm run tauri build
```

## 🔐 隐私与安全
- **全本地处理**：所有照片修改和元数据写入均在本地完成，无需联网。
- **开源透明**：核心逻辑完全公开，确保不含任何恶意代码。

---

**由胶片爱好者为胶片爱好者打造。** 🎞️✨

发现 Bug 或有功能建议？欢迎提交 [Issue](https://github.com/veggiewang/darkroom/issues)。
