/*
 * Stash 小电视磁贴脚本
 * 作者: AI Assistant
 * 功能: 模拟一个可切换“频道”的小电视磁贴。
 * 每次点击磁贴，会显示不同的预设内容。
 */

/**
 * @typedef {Object} StashResult
 * @property {string} label - 磁贴主标题
 * @property {string} subtitle - 磁贴副标题
 * @property {string} title - 结果面板标题
 * @property {string} content - 结果面板详细内容
 * @property {string} icon - 磁贴图标
 * @property {string} iconColor - 磁贴图标颜色
 * @property {string} backgroundColor - 磁贴背景颜色 (只在首次配置或未指定时生效)
 */

var $done; // Stash 脚本结束函数
var $argument; // 接收配置中 argument 字段的参数

// 定义“频道”列表
const channels = [
    { name: "新闻频道", content: "📺 实时新闻：AI技术发展日新月异...", emoji: "📰" },
    { name: "电影频道", content: "🎬 正在热播：《流浪地球3》...", emoji: "🍿" },
    { name: "音乐频道", content: "🎶 播放列表：热门流行金曲...", emoji: "🎵" },
    { name: "天气频道", content: "☀️ 今日天气：晴，气温25°C...", emoji: "☁️" },
    { name: "体育频道", content: "⚽ 足球赛事：欧洲杯决赛进行中...", emoji: "🏆" },
    { name: "游戏频道", content: "🎮 热门游戏：《原神》新版本上线...", emoji: "🕹️" },
    { name: "休息中", content: "💤 电视正在休息，请稍后再来。", emoji: "😴" }
];

async function main() {
    let currentChannelIndex = 0;

    // 从 argument 中获取上一次保存的频道索引
    // $argument 是一个字符串，需要解析为 JSON 对象
    if ($argument) {
        try {
            const args = JSON.parse($argument);
            if (typeof args.channelIndex === 'number') {
                currentChannelIndex = args.channelIndex;
            }
        } catch (e) {
            console.error("解析 $argument 失败:", e);
        }
    }

    // 切换到下一个频道
    currentChannelIndex = (currentChannelIndex + 1) % channels.length;
    const currentChannel = channels[currentChannelIndex];

    // 保存新的频道索引到 argument，以便下次点击时使用
    // Stash 会将脚本返回的 argument 更新到磁贴配置中
    const nextArgument = JSON.stringify({ channelIndex: currentChannelIndex });

    // 构造返回给 Stash 的 Result 对象
    /** @type {StashResult} */
    const result = {
        label: `📺 我的小电视`, // 磁贴主标题
        subtitle: `${currentChannel.emoji} 正在播放: ${currentChannel.name}`, // 磁贴副标题，显示频道名和Emoji
        title: `📺 小电视控制器`, // 结果面板标题
        content: `切换到频道: ${currentChannel.name}\n\n内容: ${currentChannel.content}\n\n点击磁贴可切换频道。`, // 详细内容
        icon: "tv.fill", // 图标
        iconColor: "#ADD8E6", // 浅蓝色图标
        // backgroundColor: "#203040", // 保持配置中的背景色，这里可以不设置
        argument: nextArgument // 将更新后的频道索引传回给 Stash
    };

    // 输出到控制台日志
    console.log(`[小电视] 切换到: ${currentChannel.name}, Index: ${currentChannelIndex}`);
    console.log(`[小电视] 下次 Argument: ${nextArgument}`);

    $done(result);
}

// 脚本执行入口
(async () => {
    await main();
})().catch(e => {
    console.error(`[小电视] 脚本运行错误: ${e.message || e}`);
    $done({
        label: "📺 小电视错误",
        subtitle: "脚本运行异常",
        title: "❌ 小电视错误",
        content: `错误信息: ${e.message || e}`,
        icon: "tv.fill",
        iconColor: "#FF0000" // 错误时显示红色图标
    });
});
