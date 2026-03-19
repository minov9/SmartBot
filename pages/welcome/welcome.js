// pages/welcome/welcome.js
Page({
    data: {},

    onLoad() {
        // 检查是否已配置 API Key
        const settings = wx.getStorageSync('smartbot_settings');
        if (!settings || !settings.apiKey) {
            // 未配置，显示提示
            this.setData({ showSettingsHint: true });
        }
    },

    startChat() {
        // 检查是否配置了 API Key
        const settings = wx.getStorageSync('smartbot_settings');
        if (!settings || !settings.apiKey) {
            wx.showModal({
                title: '请先配置 API',
                content: '使用前需要配置 AI 服务的 API Key',
                confirmText: '去设置',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateTo({ url: '/pages/settings/settings' });
                    }
                }
            });
            return;
        }

        wx.navigateTo({
            url: '/pages/chat/chat'
        });
    },

    goSettings() {
        wx.navigateTo({
            url: '/pages/settings/settings'
        });
    }
});
