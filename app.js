App({
    globalData: {
        // 默认 AI 配置
        defaultSettings: {
            provider: 'deepseek',
            baseUrl: 'https://api.deepseek.com/v1',
            apiKey: '',
            model: 'deepseek-chat'
        }
    },

    onLaunch() {
        // 检查是否有已保存的设置
        const settings = wx.getStorageSync('smartbot_settings');
        if (!settings) {
            // 初始化默认设置
            wx.setStorageSync('smartbot_settings', this.globalData.defaultSettings);
        }
    }
});
