/**
 * AI Service - 调用 AI API
 * 支持 DeepSeek / OpenAI / 自定义 OpenAI 兼容接口
 */

/**
 * 获取当前 AI 设置
 */
function getSettings() {
    const settings = wx.getStorageSync('smartbot_settings');
    if (!settings || !settings.apiKey) {
        throw new Error('请先在设置中配置 API Key');
    }
    return settings;
}

/**
 * 调用 AI 聊天接口
 * @param {string} message - 用户消息
 * @param {Array} history - 历史对话
 * @returns {Promise<string>} AI 回复
 */
function chat(message, history = []) {
    return new Promise((resolve, reject) => {
        const settings = getSettings();

        // 构建消息列表
        const messages = [
            {
                role: 'system',
                content: `你是 SmartBot，一个专业、友好的 AI 客服助手。

你的职责：
1. 耐心解答用户问题
2. 提供准确、有帮助的信息
3. 保持专业但亲切的语气
4. 如果不确定，诚实告知用户

回复要求：
- 简洁明了，避免冗长
- 使用纯文本，禁止使用任何 Markdown 格式（如 **粗体**、*斜体*、# 标题）
- 用数字或短横线分点列举，保持内容易读
- 必要时主动询问更多细节`
            },
            ...history.map(item => ({
                role: item.role,
                content: item.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        wx.request({
            url: `${settings.baseUrl}/chat/completions`,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: settings.model || 'deepseek-chat',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            },
            success: (res) => {
                if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
                    resolve(res.data.choices[0].message.content);
                } else {
                    // 处理错误
                    const errorMsg = res.data.error?.message ||
                        res.data.message ||
                        `请求失败 (${res.statusCode})`;
                    reject(new Error(errorMsg));
                }
            },
            fail: (err) => {
                reject(new Error('网络请求失败: ' + err.errMsg));
            }
        });
    });
}

/**
 * 测试 API 连接
 * @returns {Promise<boolean>}
 */
function testConnection() {
    return new Promise((resolve, reject) => {
        const settings = getSettings();

        wx.request({
            url: `${settings.baseUrl}/models`,
            method: 'GET',
            header: {
                'Authorization': `Bearer ${settings.apiKey}`
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    reject(new Error('API 连接失败'));
                }
            },
            fail: (err) => {
                reject(new Error('网络错误: ' + err.errMsg));
            }
        });
    });
}

/**
 * 获取可用模型列表
 * @returns {Promise<Array>}
 */
function getModels() {
    return new Promise((resolve, reject) => {
        const settings = getSettings();

        wx.request({
            url: `${settings.baseUrl}/models`,
            method: 'GET',
            header: {
                'Authorization': `Bearer ${settings.apiKey}`
            },
            success: (res) => {
                if (res.statusCode === 200 && res.data.data) {
                    const models = res.data.data.map(m => m.id);
                    resolve(models);
                } else {
                    reject(new Error('获取模型列表失败'));
                }
            },
            fail: (err) => {
                reject(new Error('网络错误'));
            }
        });
    });
}

module.exports = {
    chat,
    testConnection,
    getModels,
    getSettings
};
