// pages/videos/videos.js
import DataStorage from '../../utils/storageManager';

Page({
  data: {
    videoList: [
      {
        id: 1,
        title: '周末厨房日记 | 第一次尝试做寿司卷',
        date: '2025-12-15',
        duration: '00:48',
        cover: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&auto=format&fit=crop',
        url: 'cloud://cloud1-6grsl6cka829ab70.636c-cloud1-6grsl6cka829ab70-1387641597/0211e6e9975682e7ee5411bb4c2b8f23.mp4',
        viewCount: 234,
        likeCount: 56,
        commentCount: 12,
        liked: false,
        collected: false,
        author: '小美食家',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
        description: '周末在家尝试做寿司，虽然形状不太完美但味道超棒！',
        tags: ['自制寿司', '周末厨房', '第一次尝试']
      },
      {
        id: 2,
        title: '跟奶奶学做家常菜 | 红烧肉的秘密配方',
        date: '2025-12-14',
        duration: '01:30',
        cover: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop',
        url: 'cloud://cloud1-6grsl6cka829ab70.636c-cloud1-6grsl6cka829ab70-1387641597/0a607647d319efbe98a11d35126d0aaf.mp4',
        viewCount: 892,
        likeCount: 145,
        commentCount: 32,
        liked: false,
        collected: false,
        author: '传统味道',
        authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop',
        description: '奶奶传授的红烧肉配方，三代人传承的味道',
        tags: ['家常菜', '奶奶食谱', '传统味道']
      },
      {
        id: 3,
        title: '一人食Vlog | 15分钟搞定营养晚餐',
        date: '2025-12-13',
        duration: '01:51',
        cover: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop',
        url: 'cloud://cloud1-6grsl6cka829ab70.636c-cloud1-6grsl6cka829ab70-1387641597/42612b2058031027111627de8aa83d2f.mp4',
        viewCount: 567,
        likeCount: 98,
        commentCount: 24,
        liked: false,
        collected: false, 
        author: '懒人厨房',
        authorAvatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&auto=format&fit=crop',
        description: '快速又营养的一人食方案，上班族必备',
        tags: ['一人食', '快速料理', '营养均衡']
      }
    ],
    isLoading: false,
    loadingText: '加载更多',
    currentVideoId: null,
    currentVideoContext: null,
    // 收藏状态映射
    collectedVideos: {},
    likedVideos: {}
  },

  // 页面加载
  onLoad(options) {
    console.log('视频页面加载');
    this.loadVideoStatus();
  },

  onShow() {
    this.loadVideoStatus();
  },

  // 加载视频的点赞和收藏状态
  loadVideoStatus() {
    // 加载收藏状态
    const favoriteVideos = DataStorage.videos.getFavorites();
    const collectedVideos = {};
    favoriteVideos.forEach(video => {
      collectedVideos[video.id] = true;
    });

    // 加载点赞状态
    const likedVideosList = DataStorage.videos.getLikedVideos();
    const likedVideos = {};
    likedVideosList.forEach(videoId => {
      likedVideos[videoId] = true;
    });

    // 更新视频列表中的收藏和点赞状态
    const videoList = this.data.videoList.map(video => {
      const videoId = video.id;
      return {
        ...video,
        liked: likedVideos[videoId] || video.liked,
        collected: collectedVideos[videoId] || video.collected
      };
    });

    this.setData({
      videoList,
      collectedVideos,
      likedVideos
    });
  },

  // ========== 下拉刷新功能 ==========
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    
    this.setData({
      isLoading: true,
      loadingText: '刷新中...'
    });
    
    setTimeout(() => {
      this.loadVideoStatus();
      
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
      
      this.setData({
        isLoading: false,
        loadingText: '加载更多'
      });
    }, 1000);
  },

  // ========== 视频播放控制 ==========
  handleVideoPlay(e) {
    const video = e.currentTarget.dataset.video;
    console.log('播放视频:', video.title);
    
    // 停止其他视频
    if (this.data.currentVideoId && this.data.currentVideoId !== video.id) {
      const prevVideoContext = wx.createVideoContext(`video${this.data.currentVideoId}`);
      prevVideoContext.pause();
    }
    
    this.setData({
      currentVideoId: video.id,
      currentVideoContext: wx.createVideoContext(`video${video.id}`)
    });
    
    // 增加播放次数（只在前端显示）
    this.incrementViewCount(video.id);
  },

  // 视频播放事件
  onVideoPlay(e) {
    console.log('视频开始播放');
  },

  // 视频暂停
  onVideoPause(e) {
    console.log('视频暂停');
  },

  // 视频播放结束
  onVideoEnd(e) {
    console.log('视频播放结束');
    const videoId = e.currentTarget.id.replace('video', '');
    
    this.setData({
      currentVideoId: null,
      currentVideoContext: null
    });
  },

  // 视频错误
  onVideoError(e) {
    console.error('视频播放错误:', e.detail.errMsg);
    wx.showToast({
      title: '视频播放失败',
      icon: 'none'
    });
  },

  // 全屏状态变化
  onFullscreenChange(e) {
    console.log('全屏状态变化:', e.detail);
    if (e.detail.fullScreen) {
      console.log('进入全屏模式');
      wx.setKeepScreenOn({
        keepScreenOn: true
      });
    } else {
      console.log('退出全屏模式');
      wx.setKeepScreenOn({
        keepScreenOn: false
      });
    }
  },

  // ========== 增加播放次数（只在前端显示）==========
  incrementViewCount(videoId) {
    const videoList = this.data.videoList.map(video => {
      if (video.id === videoId) {
        const newCount = (video.viewCount || 0) + 1;
        return { ...video, viewCount: newCount };
      }
      return video;
    });
    this.setData({ videoList });
  },

  // ========== 视频交互功能 ==========
  // 点赞视频
  onLikeVideo(e) {
    //检查登录状态
    if (!wx.getStorageSync('isLoggedIn')) {
      this.showLoginRequiredModal();
      return;
    }
    const videoId = e.currentTarget.dataset.id;
    const isLiked = this.data.likedVideos[videoId];
    
    // 更新存储
    if (isLiked) {
      DataStorage.videos.removeLike(videoId);
    } else {
      DataStorage.videos.addLike(videoId);
    }
    
    // 更新本地状态
    const likedVideos = { ...this.data.likedVideos };
    if (isLiked) {
      delete likedVideos[videoId];
    } else {
      likedVideos[videoId] = true;
    }
    
    // 更新视频列表数据
    const videoList = this.data.videoList.map(video => {
      if (video.id === videoId) {
        const newLiked = !video.liked;
        return {
          ...video,
          liked: newLiked,
          likeCount: newLiked ? (video.likeCount || 0) + 1 : Math.max(0, (video.likeCount || 1) - 1)
        };
      }
      return video;
    });
    
    this.setData({
      videoList,
      likedVideos
    });
    
    wx.showToast({
      title: isLiked ? '取消点赞' : '已点赞',
      icon: 'success'
    });
  },

  // 收藏视频
  onCollectVideo(e) {
    //检查登录状态
    if (!wx.getStorageSync('isLoggedIn')) {
      this.showLoginRequiredModal();
      return;
    }
    const videoId = e.currentTarget.dataset.id;
    const video = this.data.videoList.find(v => v.id === videoId);
    
    if (!video) return;
    
    const isCollected = this.data.collectedVideos[videoId];
    
    // 更新存储
    if (isCollected) {
      DataStorage.videos.removeFavorite(videoId);
    } else {
      DataStorage.videos.addFavorite(video);
    }
    
    // 更新本地状态
    const collectedVideos = { ...this.data.collectedVideos };
    if (isCollected) {
      delete collectedVideos[videoId];
    } else {
      collectedVideos[videoId] = true;
    }
    
    // 更新视频列表数据
    const videoList = this.data.videoList.map(v => {
      if (v.id === videoId) {
        return { ...v, collected: !isCollected };
      }
      return v;
    });
    
    this.setData({
      videoList,
      collectedVideos
    });
    
    wx.showToast({
      title: isCollected ? '取消收藏' : '已收藏',
      icon: 'success'
    });
  },

  // 分享视频
  onShareVideo(e) {
    const video = e.currentTarget.dataset.video;
    
    wx.showActionSheet({
      itemList: ['分享给好友', '复制链接'],
      success: (res) => {
        const tapIndex = res.tapIndex;
        if (tapIndex === 0) {
          // 分享给好友
          wx.shareVideoMessage({
            videoPath: video.url,
            title: video.title
          });
        } else if (tapIndex === 1) {
          // 复制链接
          wx.setClipboardData({
            data: video.url,
            success: () => {
              wx.showToast({ title: '链接已复制' });
            }
          });
        }
      }
    });
  },

  // ========== 视频上传功能 ==========
  onRecordVideo() {
    if (this.data.currentVideoContext) {
      this.data.currentVideoContext.pause();
    }
    
    wx.showModal({
      title: '拍摄Vlog',
      content: '视频上传功能正在开发中，敬请期待！',
      confirmText: '知道了',
      confirmColor: '#ADD5A2',
      showCancel: false
    });
  },

  // ========== 页面分享功能 ==========
  onShareAppMessage() {
    const currentVideo = this.data.videoList.find(v => v.id === this.data.currentVideoId) || this.data.videoList[0];
    
    return {
      title: currentVideo ? `${currentVideo.title} | 美食Vlog分享` : '美食Vlog分享',
      path: '/pages/videos/videos',
      imageUrl: currentVideo ? currentVideo.cover : 'https://img.icons8.com/fluency/240/ADD5A2/video.png'
    };
  },
  
  //需要登录的提示
  showLoginRequiredModal() {
    wx.showModal({
      title: '登录提示',
      content: '此功能需要登录后才能使用',
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