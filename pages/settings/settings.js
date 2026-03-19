// pages/settings/settings.js
const aiService = require('../../utils/ai-service.js');

Page({
    data: {
        providers: [
            { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
            { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
            { name: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-3-sonnet-20240229' },
            { name: '自定义 (OpenAI 兼容)', baseUrl: '', defaultModel: '' }
        ],
        providerIndex: 0,
        settings: {
            provider: 'deepseek',
            baseUrl: 'https://api.deepseek.com/v1',
            apiKey: '',
            model: 'deepseek-chat'
        },
        showApiKey: false,
        models: [],
        isLoadingModels: false
    },

    onLoad() {
        // 加载已保存的设置
        const savedSettings = wx.getStorageSync('smartbot_settings');
        if (savedSettings) {
            // 找到对应的 provider index
            let providerIndex = this.data.providers.findIndex(
                p => p.baseUrl === savedSettings.baseUrl
            );
            if (providerIndex === -1) {
                providerIndex = 3; // 自定义
            }

            this.setData({
                settings: savedSettings,
                providerIndex
            });
        }
    },

    // Provider 变更
    onProviderChange(e) {
        const index = parseInt(e.detail.value);
        const provider = this.data.providers[index];

        this.setData({
            providerIndex: index,
            'settings.baseUrl': provider.baseUrl,
            'settings.model': provider.defaultModel,
            models: []
        });
    },

    // Base URL 输入
    onBaseUrlInput(e) {
        this.setData({
            'settings.baseUrl': e.detail.value,
            models: []
        });
    },

    // API Key 输入
    onApiKeyInput(e) {
        this.setData({
            'settings.apiKey': e.detail.value,
            models: []
        });
    },

    // Model 输入
    onModelInput(e) {
        this.setData({
            'settings.model': e.detail.value
        });
    },

    // 切换显示 API Key
    toggleShowApiKey() {
        this.setData({
            showApiKey: !this.data.showApiKey
        });
    },

    // 获取模型列表
    async fetchModels() {
        if (!this.data.settings.apiKey) {
            wx.showToast({ title: '请先填写 API Key', icon: 'none' });
            return;
        }
        if (this.data.isLoadingModels) return;

        this.setData({ isLoadingModels: true });

        // 临时保存设置用于测试
        wx.setStorageSync('smartbot_settings', this.data.settings);

        try {
            const models = await aiService.getModels();
            this.setData({
                models: models.slice(0, 20), // 最多显示 20 个
                isLoadingModels: false
            });
        } catch (error) {
            this.setData({ isLoadingModels: false });
            wx.showToast({ title: '获取模型失败', icon: 'none' });
        }
    },

    // 选择模型
    selectModel(e) {
        const model = e.currentTarget.dataset.model;
        this.setData({
            'settings.model': model
        });
    },

    // 测试连接
    async testConnection() {
        if (!this.data.settings.apiKey) {
            wx.showToast({ title: '请先填写 API Key', icon: 'none' });
            return;
        }

        wx.showLoading({ title: '测试中...' });

        // 临时保存设置用于测试
        wx.setStorageSync('smartbot_settings', this.data.settings);

        try {
            await aiService.testConnection();
            wx.hideLoading();
            wx.showToast({ title: '连接成功 ✓', icon: 'success' });
        } catch (error) {
            wx.hideLoading();
            wx.showModal({
                title: '连接失败',
                content: error.message || 'API 连接失败',
                showCancel: false
            });
        }
    },

    // 保存设置
    saveSettings() {
        const { settings } = this.data;

        if (!settings.baseUrl) {
            wx.showToast({ title: '请填写 Base URL', icon: 'none' });
            return;
        }
        if (!settings.apiKey) {
            wx.showToast({ title: '请填写 API Key', icon: 'none' });
            return;
        }
        if (!settings.model) {
            wx.showToast({ title: '请填写模型名称', icon: 'none' });
            return;
        }

        wx.setStorageSync('smartbot_settings', settings);

        wx.showToast({
            title: '保存成功',
            icon: 'success',
            success: () => {
                setTimeout(() => {
                    wx.navigateBack();
                }, 1500);
            }
        });
    }
});
