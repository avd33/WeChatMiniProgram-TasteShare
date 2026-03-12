// pages/profile/profile.js
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    isLoggedIn: false, // 新增：登录状态
    userInfo: {
      avatar: '/images/profile/hamburger.jpeg', // 默认头像
      nickname: '点击登录',
      level: '未登录',
      bio: '登录后可记录美食、收藏店铺'
    },
    // 美食记录统计
    foodStats: {
      shares: 0,      // 记录的美食数
      favorites: 0,   // 收藏的美食数
      likes: 0,       // 获得点赞数
      followers: 0    // 粉丝数
    },
    cacheSize: '0B',
    // 我的功能 - 只保留3个
    myFunctions: [
      {
        id: 'favorites',
        name: '我的收藏',
        icon: '❤️',
        color: '#FFB6C1',
        path: '/pages/favorites/favorites'
      },
      {
        id: 'feedbackHistory',
        name: '记录历史',
        icon: '📝',
        color: '#ADD5A2',
        path: '/pages/feedbackHistory/feedbackHistory'
      },
      {
        id: 'history',
        name: '浏览历史',
        icon: '🕒',
        color: '#FFD166',
        action: 'onHistoryTap'
      }
    ],
    // 系统设置
    systemSettings: [
      {
        id: 'export',
        name: '导出数据',
        icon: '📦',
        action: 'onExportData'
      },
      {
        id: 'clearCache',
        name: '清除缓存',
        icon: '🧹',
        value: '0B'
      },
      {
        id: 'about',
        name: '关于我们',
        icon: 'ℹ️'
      }
    ],
    // 最近记录的3条美食
    recentShares: []
  },

  onLoad() {
    this.checkLoginStatus();
    this.calculateCacheSize();
    this.loadDataStats();
    this.loadRecentShares();
  },

  onShow() {
    this.checkLoginStatus();
    this.loadDataStats();
    this.loadRecentShares();
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const storedUserInfo = wx.getStorageSync('foodie_userInfo');
    
    if (isLoggedIn && storedUserInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: storedUserInfo
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {
          avatar: '/images/profile/hamburger.jpeg',
          nickname: '点击登录',
          level: '未登录',
          bio: '登录后可记录美食、收藏店铺'
        }
      });
    }
  },

  // 登录功能
  onUserCardTap() {
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
    }
  },

  // 显示登录弹窗
  showLoginModal() {
    wx.showModal({
      title: '登录美食记录',
      content: '使用当前微信账户登录，享受完整功能',
      confirmText: '微信登录',
      cancelText: '稍后再说',
      confirmColor: '#ADD5A2',
      success: (res) => {
        if (res.confirm) {
          this.handleWechatLogin();
        }
      }
    });
  },

  // 模拟微信登录
  handleWechatLogin() {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });
    
    // 模拟登录过程
    setTimeout(() => {
      const userInfo = {
        avatar: '/images/profile/xigua.jpg',
        nickname: '美食记录家',
        level: '美食达人',
        bio: '热爱记录生活中的每一道美味'
      };
      
      // 保存登录状态和用户信息
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('foodie_userInfo', userInfo);
      
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      
      // 刷新数据
      this.loadDataStats();
      this.loadRecentShares();
      
    }, 1500);
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmText: '退出',
      cancelText: '取消',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync('isLoggedIn');
          wx.removeStorageSync('foodie_userInfo');
          
          this.setData({
            isLoggedIn: false,
            userInfo: {
              avatar: '/images/profile/hamburger.jpeg',
              nickname: '点击登录',
              level: '未登录',
              bio: '登录后可记录美食、收藏店铺'
            }
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          });
          
          // 重置统计数据（可选）
          this.setData({
            foodStats: {
              shares: 0,
              favorites: 0,
              likes: 0,
              followers: 0
            },
            recentShares: []
          });
        }
      }
    });
  },

  // 计算缓存大小
  calculateCacheSize() {
    return new Promise((resolve) => {
      try {
        // 直接使用 DataStorage.cache.getStats() 的结果
        const stats = DataStorage.cache.getStats();
        
        let displaySize = stats.totalSize;
        
        // 如果小于1KB，显示为B
        if (displaySize.endsWith('KB')) {
          const sizeNum = parseFloat(displaySize);
          if (sizeNum < 1) {
            const sizeB = Math.round(sizeNum * 1024);
            displaySize = sizeB > 0 ? `${sizeB}B` : '0B';
          }
        }
        
        // 更新系统设置中的缓存大小显示
        const systemSettings = this.data.systemSettings.map(item => {
          if (item.id === 'clearCache') {
            return { ...item, value: displaySize };
          }
          return item;
        });
        
        this.setData({
          cacheSize: displaySize,
          systemSettings: systemSettings
        });
      } catch (error) {
        console.error('计算缓存大小失败:', error);
        this.setData({ cacheSize: '0B' });
      }
      resolve();
    });
  },

  // 加载数据统计
  loadDataStats() {
    return new Promise((resolve) => {
      // 加载记录历史
      const feedbackHistory = wx.getStorageSync('feedback_history') || [];
      
      // 加载收藏数据（只统计店铺收藏，分类收藏已移除）
      const favoriteShops = DataStorage.favorites.getShops();
      const totalFavorites = favoriteShops.length;
      
      // 更新美食记录统计
      const foodStats = {
        shares: feedbackHistory.length,
        favorites: totalFavorites,
        likes: feedbackHistory.reduce((sum, item) => sum + (item.likes || 0), 0),
        followers: wx.getStorageSync('followers_count') || 0
      };

      this.setData({
        foodStats
      }, resolve);
    });
  },

  // 加载最近记录
  loadRecentShares() {
    return new Promise((resolve) => {
      const feedbackHistory = wx.getStorageSync('feedback_history') || [];
      
      const recentShares = feedbackHistory
        .slice(-3)
        .reverse()
        .map(item => {
          // 显示时间逻辑
          let displayTime = '未知时间';
          
          // 优先使用 displayTime，其次格式化 submitTime
          if (item.displayTime) {
            displayTime = item.displayTime;
          } else if (item.formattedDate) {
            displayTime = item.formattedDate;
          } else if (item.submitTime) {
            displayTime = this.formatDisplayTime(item.submitTime);
          }
          
          return {
            id: item.id || Math.random().toString(36).substr(2, 9),
            dishName: item.dishName || '未命名菜品',
            recommendation: item.recommendation || 'normal',
            time: displayTime,
            icon: this.getRecommendationIcon(item.recommendation)
          };
        });

      this.setData({ recentShares }, resolve);
    });
  },

  // 格式化显示时间
  formatDisplayTime(timestamp) {
    if (!timestamp) return '未知时间';
    
    try {
      // 1. 处理中文格式
      if (typeof timestamp === 'string' && timestamp.includes('/')) {
        // 中文格式：2025/12/24上午1:13:17
        const match = timestamp.match(/(\d+)\/(\d+)\/(\d+)/);
        if (match) {
          const [, year, month, day] = match;
          const dayNum = day.substring(0, 2);
          const monthStr = parseInt(month).toString().padStart(2, '0');
          const dayStr = parseInt(dayNum).toString().padStart(2, '0');
          
          // 如果时间中包含具体时间，也提取出来
          if (timestamp.includes(':')) {
            const timeMatch = timestamp.match(/(\d+):(\d+)/);
            if (timeMatch) {
              const hour = parseInt(timeMatch[1]).toString().padStart(2, '0');
              const minute = timeMatch[2].toString().padStart(2, '0');
              return `${monthStr}-${dayStr} ${hour}:${minute}`;
            }
          }
          
          return `${monthStr}-${dayStr}`;
        }
      }
      
      // 2. 解析其他格式
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${month}-${day} ${hour}:${minute}`;
      }
      
      return '未知时间';
    } catch (e) {
      return '未知时间';
    }
  },

  // 获取推荐程度图标
  getRecommendationIcon(recommendation) {
    const iconMap = {
      'strong': '🥰',
      'recommend': '😊',
      'normal': '😐',
      'average': '🤔',
      'not': '😅'
    };
    return iconMap[recommendation] || '😐';
  },

  // 获取推荐程度文本
  getRecommendationText(recommendation) {
    const recMap = {
      'strong': '强烈推荐',
      'recommend': '值得一试',
      'normal': '中规中矩',
      'average': '一般般',
      'not': '不太推荐'
    };
    return recMap[recommendation] || '中规中矩';
  },

  // 跳转到功能页面（检查登录状态）
  onNavigateToFunction(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }
    
    const path = e.currentTarget.dataset.path;
    const title = e.currentTarget.dataset.title || '页面';
    
    if (path) {
      wx.navigateTo({
        url: path,
        fail: () => {
          wx.showToast({
            title: `${title}开发中`,
            icon: 'none'
          });
        }
      });
    }
  },

  // 浏览历史点击事件
  onHistoryTap() {
    wx.showModal({
      title: '浏览历史',
      content: '该页面还未开发，敬请期待～',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#ADD5A2'
    });
  },

  // 处理我的功能点击（检查登录状态）
  onMyFunctionTap(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }
    
    const id = e.currentTarget.dataset.id;
    const path = e.currentTarget.dataset.path;
    const action = e.currentTarget.dataset.action;
    
    if (action) {
      if (typeof this[action] === 'function') {
        this[action]();
      }
    } else if (path) {
      this.onNavigateToFunction(e);
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  // 处理系统设置点击
  onSystemSettingTap(e) {
    const id = e.currentTarget.dataset.id;
    
    switch (id) {
      case 'export':
        this.onExportData();
        break;
      case 'clearCache':
        this.onClearCache();
        break;
      case 'about':
        this.showAboutInfo();
        break;
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
    }
  },

  // 编辑头像（需要登录）
  onEditAvatar() {
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }
    
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择', '查看大图'],
      success: (res) => {
        const tapIndex = res.tapIndex;
        switch (tapIndex) {
          case 0:
            this.chooseImage('camera');
            break;
          case 1:
            this.chooseImage('album');
            break;
          case 2:
            this.previewAvatar();
            break;
        }
      }
    });
  },

  // 选择图片
  chooseImage(sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [sourceType],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        const userInfo = { ...this.data.userInfo, avatar: tempFilePath };
        
        this.setData({ userInfo });
        wx.setStorageSync('foodie_userInfo', userInfo);
        
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 预览头像
  previewAvatar() {
    wx.previewImage({
      urls: [this.data.userInfo.avatar],
      current: this.data.userInfo.avatar
    });
  },

  // 编辑昵称（需要登录）
  onEditNickname() {
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }
    
    wx.showModal({
      title: '修改昵称',
      content: '请输入新的昵称',
      editable: true,
      placeholderText: this.data.userInfo.nickname,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const userInfo = { ...this.data.userInfo, nickname: res.content.trim() };
          this.setData({ userInfo });
          wx.setStorageSync('foodie_userInfo', userInfo);
          
          wx.showToast({
            title: '昵称更新成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这不会影响您的记录和收藏哦～',
      confirmColor: '#ADD5A2',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清除中...',
            mask: true
          });
          
          // 【修复】使用 DataStorage.cache.clearAll() 而不是 wx.clearStorage()
          const success = DataStorage.cache.clearAll();
          
          if (success) {
            this.calculateCacheSize();
            this.loadDataStats();
            
            wx.hideLoading();
            wx.showToast({
              title: '缓存已清除',
              icon: 'success',
              duration: 2000
            });
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '清除失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  },

  // 导出所有数据
  onExportData() {
    wx.showModal({
      title: '导出数据',
      content: '将导出您的所有美食记录数据（包括记录历史、收藏等）',
      confirmColor: '#ADD5A2',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          this.doExportData();
        }
      }
    });
  },

  doExportData() {
    const exportData = {
      exportTime: new Date().toLocaleString(),
      userInfo: this.data.userInfo,
      stats: this.data.foodStats,
      feedbacks: wx.getStorageSync('feedback_history') || [],
      favorites: {
        shops: DataStorage.favorites.getShops(),
        categories: DataStorage.favorites.getCategories()
      },
      history: DataStorage.history.getHistory(),
      preferences: DataStorage.preferences.getAll()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    
    wx.setClipboardData({
      data: dataStr,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '美食记录数据已复制到剪贴板，您可以在其他地方粘贴保存',
          showCancel: false,
          confirmColor: '#ADD5A2'
        });
      },
      fail: () => {
        wx.showToast({
          title: '导出失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 显示关于信息
  showAboutInfo() {
    wx.showModal({
      title: '关于美食记录',
      content: '这是一个记录美食、记录美味的小程序\n\n版本：1.0.0\n开发者：美食记录团队\n邮箱：foodie@example.com',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#ADD5A2'
    });
  },

  // 查看最近记录详情（需要登录）
  onViewShareDetail(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }
    
    const share = e.currentTarget.dataset.share;
    
    wx.showModal({
      title: `${share.dishName}`,
      content: `推荐程度：${this.getRecommendationText(share.recommendation)}\n记录时间：${share.time}`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#ADD5A2'
    });
  },

  // 分享个人主页
  onShareAppMessage() {
    return {
      title: this.data.isLoggedIn ? 
        `${this.data.userInfo.nickname}的美食主页` : 
        '美食记录 - 发现身边的美味',
      path: '/pages/profile/profile',
      imageUrl: this.data.userInfo.avatar
    };
  }
});