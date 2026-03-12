// pages/index/index.js
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    gridList: [
      { id: 1, name: '火锅', emoji: '🍲' },
      { id: 2, name: '烧烤', emoji: '🍢' },
      { id: 3, name: '日料', emoji: '🍣' },
      { id: 4, name: '川菜', emoji: '🌶️' },
      { id: 5, name: '西餐', emoji: '🍝' },
      { id: 6, name: '甜点', emoji: '🍰' },
      { id: 7, name: '咖啡', emoji: '☕' },
      { id: 8, name: '奶茶', emoji: '🧋' },
      { id: 9, name: '小吃', emoji: '🥟' }
    ],
    
    bannerList: [
      "/images/banner/lunbo1.jpg",
      "/images/banner/lunbo2.jpg",
      "/images/banner/lunbo3.jpg"
    ],
    
    // 分页相关数据
    shopList: [],      // 美食列表数据
    page: 1,          // 当前页码
    pageSize: 6,      // 每页数量
    hasMore: true,    // 是否还有更多数据
    loadingText: '加载更多',
    isLoading: false, // 节流阀
    
    // 数据存储相关
    favoriteShops: [], // 收藏的店铺
    isShopFavorite: {}, // 店铺收藏状态
    // 页面状态
    showFavoritesOnly: false // 是否只显示收藏
  },

  // ========== 页面生命周期 ==========
  onLoad(options) {
    console.log('首页加载');
    this.loadLocalData();      // 加载本地数据
    this.getShopList();        // 加载网络数据
  },

  onShow() {
    // 每次显示页面时刷新本地数据
    this.loadLocalData();
  },

  // ========== 本地数据管理 ==========
  // 加载本地存储的数据
  loadLocalData() {
    console.log('开始加载本地数据...');
    
    // 加载收藏数据
    const favoriteShops = DataStorage.favorites.getShops();
    console.log('收藏店铺数量:', favoriteShops.length);
    
    // 构建收藏状态映射
    const favoriteStatus = {};
    favoriteShops.forEach(shop => {
      favoriteStatus[shop.id] = true;
    });
    
    this.setData({
      favoriteShops,
      isShopFavorite: favoriteStatus
    });
    
    console.log('本地数据加载完成');
  },

  // ========== 网络请求与缓存 ==========
  // 获取美食列表数据
  getShopList(loadMore = false, cb = null) {
    // 检查是否正在加载
    if (this.data.isLoading) {
      console.log('正在加载中，跳过重复请求');
      return;
    }
    
    // 检查缓存（仅首次加载时使用缓存）
    const cacheKey = `shop_list_page_${loadMore ? this.data.page : 1}`;
    const cachedData = DataStorage.cache.getData(cacheKey);
    
    if (cachedData && !loadMore) {
      console.log('使用缓存数据，页码:', loadMore ? this.data.page : 1);
      this.processShopList(cachedData, loadMore, cb);
      return;
    }

    // 显示加载状态
    this.setData({ 
      isLoading: true,
      loadingText: loadMore ? '加载中...' : '加载中...'
    });

    console.log('请求数据，模式:', loadMore ? '加载更多' : '刷新', '页码:', loadMore ? this.data.page : 1);

    // 请求API数据
    wx.request({
      url: 'http://127.0.0.1:3000/data',
      method: 'GET',
      data: {
        page: loadMore ? this.data.page : 1,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        console.log('API返回数据条数:', res.data ? res.data.length : 0);
        
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          const shopData = res.data;
          
          // 缓存数据（有效期30分钟）
          if (shopData.length > 0) {
            DataStorage.cache.setData(cacheKey, shopData, 30);
            console.log('数据已缓存，key:', cacheKey);
          }
          
          this.processShopList(shopData, loadMore, cb);
        } else {
          console.error('API返回数据格式错误:', res);
          this.showNetworkError();
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err);
        
        // 网络失败时尝试使用缓存
        if (!loadMore) {
          const fallbackCache = DataStorage.cache.getData('shop_list_page_1');
          if (fallbackCache) {
            wx.showToast({
              title: '网络异常，显示缓存数据',
              icon: 'none',
              duration: 2000
            });
            this.processShopList(fallbackCache, loadMore, cb);
            return;
          }
        }
        
        this.showNetworkError();
      },
      complete: () => {
        // 执行回调函数（用于下拉刷新完成后停止动画）
        if (cb && typeof cb === 'function') {
          cb();
        }
        
        console.log('请求完成');
      }
    });
  },

  // 处理店铺列表数据
  processShopList(shopData, loadMore, cb) {
    const totalCount = 50; // 假设总数为50
    
    // 合并数据
    const newList = loadMore ? 
      [...this.data.shopList, ...shopData] : 
      shopData;
    
    // 判断是否还有更多数据
    const hasMoreData = newList.length < totalCount;
    
    // 更新收藏状态
    const favoriteStatus = { ...this.data.isShopFavorite };
    newList.forEach(shop => {
      if (!(shop.id in favoriteStatus)) {
        favoriteStatus[shop.id] = DataStorage.favorites.isShopFavorite(shop.id);
      }
    });

    this.setData({
      shopList: newList,
      hasMore: hasMoreData,
      page: loadMore ? this.data.page + 1 : 2,
      loadingText: '加载更多',
      isLoading: false,
      isShopFavorite: favoriteStatus
    });

    console.log('数据更新成功，当前条数:', newList.length, '还有更多:', hasMoreData);
    
    // 如果是下拉刷新，显示成功提示
    if (!loadMore && cb) {
      wx.showToast({
        title: '数据加载成功',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 网络错误处理
  showNetworkError() {
    this.setData({ 
      isLoading: false,
      loadingText: '加载更多'
    });
    
    wx.showToast({
      title: '网络连接失败',
      icon: 'none',
      duration: 2000
    });
  },

  // ========== 下拉刷新功能 ==========
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    
    // 重置分页参数
    this.setData({
      page: 1,
      hasMore: true,
      shopList: [],
      loadingText: '刷新中...'
    });
    
    // 重新请求数据，传入回调函数
    this.getShopList(false, () => {
      // 数据加载完成后停止下拉刷新
      wx.stopPullDownRefresh();
      
      // 刷新本地数据
      this.loadLocalData();
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    });
  },

  // ========== 上拉触底加载更多 ==========
  onReachBottom() {
    console.log('触发上拉触底，开始自动加载');
    
    // 1. 检查是否正在加载（节流阀）
    if (this.data.isLoading) {
      console.log('正在加载中，阻止重复加载');
      return;
    }
    
    // 2. 检查是否还有更多数据
    if (!this.data.hasMore) {
      wx.showToast({ 
        title: "已显示全部内容", 
        icon: "none", 
        duration: 1500 
      });
      return;
    }
    
    // 3. 自动加载更多数据
    console.log('自动加载更多，当前页码:', this.data.page);
    
    // 显示加载状态
    this.setData({
      loadingText: '加载中...'
    });
    
    // 调用加载更多
    this.getShopList(true);
  },

  // ========== 店铺操作功能 ==========
  // 收藏/取消收藏店铺
  toggleFavorite(e) {
    //检查登录状态
    if (!wx.getStorageSync('isLoggedIn')) {
      this.showLoginRequiredModal();
      return;
    }

    const shop = e.currentTarget.dataset.shop;
    const isFavorite = this.data.isShopFavorite[shop.id];
    if (!shop || !shop.id) {
      console.error('店铺数据无效:', shop);
      return;
    }
    
    if (isFavorite) {
      // 取消收藏
      const success = DataStorage.favorites.removeShop(shop.id);
      if (success) {
        wx.showToast({
          title: '已取消收藏',
          icon: 'success',
          duration: 1500
        });
      }
    } else {
      // 添加收藏
      const success = DataStorage.favorites.addShop(shop);
      if (success) {
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 1500
        });
      }
    }

    // 更新本地状态
    this.setData({
      [`isShopFavorite[${shop.id}]`]: !isFavorite
    });

    // 重新加载本地数据（更新统计）
    this.loadLocalData();
  },

  // 点击店铺 - 显示详情
  onShopItemTap(e) {
    const shop = e.currentTarget.dataset.shop;
    
    if (!shop) {
      console.error('未获取到店铺数据');
      return;
    }
    
    console.log('点击店铺:', shop.name);
    
    // 显示店铺详情弹窗
    wx.showModal({
      title: shop.name || '店铺详情',
      content: `地址：${shop.address || '未知'}
      \n电话：${shop.phone || '未知'}
      \n营业时间：${shop.businessHours || '未知'}`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF672B',
      success: (res) => {
        if (res.confirm) {
          console.log('用户查看了店铺详情:', shop.name);
        }
      }
    });
  },

  // ========== 分类操作功能 ==========
  // 点击分类
  handleCategoryTap(e) {
    const categoryName = e.currentTarget.dataset.category;
    console.log('点击分类:', categoryName);
    
    // 特殊处理火锅分类，跳转到火锅页面
  if (categoryName === '火锅') {
    wx.navigateTo({
      url: '/pages/hotpot/hotpot',
      fail: () => {
        wx.showToast({ 
          title: '火锅页面未找到', 
          icon: "error",
          duration: 2000
        });
      }
    });
  } else {
    // 其他分类暂时还是跳转到通用分类页面
    wx.navigateTo({
      url: `/pages/categoryList/categoryList?category=${encodeURIComponent(categoryName)}`,
      fail: () => {
        wx.showToast({ 
          title: `${categoryName}页面未找到`, 
          icon: "error",
          duration: 2000
        });
      }
    });
  }
},

// ========== 搜索功能 ==========
handleQuickEntryTap(e) {
  this.onSearchTap();
},

 // 点击搜索栏 - 显示弹窗（不再跳转）
 onSearchTap() {
  console.log('点击搜索栏，显示弹窗');
  
  wx.showModal({
    title: '🔍 搜索功能',
    content: '搜索功能正在开发中，敬请期待！',
    confirmText: '知道了',
    confirmColor: '#ADD5A2',
    showCancel: false
  });
},

  // ========== 轮播图功能 ==========
  handleBannerTap(e) {
    const index = e.currentTarget.dataset.index;
    const bannerImage = this.data.bannerList[index];
    
    console.log('点击轮播图:', index, bannerImage);
    
    wx.showModal({
      title: '活动详情',
      content: `您点击了第${index + 1}个轮播图`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF672B'
    });
  },

  // ========== 切换显示收藏/全部 ==========
  toggleShowFavorites() {
    const showFavoritesOnly = !this.data.showFavoritesOnly;
    
    this.setData({
      showFavoritesOnly
    });
    
    if (showFavoritesOnly) {
      // 显示收藏的店铺
      const favoriteShops = DataStorage.favorites.getShops();
      this.setData({
        shopList: favoriteShops,
        hasMore: false,
        loadingText: '仅显示收藏'
      });
      
      wx.showToast({
        title: '已切换到收藏模式',
        icon: 'none',
        duration: 1500
      });
    } else {
      // 显示全部店铺
      this.setData({
        page: 1,
        shopList: [],
        hasMore: true,
        loadingText: '加载更多'
      });
      
      this.getShopList();
      
      wx.showToast({
        title: '已切换到全部模式',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // ========== 分享功能 ==========
  onShareAppMessage() {
    const favoriteCount = this.data.favoriteShops.length;
    
    return {
      title: `美食探店 | 已收藏${favoriteCount}家美食店铺`,
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg',
      success: (res) => {
        console.log('分享成功:', res);
      },
      fail: (err) => {
        console.error('分享失败:', err);
      }
    };
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


