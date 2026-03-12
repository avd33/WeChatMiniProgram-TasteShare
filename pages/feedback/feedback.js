// pages/feedback/feedback.js
Page({
  data: {
    formData: {
      dishName: '',     
      name: '',
      phone: '',
      foodTypes: [],
      recommendation: '',
      feedback: ''
    },
    foodTypes: [
      { name: '饮品', value: 'drink', checked: false },
      { name: '家常菜', value: 'homecooking', checked: false },
      { name: '小吃', value: 'snack', checked: false },
      { name: '日料', value: 'japanese', checked: false },
      { name: '西餐', value: 'western', checked: false },
      { name: '甜点', value: 'dessert', checked: false }
    ],
    recommendations: [
      { name: '强烈推荐', value: 'strong', checked: false },
      { name: '值得一试', value: 'recommend', checked: false },
      { name: '中规中矩', value: 'normal', checked: false },
      { name: '一般般', value: 'average', checked: false },
      { name: '不太推荐', value: 'not', checked: false }
    ],
    errors: {
      dishName: '',
      name: '',
      phone: '',
      foodTypes: '',
      recommendation: '',
      feedback: ''
    },
    isSubmitting: false
  },

  onLoad() {
    console.log('美食记录页面加载');
    
    // 启用转发功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 菜品名称输入
  onDishNameInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.dishName': value,
      'errors.dishName': ''
    });
  },

  // 姓名输入
  onNameInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.name': value,
      'errors.name': ''
    });
  },

  // 手机号输入
  onPhoneInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.phone': value,
      'errors.phone': ''
    });
  },

  // 美食类型选择
  onFoodTypeChange(e) {
    const values = e.detail.value;
    const foodTypes = this.data.foodTypes.map(item => ({
      ...item,
      checked: values.includes(item.value)
    }));
    
    this.setData({
      foodTypes: foodTypes,
      'formData.foodTypes': values,
      'errors.foodTypes': ''
    });
  },

  // 推荐程度选择
  onRecommendationChange(e) {
    const value = e.detail.value;
    const recommendations = this.data.recommendations.map(item => ({
      ...item,
      checked: item.value === value
    }));
    
    this.setData({
      recommendations: recommendations,
      'formData.recommendation': value,
      'errors.recommendation': ''
    });
  },

  // 内容输入
  onFeedbackInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.feedback': value,
      'errors.feedback': ''
    });
  },

  // 表单验证
  validateForm() {
    const { dishName, name, phone, foodTypes, recommendation, feedback } = this.data.formData;
    const errors = {};
    
    // 菜品名称验证
    if (!dishName.trim()) {
      errors.dishName = '请输入菜品或美食名称';
    } else if (dishName.trim().length > 50) {
      errors.dishName = '名称不能超过50个字';
    }
    
    // 姓名验证 - 改为可选
    if (name.trim() && name.trim().length > 10) {
      errors.name = '昵称不能超过10个字';
    }
    
    // 手机号验证（可选）
    if (phone.trim()) {
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        errors.phone = '请输入正确的手机号码';
      } else if (phone.length !== 11) {
        errors.phone = '手机号应为11位数字';
      }
    }
    
    // 美食类型验证
    if (foodTypes.length === 0) {
      errors.foodTypes = '请至少选择一种美食类型';
    }
    
    // 推荐程度验证
    if (!recommendation) {
      errors.recommendation = '请选择推荐程度';
    }
    
    // 内容验证
    if (!feedback.trim()) {
      errors.feedback = '请输入记录内容';
    } else if (feedback.trim().length < 10) {
      errors.feedback = '记录内容至少10个字';
    } else if (feedback.trim().length > 500) {
      errors.feedback = '记录内容不能超过500字';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 格式化日期显示
  formatDateForDisplay(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    // 返回 "月-日 时:分" 格式
    return `${month}-${day} ${hour}:${minute}`;
  },

  // 保存记录到历史
  saveFeedbackToHistory(formData) {
    try {
      const history = wx.getStorageSync('feedback_history') || [];
      
      // 获取类型对应的中文名
      const typeNames = {};
      this.data.foodTypes.forEach(type => {
        typeNames[type.value] = type.name;
      });
      
      const foodTypeNames = formData.foodTypes.map(type => typeNames[type] || type);
      
      // 获取推荐程度显示文本
      let recText = '';
      this.data.recommendations.forEach(rec => {
        if (rec.value === formData.recommendation) {
          recText = rec.name;
        }
      });
      
      // 获取当前时间
      const now = new Date();
      
      // 创建记录 - 使用标准ISO格式
      const feedbackRecord = {
        ...formData,
        foodTypeNames: foodTypeNames,
        recommendationText: recText,
        id: now.getTime(),
        // 保存标准ISO格式时间
        submitTime: now.toISOString(),
        // 保存时间戳
        timestamp: now.getTime(),
        // 保存格式化好的日期字符串（用于显示）
        formattedDate: this.formatDateForDisplay(now)
      };
      
      // 添加到历史记录开头
      history.unshift(feedbackRecord);
      
      // 限制最多保存50条记录
      if (history.length > 50) {
        history.splice(50);
      }
      
      // 保存到本地存储
      wx.setStorageSync('feedback_history', history);
      
      console.log('美食记录已保存:', feedbackRecord);
      return true;
    } catch (error) {
      console.error('保存记录失败:', error);
      return false;
    }
  },

  // 表单提交
  handleFormSubmit(e) {
    //检查登录状态
    if (!wx.getStorageSync('isLoggedIn')) {
      this.showLoginRequiredModal();
      return;
    }
    // 防重复提交检查
    if (this.data.isSubmitting) {
      wx.showToast({
        title: '正在提交中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    if (!this.validateForm()) {
      const errorMsgs = Object.values(this.data.errors).filter(msg => msg);
      const errorMessage = errorMsgs.length > 0 ? 
        `请检查以下问题：\n\n• ${errorMsgs.join('\n• ')}` : 
        '表单填写不完整';
      
      wx.showModal({
        title: '表单错误',
        content: errorMessage,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#ADD5A2'
      });
      return;
    }
    
    // 提交前确认 - 显示菜品名称
    const dishName = this.data.formData.dishName;
    wx.showModal({
      title: '确认提交',
      content: `确定要提交【${dishName}】的美食记录吗？`,
      confirmColor: '#ADD5A2',
      cancelColor: '#999',
      success: (res) => {
        if (res.confirm) {
          this.doSubmitForm();
        }
      }
    });
  },

  // 实际提交逻辑
  doSubmitForm() {
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    this.setData({ isSubmitting: true });
    
    // 模拟提交到服务器
    setTimeout(() => {
      console.log('提交的数据:', this.data.formData);
      
      // 保存到历史记录
      const saveSuccess = this.saveFeedbackToHistory(this.data.formData);
      
      wx.hideLoading();
      this.setData({ isSubmitting: false });
      
      if (saveSuccess) {
        wx.showToast({
          title: '记录成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              // 重置表单
              this.resetForm();
            }, 2000);
          }
        });
      } else {
        wx.showToast({
          title: '记录失败，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    }, 1500);
  },

  // 重置表单
  resetForm() {
    this.setData({
      formData: {
        dishName: '',
        name: '',
        phone: '',
        foodTypes: [],
        recommendation: '',
        feedback: ''
      },
      foodTypes: this.data.foodTypes.map(item => ({ ...item, checked: false })),
      recommendations: this.data.recommendations.map(item => ({ ...item, checked: false })),
      errors: {
        dishName: '',
        name: '',
        phone: '',
        foodTypes: '',
        recommendation: '',
        feedback: ''
      }
    });
  },

  // ========== 转发给好友功能 ==========
  onShareAppMessage() {
    const dishName = this.data.formData.dishName || '这道美食';
    const recommendation = this.data.formData.recommendation;
    let shareText = '';
    
    // 根据推荐程度生成不同的描述
    if (recommendation === 'strong') shareText = '强烈推荐';
    else if (recommendation === 'recommend') shareText = '值得一试';
    else if (recommendation === 'normal') shareText = '中规中矩';
    else if (recommendation === 'average') shareText = '一般般';
    else if (recommendation === 'not') shareText = '不太推荐';
    else shareText = '新鲜发现';
    
    return {
      title: `${shareText} | ${dishName} 美食记录`,
      path: '/pages/feedback/feedback',
      imageUrl: '/images/share-feedback.jpg',
      success: (res) => {
        console.log('转发成功', res);
        wx.showToast({
          title: '感谢转发',
          icon: 'success',
          duration: 1500
        });
      },
      fail: (err) => {
        console.log('转发失败', err);
      }
    };
  },
  
  //需要登录的提示 
  showLoginRequiredModal() {
    wx.showModal({
      title: '登录提示',
      content: '记录美食需要登录后才能使用',
      confirmText: '去登录',
      cancelText: '稍后再说',
      confirmColor: '#ADD5A2',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/profile/profile'
          });
        }
      }
    });
  }
});