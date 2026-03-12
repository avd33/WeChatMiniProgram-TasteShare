// pages/hotpot/hotpot.js
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    categoryName: '火锅',
    shopList: [],
    page: 1,
    pageSize: 6,
    hasMore: true,
    isLoading: false,
    loadingText: '加载更多',
    isShopFavorite: {},
    showManualBack: false 
  },

  onLoad(options) {
    console.log('火锅页面加载');
    this.loadLocalData();
    this.getHotpotShops();
  },

  // 手动返回按钮点击事件
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  // 加载本地收藏状态
  loadLocalData() {
    const favoriteShops = DataStorage.favorites.getShops();
    const favoriteStatus = {};
    favoriteShops.forEach(shop => {
      favoriteStatus[shop.id] = true;
    });
    this.setData({ isShopFavorite: favoriteStatus });
  },

  // 获取火锅店铺数据
  getHotpotShops(loadMore = false) {
    if (this.data.isLoading) return;
    
    this.setData({ 
      isLoading: true,
      loadingText: loadMore ? '加载中...' : '加载中...'
    });

    // 模拟数据（实际应该从服务器按分类获取）
    setTimeout(() => {
      const hotpotShops = [
        {
          id: Date.now() + 1,
          name: '海底捞火锅',
          address: '市中心商业街88号',
          phone: '13800138001',
          businessHours: '10:00-22:00',
          image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
          tags: ['火锅', '川味', '网红店'],
          rating: 4.8,
          price: '¥150/人'
        },
        {
          id: Date.now() + 2,
          name: '小龙坎老火锅',
          address: '美食广场A区3楼',
          phone: '13800138002',
          businessHours: '11:00-23:00',
          image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop',
          tags: ['火锅', '重庆', '麻辣'],
          rating: 4.5,
          price: '¥120/人'
        },
        {
          id: Date.now() + 3,
          name: '呷哺呷哺',
          address: '购物中心B1层',
          phone: '13800138003',
          businessHours: '10:30-21:30',
          image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop',
          tags: ['火锅', '小火锅', '实惠'],
          rating: 4.3,
          price: '¥80/人'
        }
      ];

      //定义 newList 变量
      const newList = loadMore ? 
        [...this.data.shopList, ...hotpotShops] : 
        hotpotShops;
      
      // 更新收藏状态
      const favoriteStatus = { ...this.data.isShopFavorite };
      newList.forEach(shop => {
        if (!(shop.id in favoriteStatus)) {
          favoriteStatus[shop.id] = DataStorage.favorites.isShopFavorite(shop.id);
        }
      });

      this.setData({
        shopList: newList,
        hasMore: loadMore ? newList.length < 9 : true,
        page: loadMore ? this.data.page + 1 : 2,
        isLoading: false,
        loadingText: '加载更多',
        isShopFavorite: favoriteStatus
      });
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('火锅页面下拉刷新');
    
    this.setData({
      page: 1,
      hasMore: true,
      shopList: [],
      loadingText: '刷新中...'
    });
    
    this.getHotpotShops();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 上拉触底
  onReachBottom() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({ loadingText: '加载中...' });
    this.getHotpotShops(true);
  },

  // 收藏/取消收藏
  toggleFavorite(e) {
    //检查登录状态
    if (!wx.getStorageSync('isLoggedIn')) {
      this.showLoginRequiredModal();
      return;
    }
    
    const shop = e.currentTarget.dataset.shop;
    const isFavorite = this.data.isShopFavorite[shop.id];
    
    if (isFavorite) {
      DataStorage.favorites.removeShop(shop.id);
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      DataStorage.favorites.addShop(shop);
      wx.showToast({ title: '收藏成功', icon: 'success' });      
    }
  
    // 关键：使用正确的setData语法
    const key = `isShopFavorite.${shop.id}`;
    this.setData({
      [key]: !isFavorite
    });
    
    console.log('收藏状态已更新');
  },

  // 查看详情
  onShopItemTap(e) {
    const shop = e.currentTarget.dataset.shop;
    
    // 移除或注释掉有问题的历史记录代码
    // DataStorage.history.addRecord('shop', shop);
    
    wx.showModal({
      title: shop.name || '店铺详情',
      content: `地址：${shop.address || '未知'}
      \n电话：${shop.phone || '未知'}
      \n营业时间：${shop.businessHours || '未知'}
      \n人均：${shop.price || '未知'}
      \n评分：${shop.rating || '未知'}`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF672B'
    });
  },
  
  //需要登录的提示 
  showLoginRequiredModal() {
    wx.showModal({
      title: '登录提示',
      content: '收藏功能需要登录后才能使用',
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