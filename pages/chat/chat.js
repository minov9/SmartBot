// pages/chat/chat.js
const aiService = require('../../utils/ai-service.js');

Page({
    data: {
        messages: [],
        inputValue: '',
        isTyping: false,
        scrollToView: '',
        quickReplies: [
            '查询订单状态',
            '申请售后服务',
            '联系人工客服',
            '查看常见问题'
        ]
    },

    onLoad() {
        // 检查 API 配置
        try {
            aiService.getSettings();
        } catch (e) {
            wx.showModal({
                title: '请先配置 API',
                content: '需要设置 API Key 才能使用',
                confirmText: '去设置',
                success: (res) => {
                    if (res.confirm) {
                        wx.redirectTo({ url: '/pages/settings/settings' });
                    } else {
                        wx.navigateBack();
                    }
                }
            });
        }
    },

    // 输入变化
    onInput(e) {
        this.setData({ inputValue: e.detail.value });
    },

    // 发送消息
    async sendMessage() {
        const message = this.data.inputValue.trim();
        if (!message || this.data.isTyping) return;

        const msgId = Date.now();

        // 添加用户消息
        const userMessage = { id: msgId, role: 'user', content: message };

        this.setData({
            messages: [...this.data.messages, userMessage],
            inputValue: '',
            isTyping: true
        });

        this.scrollToBottom();

        try {
            // 调用 AI
            const response = await aiService.chat(message, this.data.messages.slice(0, -1));

            // 流式输出效果
            await this.streamOutput(response);

        } catch (error) {
            console.error('AI Error:', error);
            this.setData({ isTyping: false });

            // 显示错误消息
            const errorMessage = {
                id: Date.now(),
                role: 'assistant',
                content: '抱歉，出现了一些问题：' + (error.message || '请稍后重试')
            };
            this.setData({
                messages: [...this.data.messages, errorMessage]
            });
            this.scrollToBottom();
        }
    },

    // 流式输出效果
    async streamOutput(fullText) {
        const aiMsgId = Date.now();

        // 先添加空消息
        const aiMessage = { id: aiMsgId, role: 'assistant', content: '' };
        this.setData({
            messages: [...this.data.messages, aiMessage],
            isTyping: false
        });

        // 逐字输出
        const chars = fullText.split('');
        let currentText = '';
        const chunkSize = 3; // 每次输出 3 个字符
        const delay = 30; // 30ms 间隔

        for (let i = 0; i < chars.length; i += chunkSize) {
            currentText += chars.slice(i, i + chunkSize).join('');

            // 更新最后一条消息
            const messages = [...this.data.messages];
            messages[messages.length - 1].content = currentText;

            this.setData({ messages });
            this.scrollToBottom();

            // 等待
            await this.sleep(delay);
        }
    },

    // 延时函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 快捷回复
    onQuickReply(e) {
        const text = e.currentTarget.dataset.text;
        this.setData({ inputValue: text });
        this.sendMessage();
    },

    // 滚动到底部
    scrollToBottom() {
        setTimeout(() => {
            this.setData({ scrollToView: 'bottom' });
        }, 50);
    },

    // 分享
    onShareAppMessage() {
        return {
            title: 'SmartBot - AI 智能客服',
            path: '/pages/welcome/welcome'
        };
    }
});
