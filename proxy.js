// proxy.js (带有详细中文注释和日志的版本)
// 功能：通过轮询监视 io.json 文件，当检测到新命令时执行它，并将执行结果写回文件。

import fs from 'fs/promises';      // 导入 Node.js 的文件系统模块 (Promise版本)，用于异步读写文件。
import path from 'path';            // 导入路径处理模块，用于处理跨操作系统的文件路径。
import { exec } from 'child_process'; // 导入子进程模块中的 exec 函数，用于执行外部 shell 命令。

// 定义 io.json 文件的绝对路径，确保脚本在任何位置运行都能准确找到它。
const ioFilePath = path.resolve(process.cwd(), 'io.json');
// 轮询间隔，单位毫秒。即每隔 500ms 检查一次 io.json 文件是否有变化。
const pollInterval = 500;
// 创建一个锁（标志位），防止在前一个命令尚未完成时，脚本又去处理下一个命令，避免并发冲突。
let isProcessing = false;

console.log(`[${new Date().toISOString()}] [信息] 代理脚本启动。`);
console.log(`[${new Date().toISOString()}] [信息] 正在监视文件: ${ioFilePath}`);

// 核心处理函数，用于读取、执行和回写命令。
const processCommand = async () => {
  // 如果当前正在处理一个命令（锁被占用），则直接返回，等待下一次轮询。
  if (isProcessing) {
    return;
  }

  try {
    // 异步读取 io.json 文件的内容。
    const content = await fs.readFile(ioFilePath, 'utf-8');
    // 将读取到的字符串内容解析为 JSON 对象。
    const data = JSON.parse(content);

    // 检查文件状态是否为 'pending'，这表示有一个新命令需要执行。
    if (data.status === 'pending') {
      isProcessing = true; // 立刻锁定，表示开始处理命令。
      console.log(`[${new Date().toISOString()}] [接收] 检测到新命令。`);
      console.log(`[${new Date().toISOString()}] [接收] 命令详情: ${data.command}`);

      // 首先，将状态更新为 'processing'，并立即写回文件，告知外部调用者命令已开始处理。
      data.status = 'processing';
      await fs.writeFile(ioFilePath, JSON.stringify(data, null, 2));
      console.log(`[${new Date().toISOString()}] [状态] 状态已更新为 'processing'。`);

      console.log(`[${new Date().toISOString()}] [执行] 开始执行命令... (工作目录: ${data.cwd || process.cwd()})`);
      // 使用 exec 执行 shell 命令。支持自定义工作目录 (cwd)。如果 io.json 中未指定 cwd，则使用脚本当前的工作目录。
      exec(data.command, { cwd: data.cwd || process.cwd() }, async (error, stdout, stderr) => {
        // 如果执行过程中出现错误...
        if (error) {
          console.error(`[${new Date().toISOString()}] [错误] 命令执行失败:`, error.message);
          data.status = 'completed'; // 状态更新为 'completed'
          data.error = stderr || error.message; // 将错误信息（优先使用 stderr）记录到 error 字段。
          data.result = null; // 结果字段设为 null
        } else {
          // 如果命令执行成功...
          console.log(`[${new Date().toISOString()}] [成功] 命令执行成功。`);
          data.status = 'completed'; // 状态更新为 'completed'
          data.result = stdout; // 将命令的标准输出 (stdout) 作为结果记录下来。
          data.error = null; // 错误字段设为 null
        }

        // 将最终结果（无论成功或失败）写回 io.json 文件。
        await fs.writeFile(ioFilePath, JSON.stringify(data, null, 2));
        console.log(`[${new Date().toISOString()}] [状态] 状态已更新为 'completed'，结果已写回。`);
        isProcessing = false; // 释放锁，允许脚本在下次轮询时处理新命令。
      });
    }
  } catch (err) {
    // 捕获读取或解析文件时可能发生的错误。
    // 忽略常见且无害的错误，例如文件暂时不存在（ENOENT）或JSON格式不正确（通常是因为文件正在被写入）。
    if (err.code !== 'ENOENT' && err.name !== 'SyntaxError') {
      console.error(`[${new Date().toISOString()}] [严重] 处理文件时发生严重错误:`, err);
    }
    // 即使发生错误，也要确保释放锁，防止脚本被永久卡住。
    isProcessing = false;
  }
};

// 启动轮询器。
// 使用 setInterval 定时重复调用 processCommand 函数。
setInterval(processCommand, pollInterval);

console.log(`[${new Date().toISOString()}] [信息] 轮询已启动，每 ${pollInterval}ms 检查一次。`);