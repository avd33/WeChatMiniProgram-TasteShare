// pages/history/history.js
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    historyList: [],
    activeType: 'all', // all, shop, photo, video
    filterTypes: [
      { id: 'all', name: '全部', icon: '📄' },
      { id: 'shop', name: '店铺', icon: '🏪' },
      { id: 'photo', name: '照片', icon: '📷' },
      { id: 'video', name: '视频', icon: '🎬' }
    ],
    isLoading: false
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    });
  },

  // 加载历史记录
  loadHistory(callback) {
    this.setData({ isLoading: true });

    // 从本地存储加载历史记录
    const allHistory = DataStorage.history.getHistory() || [];
    
    // 根据类型过滤
    let filteredHistory = allHistory;
    if (this.data.activeType !== 'all') {
      filteredHistory = allHistory.filter(item => item.type === this.data.activeType);
    }

    this.setData({
      historyList: filteredHistory,
      isLoading: false
    });

    if (callback) callback();
  },

  // 过滤历史记录
  filterHistory(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeType: type });
    this.loadHistory();
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          DataStorage.history.clear();
          this.setData({
            historyList: [],
            activeType: 'all'
          });
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 删除单个历史记录
  deleteHistoryItem(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.historyList[index];
    
    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 获取所有历史记录
          const allHistory = DataStorage.history.getHistory() || [];
          // 找到要删除的记录
          const itemIndex = allHistory.findIndex(h => 
            h.type === item.type && h.data.id === item.data.id
          );
          
          if (itemIndex !== -1) {
            allHistory.splice(itemIndex, 1);
            wx.setStorageSync('browse_history', allHistory);
            this.loadHistory();
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      shop: '🏪',
      photo: '📷',
      video: '🎬'
    };
    return icons[type] || '📄';
  },

  // 获取类型名称
  getTypeName(type) {
    const names = {
      shop: '店铺',
      photo: '照片',
      video: '视频'
    };
    return names[type] || '未知';
  },

  // 跳转到详情
  goToDetail(e) {
    const item = e.currentTarget.dataset.item;
    
    switch (item.type) {
      case 'shop':
        wx.showModal({
          title: item.data.name || '店铺详情',
          content: `地址：${item.data.address || '未知'}\n电话：${item.data.phone || '未知'}`,
          showCancel: false,
          confirmText: '知道了'
        });
        break;
      case 'photo':
        // 预览照片
        if (item.data.url) {
          wx.previewImage({
            urls: [item.data.url]
          });
        }
        break;
      case 'video':
        // 显示视频详情
        wx.showModal({
          title: item.data.title || '视频详情',
          content: `作者：${item.data.author || '未知'}\n时长：${item.data.duration || '未知'}`,
          showCancel: false,
          confirmText: '知道了'
        });
        break;
      default:
        wx.showToast({
          title: '暂不支持查看详情',
          icon: 'none'
        });
    }
  },

  // 获取当前类型的数量
  getCurrentTypeCount() {
    if (this.data.activeType === 'all') {
      return this.data.historyList.length;
    }
    
    const allHistory = DataStorage.history.getHistory() || [];
    return allHistory.filter(item => item.type === this.data.activeType).length;
  },

  // 检查是否有数据
  hasData() {
    return this.data.historyList.length > 0;
  },

  // 获取筛选类型名称
  getFilterName(type) {
    const filter = this.data.filterTypes.find(item => item.id === type);
    return filter ? filter.name : '全部';
  }
});