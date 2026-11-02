# 瑞数 MCP (Ruishu MCP)：让 AI 轻松看懂并抓取瑞数高防网站数据

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/markx520/ruishu-mcp)
[![Anthropic MCP](https://img.shields.io/badge/Anthropic-MCP%20Compliant-blueviolet.svg)](https://modelcontextprotocol.io)

> 💼 **商业合作与定制开发**
> 
> 本开源项目用于展示基础架构与通联能力。在企业实际业务中，面对复杂多变的瑞数防护，要想做到**高并发、超稳定、不封号**的批量数据提取，需要大量的底层调优和持续对抗策略。
> 
> 我们提供现成开箱即用的**企业级商业方案**。如果您有明确的商业采数需求，或需要深度的**付费咨询与定制开发**，欢迎添加微信：**`Sleep_Plan`** 探讨商务合作（添加好友请备注：**商业合作** 或 **付费咨询**，并附带简要需求）。
> 
> *（注：技术有价，精力有限。为了高效服务商业客户，暂不提供免费答疑与基础教学，感谢各位老板理解！）*

---

## 💡 这是个什么工具？（一句话搞懂）

简单来说，这就是**给你的 AI 助手（比如 Cursor、Claude、AI 智能体）装上了一副“透视眼镜”**。

很多网站（例如政务、税务、企业查询平台）都装了著名的“瑞数安全防护系统”。普通爬虫或者 AI 一访问就会被识别拦截，拿到的也全都是加密乱码。

这个工具基于官方的 **MCP 协议**，通过直接控制真实浏览器，在网页刚把真实数据解密出来的那一瞬间，顺手把**干干净净的原始数据**直接送给你的 AI 分析，从此再也不怕瑞数动态加密拦截！

---

## 🌟 核心亮点

- **直接拿明文数据**：不用苦哈哈去逆向分析几万行混淆乱码 JS，网页一解密，数据直接进你的手。
- **自动洗掉垃圾参数**：把网址后面长串的加密小尾巴（像 `?abcde123=xxxx`）通通自动清理掉，留给 AI 最干净的数据。
- **让 AI 像真人一样操作**：支持让大模型自动在网页上点击、翻页、触发查询，全自动流水线作业。
- **所有主流 AI 软件直接用**：完全符合 MCP 标准，不管是 Cursor、Windsurf、Claude 桌面端还是各类 AI Agent，配好就能直接调用。

---

## 🚀 极速上手（只需 3 步）

### 第一步：打开浏览器调试端口

在电脑终端运行一行命令打开 Chrome 浏览器（需先退出当前已运行的 Chrome）：

**Windows 用户：**
```cmd
chrome.exe --remote-debugging-port=9222
```

**Mac 用户：**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

---

### 第二步：下载与编译项目

```bash
# 1. 下载代码
git clone https://github.com/markx520/ruishu-mcp.git
cd ruishu-mcp

# 2. 安装依赖并编译
npm install
npm run build
```

---

### 第三步：挂载到你的 AI 软件

打开你的 AI 工具（例如 Claude 桌面版、Cursor、Windsurf 等）的 MCP 配置文件，填入下面这段配置：

```json
{
  "mcpServers": {
    "ruishu-cdp": {
      "command": "node",
      "args": ["/替换成你的实际路径/ruishu-mcp/dist/index.js"]
    }
  }
}
```

配置好后，你在对话框里让 AI 助手：“**帮我提取刚才打开网页的数据**”，AI 就会自动调用工具，把数据原原本本交给你！

---

## 🛠️ AI 能用到的 3 个核心工具

配置好后，AI 助手会自动拥有以下 3 个标准能力：

1. **`init_ruishu_hook`（初始化监控与探针注入）**：指定目标网站的 URL 规则，自动向浏览器环境注入数据监听探针，进入就绪监听状态。
2. **`execute_page_action`（执行页面动作与交互控制）**：驱动页面执行指定的自动化操作（如模拟点击、表单提交、翻页等），触发目标业务数据的主动流转。
3. **`get_intercepted_traffic`（获取结构化拦截数据）**：拉取已经过解密还原、参数清洗后的规整业务 JSON 数据集，直接供大模型分析处理。

---

## 💬 技术交流与讨论

欢迎对大模型应用、浏览器底层协议与自动化感兴趣的技术朋友交流：

<br>

<p align="center">
  <img src="wechat.jpg" alt="微信技术交流" width="240">
  <br>
  <b>作者微信号：<code>Sleep_Plan</code></b>
</p>

<br>

---

## 💖 赞助与支持

如果这个开源项目帮到了你，或者启发了你的灵感，欢迎请作者喝杯咖啡，支持项目的持续维护与更新！

<br>

<p align="center">
  <img src="alipay_sponsor.png" alt="支付宝赞助" width="220">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="wechat_sponsor.png" alt="微信支付赞助" width="220">
  <br>
  <b>支付宝赞助 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 微信支付赞助</b>
</p>

<br>

---

## 📄 许可证与免责声明

本项目遵循 [MIT License](LICENSE) 开源协议。本代码仅供技术研究与学习交流，请勿用于非法用途。商业化批量稳定采数请联系作者获取企业级方案。

Copyright (c) 2026 markx520. All rights reserved.
