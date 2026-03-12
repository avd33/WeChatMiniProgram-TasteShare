// pages/favorites/favorites.js - 简化版（无时间相关）
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    activeTab: 'shops',
    tabs: [
      { id: 'shops', name: '店铺', icon: '🏪' },
      { id: 'photos', name: '照片', icon: '📷' },
      { id: 'videos', name: '视频', icon: '🎬' }
    ],
    favoriteShops: [],
    favoritePhotos: [],
    favoriteVideos: [],
    isLoading: false
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  onPullDownRefresh() {
    this.loadFavorites(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    });
  },

  // 加载所有收藏数据
  loadFavorites(callback) {
    this.setData({ isLoading: true });

    // 从本地存储加载收藏数据
    const favoriteShops = DataStorage.favorites.getShops();
    const favoritePhotos = DataStorage.photos.getFavorites();
    const favoriteVideos = DataStorage.videos.getFavorites();

    this.setData({
      favoriteShops,
      favoritePhotos,
      favoriteVideos,
      isLoading: false
    });

    if (callback) callback();
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // ========== 店铺相关方法 ==========
  removeFavoriteShop(e) {
    const shopId = e.currentTarget.dataset.id;
    const shopName = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '取消收藏',
      content: `确定要取消收藏"${shopName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          DataStorage.favorites.removeShop(shopId);
          this.loadFavorites();
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        }
      }
    });
  },

  showShopDetail(e) {
    const shop = e.currentTarget.dataset.shop;
    
    let content = `地址：${shop.address || '未知'}\n`;
    content += `电话：${shop.phone || '未知'}\n`;
    content += `营业时间：${shop.businessHours || '未知'}`;
    
    wx.showModal({
      title: shop.name || '店铺详情',
      content: content,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF672B'
    });
  },

  // ========== 照片相关方法 ==========
  previewPhoto(e) {
    const index = e.currentTarget.dataset.index;
    const photoList = this.data.favoritePhotos.map(photo => photo.url);
    
    wx.previewImage({
      current: photoList[index],
      urls: photoList
    });
  },

  removeFavoritePhoto(e) {
    const photoId = e.currentTarget.dataset.id;
    const photoTitle = e.currentTarget.dataset.title;
    
    wx.showModal({
      title: '取消收藏',
      content: `确定要取消收藏"${photoTitle}"吗？`,
      success: (res) => {
        if (res.confirm) {
          DataStorage.photos.removeFavorite(photoId);
          this.loadFavorites();
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        }
      }
    });
  },

  // ========== 视频相关方法 ==========
  showVideoDetail(e) {
    const video = e.currentTarget.dataset.video;
    
    let detailContent = `标题：${video.title || '未知'}\n`;
    detailContent += `作者：${video.author || '未知'}\n`;
    detailContent += `时长：${video.duration || '未知'}\n`;
    detailContent += `播放次数：${video.viewCount || 0}\n`;
    detailContent += `点赞数：${video.likeCount || 0}`;
    
    if (video.description) {
      detailContent += `\n\n描述：${video.description}`;
    }
    
    wx.showModal({
      title: '视频详情',
      content: detailContent,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF672B'
    });
  },

  removeFavoriteVideo(e) {
    const videoId = e.currentTarget.dataset.id;
    const videoTitle = e.currentTarget.dataset.title;
    
    wx.showModal({
      title: '取消收藏',
      content: `确定要取消收藏"${videoTitle}"吗？`,
      success: (res) => {
        if (res.confirm) {
          DataStorage.videos.removeFavorite(videoId);
          this.loadFavorites();
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        }
      }
    });
  },

  // ========== 通用方法 ==========
  clearCurrentTabFavorites() {
    let title = '';
    let content = '';
    let clearAction = null;
    
    switch (this.data.activeTab) {
      case 'shops':
        if (this.data.favoriteShops.length === 0) return;
        title = '清空收藏店铺';
        content = `确定要清空所有收藏的店铺吗？（共${this.data.favoriteShops.length}个）`;
        clearAction = () => {
          const shops = DataStorage.favorites.getShops();
          shops.forEach(shop => {
            DataStorage.favorites.removeShop(shop.id);
          });
        };
        break;
        
      case 'photos':
        if (this.data.favoritePhotos.length === 0) return;
        title = '清空收藏照片';
        content = `确定要清空所有收藏的照片吗？（共${this.data.favoritePhotos.length}张）`;
        clearAction = () => {
          const photos = DataStorage.photos.getFavorites();
          photos.forEach(photo => {
            DataStorage.photos.removeFavorite(photo.id);
          });
        };
        break;
        
      case 'videos':
        if (this.data.favoriteVideos.length === 0) return;
        title = '清空收藏视频';
        content = `确定要清空所有收藏的视频吗？（共${this.data.favoriteVideos.length}个）`;
        clearAction = () => {
          const videos = DataStorage.videos.getFavorites();
          videos.forEach(video => {
            DataStorage.videos.removeFavorite(video.id);
          });
        };
        break;
        
      default:
        return;
    }
    
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        if (res.confirm && clearAction) {
          clearAction();
          this.loadFavorites();
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 获取当前标签的统计数据
  getCurrentTabStats() {
    switch (this.data.activeTab) {
      case 'shops':
        return this.data.favoriteShops.length;
      case 'photos':
        return this.data.favoritePhotos.length;
      case 'videos':
        return this.data.favoriteVideos.length;
      default:
        return 0;
    }
  }
});