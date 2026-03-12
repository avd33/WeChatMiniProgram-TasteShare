// pages/feedbackHistory/feedbackHistory.js
Page({
  data: {
    feedbackList: [],
    isLoading: false,
    // 筛选条件
    filterStatus: 'all', // all, recent, strong, not
    searchKeyword: '',
    sortBy: 'time', // time, recommendation, dishName
    sortDesc: true // 降序排列
  },

  onLoad() {
    this.loadFeedbackHistory();
  },

  onShow() {
    this.loadFeedbackHistory();
  },

  onPullDownRefresh() {
    this.loadFeedbackHistory(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    });
  },

  // 迁移旧数据
  migrateOldData() {
    try {
      const history = wx.getStorageSync('feedback_history') || [];
      let needsUpdate = false;
      
      const updatedHistory = history.map(item => {
        // 检查是否需要修复时间格式
        if (!item.formattedDate && item.submitTime) {
          needsUpdate = true;
          
          try {
            let date;
            
            // 检查是否是中文格式
            if (typeof item.submitTime === 'string' && 
                (item.submitTime.includes('上午') || item.submitTime.includes('下午'))) {
              date = this.parseChineseDateTime(item.submitTime);
            } else {
              date = new Date(item.submitTime);
            }
            
            if (date && !isNaN(date.getTime())) {
              // 添加格式化日期
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              const hour = date.getHours().toString().padStart(2, '0');
              const minute = date.getMinutes().toString().padStart(2, '0');
              
              item.formattedDate = `${month}-${day} ${hour}:${minute}`;
            } else {
              // 如果无法解析，使用默认值
              item.formattedDate = '未知时间';
            }
          } catch (error) {
            console.error('修复数据失败:', error);
            item.formattedDate = '未知时间';
          }
        }
        
        return item;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('feedback_history', updatedHistory);
        console.log('数据迁移完成');
      }
    } catch (error) {
      console.error('数据迁移失败:', error);
    }
  },

  // 加载记录历史
  loadFeedbackHistory(callback) {
    // 先迁移旧数据
    this.migrateOldData();
    
    this.setData({ isLoading: true });

    try {
      const history = wx.getStorageSync('feedback_history') || [];
      
      // 处理数据 - 适配feedback页面数据结构
      const processedList = history.map(item => ({
        ...item,
        dishName: item.dishName || '未命名菜品',
        recommendation: item.recommendation || 'normal',
        feedback: item.feedback || '',
        name: item.name || '匿名用户',
        phone: item.phone || '',
        submitTime: item.submitTime || new Date().toISOString(),
        foodTypes: item.foodTypes || [],
        foodTypeNames: item.foodTypeNames || [],
        formattedDate: item.formattedDate || '未知时间'
      }));

      // 应用筛选和排序
      let filteredList = this.filterFeedbackList(processedList);
      filteredList = this.sortFeedbackList(filteredList);

      this.setData({
        feedbackList: filteredList,
        isLoading: false
      });
    } catch (error) {
      console.error('加载记录历史失败:', error);
      this.setData({
        feedbackList: [],
        isLoading: false
      });
    }

    if (callback) callback();
  },

  // 筛选记录列表
  filterFeedbackList(list) {
    let filtered = [...list];

    // 按状态筛选
    if (this.data.filterStatus !== 'all') {
      switch (this.data.filterStatus) {
        case 'recent':
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(item => {
            try {
              const itemTime = new Date(item.submitTime).getTime();
              return itemTime > oneWeekAgo;
            } catch (e) {
              return false;
            }
          });
          break;
        case 'strong':
          filtered = filtered.filter(item => 
            item.recommendation === 'strong'
          );
          break;
        case 'not':
          filtered = filtered.filter(item => 
            item.recommendation === 'not'
          );
          break;
      }
    }

    // 按关键词搜索
    if (this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(item =>
        (item.dishName && item.dishName.toLowerCase().includes(keyword)) ||
        (item.feedback && item.feedback.toLowerCase().includes(keyword)) ||
        (item.name && item.name.toLowerCase().includes(keyword))
      );
    }

    return filtered;
  },

  // 排序记录列表
  sortFeedbackList(list) {
    const sorted = [...list];
    
    const recOrder = {
      'strong': 5,
      'recommend': 4,
      'normal': 3,
      'average': 2,
      'not': 1
    };
    
    switch (this.data.sortBy) {
      case 'time':
        sorted.sort((a, b) => {
          try {
            const timeA = new Date(a.submitTime).getTime();
            const timeB = new Date(b.submitTime).getTime();
            return this.data.sortDesc ? timeB - timeA : timeA - timeB;
          } catch (e) {
            return 0;
          }
        });
        break;
      case 'recommendation':
        sorted.sort((a, b) => {
          const recA = recOrder[a.recommendation] || 3;
          const recB = recOrder[b.recommendation] || 3;
          return this.data.sortDesc ? recB - recA : recA - recB;
        });
        break;
      case 'dishName':
        sorted.sort((a, b) => {
          const nameA = a.dishName || '';
          const nameB = b.dishName || '';
          return this.data.sortDesc ? 
            nameB.localeCompare(nameA, 'zh-CN') : 
            nameA.localeCompare(nameB, 'zh-CN');
        });
        break;
    }

    return sorted;
  },

  // 筛选状态改变
  onFilterChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ filterStatus: status }, () => {
      this.loadFeedbackHistory();
    });
  },

  // 搜索关键词改变
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value }, () => {
      this.loadFeedbackHistory();
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({ searchKeyword: '' }, () => {
      this.loadFeedbackHistory();
    });
  },

  // 排序方式改变
  onSortChange(e) {
    const sortBy = e.currentTarget.dataset.sort;
    if (this.data.sortBy === sortBy) {
      // 切换升序/降序
      this.setData({ sortDesc: !this.data.sortDesc }, () => {
        this.loadFeedbackHistory();
      });
    } else {
      this.setData({ 
        sortBy: sortBy,
        sortDesc: true
      }, () => {
        this.loadFeedbackHistory();
      });
    }
  },

  // 查看记录详情
  viewFeedbackDetail(e) {
    const item = e.currentTarget.dataset.item;
    
    wx.showModal({
      title: `美食记录详情`,
      content: this.formatFeedbackContent(item),
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#ADD5A2'
    });
  },

  // 格式化记录内容
  formatFeedbackContent(item) {
    let content = '';
    
    // 基本信息
    content += `菜品：${item.dishName}\n`;
    content += `推荐程度：${this.getRecommendationText(item.recommendation)}\n`;
    content += `记录时间：${item.formattedDate || '未知时间'}\n\n`;
    
    // 美食类型
    if (item.foodTypeNames && item.foodTypeNames.length > 0) {
      content += `美食类型：${item.foodTypeNames.join('、')}\n\n`;
    }
    
    // 用户信息
    content += `记录者：${item.name}\n`;
    if (item.phone) {
      content += `联系方式：${item.phone}\n\n`;
    } else {
      content += '\n';
    }
    
    // 记录内容
    content += `记录体验\n${item.feedback || '无详细记录'}`;
    
    return content;
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

  // 删除单条记录
  deleteFeedbackItem(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.feedbackList[index];
    
    wx.showModal({
      title: '删除记录',
      content: `确定要删除关于"${item.dishName}"的美食记录吗？`,
      confirmColor: '#ADD5A2',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          try {
            const history = wx.getStorageSync('feedback_history') || [];
            // 找到对应的记录并删除
            const itemIndex = history.findIndex(h => 
              h.id === item.id || 
              (h.dishName === item.dishName && h.submitTime === item.submitTime)
            );
            
            if (itemIndex !== -1) {
              history.splice(itemIndex, 1);
              wx.setStorageSync('feedback_history', history);
              this.loadFeedbackHistory();
              
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
              });
            }
          } catch (error) {
            console.error('删除记录失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'error',
              duration: 2000
            });
          }
        }
      }
    });
  },

  // 清空所有记录
  clearAllFeedback() {
    if (this.data.feedbackList.length === 0) return;
    
    wx.showModal({
      title: '清空所有记录',
      content: '确定要清空所有美食记录吗？此操作不可撤销',
      confirmColor: '#FF6B6B',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.setStorageSync('feedback_history', []);
            this.setData({ feedbackList: [] });
            
            wx.showToast({
              title: '已清空所有记录',
              icon: 'success',
              duration: 1500
            });
          } catch (error) {
            console.error('清空记录失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'error',
              duration: 2000
            });
          }
        }
      }
    });
  },

  // 导出记录数据
  exportFeedbackData() {
    if (this.data.feedbackList.length === 0) {
      wx.showToast({
        title: '暂无记录数据',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const exportData = {
      exportTime: new Date().toLocaleString(),
      total: this.data.feedbackList.length,
      feedbacks: this.data.feedbackList
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    
    wx.setClipboardData({
      data: dataStr,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '美食记录数据已复制到剪贴板',
          showCancel: false,
          confirmColor: '#ADD5A2'
        });
      },
      fail: () => {
        wx.showToast({
          title: '导出失败',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  // 解析中文日期时间格式
  parseChineseDateTime(chineseDateTime) {
    try {
      if (!chineseDateTime || typeof chineseDateTime !== 'string') {
        return null;
      }
      
      console.log('解析中文日期:', chineseDateTime);
      
      // 匹配格式：2025/12/24上午1:13:17 或 2025/12/24下午11:57:52
      const match = chineseDateTime.match(/(\d+)\/(\d+)\/(\d+)(上午|下午|中午)(\d+):(\d+):(\d+)/);
      
      if (match) {
        const [, year, month, day, period, hour, minute, second] = match;
        
        let hours = parseInt(hour, 10);
        
        // 处理上下午
        if (period === '下午' || period === '中午') {
          if (hours < 12) {
            hours += 12;
          }
        } else if (period === '上午' && hours === 12) {
          hours = 0; // 上午12点应该是0点
        }
        
        console.log(`解析结果: ${year}-${month}-${day} ${hours}:${minute}:${second}`);
        
        return new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          hours,
          parseInt(minute, 10),
          parseInt(second, 10)
        );
      }
      
      // 如果正则匹配失败，尝试其他方法
      const cleanStr = chineseDateTime.replace(/上午|下午|中午/g, '');
      return new Date(cleanStr);
      
    } catch (error) {
      console.error('解析中文日期出错:', error);
      return null;
    }
  },

  // 工具函数：格式化时间（简化版，显示具体日期）
  formatTime(timestamp) {
    if (!timestamp) return '未知时间';
    
    try {
      // 如果有格式化好的日期，直接使用
      if (this.data.currentItem?.formattedDate) {
        return this.data.currentItem.formattedDate;
      }
      
      // 尝试解析日期
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${month}-${day} ${hour}:${minute}`;
      }
      
      return '未知时间';
      
    } catch (error) {
      console.error('格式化时间出错:', error);
      return '未知时间';
    }
  },

  // 工具函数：获取推荐程度图标
  getRecommendationIcon(recommendation) {
    const iconMap = {
      'strong': '👍',
      'recommend': '👌',
      'normal': '😐',
      'average': '🤔',
      'not': '👎'
    };
    return iconMap[recommendation] || '😐';
  }
});