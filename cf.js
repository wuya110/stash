/*

作者@ZenMoFiShi
版本：日志显示优化版
功能：获取 Cloudflare 优选 IP (Top 3)，并将详细结果清晰地打印在脚本日志 (Logs) 中，方便用户复制。
注意：移除了系统通知功能。

*/

/** @namespace currency.exchange.api */

/**
 * @typedef {Object} currency.exchange.api.HTTPResponse
 * @property {string|null} error - 错误信息，如果没有错误则为 null
 * @property {object} response - HTTP 响应对象
 * @property {string|null} data - 返回的数据，如果没有数据则为 null
 */

/**
 * @typedef {function(Error|string|null, Object, string|null): void} currency.exchange.api.HTTPCallback
 */

/**
 * @typedef {function(Object, currency.exchange.api.HTTPCallback): currency.exchange.api.HTTPResponse} currency.exchange.api.HTTPMethod
 */

/**
 * @typedef {Object} currency.exchange.api.HttpClient
 * @property {currency.exchange.api.HTTPMethod} get - 发送 GET 请求
 * @property {currency.exchange.api.HTTPMethod} post - 发送 POST 请求
 * @property {currency.exchange.api.HTTPMethod} put - 发送 PUT 请求
 * @property {currency.exchange.api.HTTPMethod} delete - 发送 DELETE 请求
 */

/** @type {currency.exchange.api.HttpClient} */
var $httpClient;

var $request, $response, $notification, $argument, $persistentStore, $script

/** @type {function(Object):void} */
var $done

async function request(method, params) {
    return new Promise((resolve, reject) => {
        /** @type {currency.exchange.api.HTTPMethod} */
        const httpMethod = $httpClient[method.toLowerCase()]; 
        httpMethod(params, (error, response, data) => {
            if (error) {
                console.log(`Error: ${error}, Response: ${JSON.stringify(response)}, Data: ${data}`);
                reject({ error, response, data }); 
            } else {
                resolve({ error, response, data }); 
            }
        });
    });
}

async function get(params) {
    return request('GET', params);
}


function parseJsonBody(string) {
    try {
        return JSON.parse(string)
    } catch (e) {
        console.log(`[Warn] invalid json: ${e}, json: ${string}`)
        return null
    }
}

function getLocalDateString(date = null) {
    if (!date) {
        date = new Date()
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function echo(...args) {
    let date = getLocalDateString()
    let logMessage = `${args.join(' ')}`
    logMessage = `[${date}] ${logMessage}`
    console.log(logMessage)
}

// --- MD5 函数（保持不变）---
function md5cycle(x, k) {
  let a = x[0], b = x[1], c = x[2], d = x[3];
  function cmn(q, a, b, x, s, t) {
    a = (a + q + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);

  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);

  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);

  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);

  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);

  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);

  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);

  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);

  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);

  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);

  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);

  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);

  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = (a + x[0]) | 0;
  x[1] = (b + x[1]) | 0;
  x[2] = (c + x[2]) | 0;
  x[3] = (d + x[3]) | 0;
}
function md5blk(s) {
  const md5blks = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}
function md51(s) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  s = s.substring(i - 64);
  const tail = new Array(16).fill(0);
  for (i = 0; i < s.length; i++) {
    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  }
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}
function rhex(n) {
  const s = "0123456789abcdef";
  let j, str = "";
  for (j = 0; j < 4; j++) {
    str += s.charAt((n >> (j * 8 + 4)) & 0x0F) +
      s.charAt((n >> (j * 8)) & 0x0F);
  }
  return str;
}
function hex(x) {
  return x.map(rhex).join("");
}
function md5(s) {
  return hex(md51(s));
}

// ===== ping + 带宽综合评分, 返回得分最高的前3个IP对象数组 =====
function getBestIPs(info) {
  const valid = info.filter(i => i.loss === "0.00%");
  const arr = valid.map(i => {
    let p = parseFloat(i.ping);
    let bw = parseFloat(i.bandwidth.replace("mb","")); 
    
    if (isNaN(p) || isNaN(bw)) {
        return { ip: i.ip, ping: NaN, bw: NaN, score: -Infinity };
    }

    // 综合评分公式：(100 - Ping) * 0.5 + 带宽 * 0.5
    let score = (100 - p) * 0.5 + bw * 0.5;
    return { ip: i.ip, ping: p, bw, score };
  }).filter(i => i.score !== -Infinity);
  
  // 按得分降序排序
  arr.sort((a,b) => b.score - a.score);
  
  // 返回前3个IP
  return arr.slice(0, 3);
}

// =========================================================================
//                                main 函数
// =========================================================================
async function main() {
    const time = Date.now().toString();
    const key = md5(md5("DdlTxtN0sUOu") + "70cloudflareapikey" + time);
    const api_url = `https://api.uouin.com/index.php/index/Cloudflare?key=${key}&time=${time}`;
    const myRequest = { url: api_url, method: "GET" };

    echo(`[START] 开始获取 Cloudflare 优选 IP...`);

    let resp;
    try {
        resp = await get(myRequest);
    } catch (e) {
        echo(`[FATAL] 网络请求失败: ${e.error || e.message || String(e)}`);
        // 返回一个包含错误信息的面板对象给 Result:
        return { 
            title: `⚠️ 优选IP失败`, 
            content: `Logs:\n  [FATAL] 网络请求失败。\n}`,
            "icon-color": "#ff0000"
        }; 
    }

    let error = resp.error;
    let data = resp.data;
    let status = resp.response ? resp.response.status : 'N/A';

    if (error || status >= 400 || !data) {
        echo(`[ERROR] API 请求错误。Status: ${status}, Error: ${error || 'N/A'}`);
        return { 
            title: `❌ 优选IP失败`, 
            content: `Logs:\n  [ERROR] API 请求失败。Status: ${status}\n}`,
            "icon-color": "#ff0000"
        };
    }

    let body = parseJsonBody(data);
    if (!body || !body.data || !body.data.cmcc || !body.data.cmcc.info) {
        echo(`[ERROR] JSON 解析失败或数据结构异常。`);
        return { 
            title: `❌ 优选IP失败`, 
            content: `Logs:\n  [ERROR] 数据解析失败。\n}`,
            "icon-color": "#ff0000"
        };
    }
    
    // 获取优选的前3个IP
    let bestIPs = getBestIPs(body.data.cmcc.info);

    if (bestIPs.length === 0) {
      echo(`[WARNING] 无可用优选IP，所有IP丢包率不为 0.00%。`);
      return { 
          title: `⚠️ 优选IP结果`, 
          content: `Logs:\n  [WARNING] 无可用优选IP。\n}`,
          "icon-color": "#ffa500"
      };
    }

    // --- ⬇️ 返回前的处理和日志输出 ⬇️ ---

    // 格式化面板内容 (作为 content 字段的详细 Logs)
    let logLines = bestIPs.map((item, index) => 
      // 简洁格式：序号. IP 地址 (Ping / BW)
      `${index + 1}. ${item.ip}\n   Ping: ${item.ping.toFixed(2)}ms / BW: ${item.bw.toFixed(2)}mb`
    );
    
    // 构造最终的 Result 面板对象的内容 (Content)
    let panelContent = `优选 IP 结果 (${bestIPs.length}个):\n\n${logLines.join("\n\n")}`; 
    
    // --------------------------------------------------------
    // ✨ 核心修改：将优选 IP 列表直接打印到脚本 Logs 中
    // --------------------------------------------------------
    echo(`\n========================================`);
    echo(`  ✅ Cloudflare 优选 IP 列表 (可复制):`);
    echo(`========================================`);
    // 打印格式化后的 IP 列表
    echo(panelContent);
    echo(`========================================`);
    
    echo(`[END] 脚本成功完成，结果已输出到 Logs 和 Result。`);

    // 获取 Top 1 IP 的关键信息，用于 Tile 的主显示
    const top1IP = bestIPs[0].ip;
    const top1Ping = bestIPs[0].ping.toFixed(2);
    const top1BW = bestIPs[0].bw.toFixed(2);

    // 返回面板对象，它将被显示在 Result 区域和 Tile 面板上
    return {
        // 1. label: Tile 上的主标题（Top 1 IP 地址）
        label: top1IP, 
        
        // 2. subtitle: Tile 上的副标题（Top 1 IP 的 Ping/BW）
        subtitle: `Ping: ${top1Ping}ms / BW: ${top1BW}mb`,
        
        // 3. title: 面板头部的标题 (保留)
        title: `✅ Cloudflare 优选 IP`, 

        // 4. content: 所有详细 Logs
        content: panelContent + '\n}', // 重新添加 Logs 结构结尾
        
        icon: "cloud.fill",
        "icon-color": "#007aff"
    };
    
    // --- ⬆️ 返回代码块结束 ⬆️ ---

}

// 脚本执行入口
(async () => {
    // 调用 main() 并获取返回的面板对象
    let resultPanel = await main(); 
    
    // 将面板对象作为 $done 的参数返回
    $done(resultPanel || {}); 
    
})().catch(error => {
    echo(`[Fatal Error]: ${error?.message || error}`);
    
    // 确保在未捕获异常时也能返回一个对象
    $done({ 
        title: `❌ 脚本致命错误`, 
        content: `Logs:\n  [FATAL] 脚本运行时发生未捕获异常。\n}`,
        "icon-color": "#ff0000"
    });
});
