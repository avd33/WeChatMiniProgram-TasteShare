// pages/photos/photos.js
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    // 照片列表数据 - 4张图片
    photoList: [
      { 
        id: 1, 
        url: "/images/photos/photo1.jpg",
        title: "照片1",
        name: "照片1"
      },
      { 
        id: 2, 
        url: "/images/photos/photo2.jpg",
        title: "照片2",
        name: "照片2"
      },
      { 
        id: 3, 
        url: "/images/photos/photo3.jpg",
        title: "照片3", 
        name: "照片3"
      },
      { 
        id: 4, 
        url: "/images/photos/photo4.jpg",
        title: "照片4",
        name: "照片4"
      }
    ],
    currentIndex: 0,  // 当前显示的图片索引
    isFavorite: {}    // 收藏状态 
  },

  onLoad(options) {
    console.log('照片页面加载');
    this.loadFavoriteStatus();
    
    // 启用分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShow() {
    this.loadFavoriteStatus();
  },

  // 加载收藏状态
  loadFavoriteStatus() {
    const isFavorite = {};
    this.data.photoList.forEach(photo => {
      isFavorite[photo.id] = DataStorage.photos.isFavorite(photo.id);
    });
    
    this.setData({ isFavorite });
  },

  // 图片点击事件 - 预览大图
  onImageTap(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.photoList.map(item => item.url);
    
    wx.previewImage({
      current: urls[index],
      urls: urls,
      success: () => {
        console.log('图片预览打开成功');
      },
      fail: (err) => {
        console.error('图片预览失败:', err);
        wx.showToast({
          title: '预览失败',
          icon: 'none'
        });
      }
    });
  },

  // swiper 切换时触发
  onSwiperChange(e) {
    const currentIndex = e.detail.current;
    this.setData({ currentIndex });
  },

  // 收藏/取消收藏照片
  toggleFavorite() {
    //检查登录状态
    if (!wx.getStorageSync('isLoggedIn')) {
      this.showLoginRequiredModal();
      return;
    }
    const index = this.data.currentIndex;
    const photo = this.data.photoList[index];
    const isFavorite = this.data.isFavorite[photo.id];
    
    if (isFavorite) {
      // 取消收藏
      const success = DataStorage.photos.removeFavorite(photo.id);
      if (success) {
        wx.showToast({
          title: '已取消收藏',
          icon: 'success',
          duration: 1500
        });
        this.setData({
          [`isFavorite[${photo.id}]`]: false
        });
      }
    } else {
      // 添加收藏
      const success = DataStorage.photos.addFavorite(photo);
      if (success) {
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 1500
        });
        this.setData({
          [`isFavorite[${photo.id}]`]: true
        });
      }
    }
  },

  // 长按图片操作
  onImageLongPress(e) {
    const index = e.currentTarget.dataset.index;
    const photo = this.data.photoList[index];
    
    wx.showActionSheet({
      itemList: ['保存图片到相册', '分享这张照片'],
      success: (res) => {
        const tapIndex = res.tapIndex;
        if (tapIndex === 0) {
          this.saveImageToAlbum(photo);
        } else if (tapIndex === 1) {
          this.sharePhoto(photo);
        }
      }
    });
  },

  // 保存图片到相册
  saveImageToAlbum(photo) {
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    // 如果是网络图片需要先下载
    if (photo.url.startsWith('http')) {
      wx.downloadFile({
        url: photo.url,
        success: (res) => {
          if (res.statusCode === 200) {
            this.doSaveImage(res.tempFilePath);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({
            title: '下载图片失败',
            icon: 'error'
          });
        }
      });
    } else {
      // 本地图片直接保存
      this.doSaveImage(photo.url);
    }
  },

  // 实际保存图片
  doSaveImage(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存图片失败:', err);
        
        // 如果是权限问题
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '保存失败',
            content: '需要您授权保存图片到相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          });
        }
      }
    });
  },

  // 分享照片
  sharePhoto(photo) {
    wx.showToast({
      title: '点击右上角分享',
      icon: 'none',
      duration: 2000
    });
  },

  // 用户点击右上角分享按钮
  onShareAppMessage() {
    const photo = this.data.photoList[this.data.currentIndex];
    
    return {
      title: '探店美食照片',
      path: '/pages/photos/photos',
      imageUrl: photo.url,
      success: (res) => {
        console.log('分享成功:', res);
      },
      fail: (err) => {
        console.log('分享失败:', err);
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