// utils/storageManager.js
const DataStorage = {
  // 收藏相关
  favorites: {
    // 收藏店铺
    addShop(shop) {
      try {
        const shops = this.getShops();
        // 检查是否已收藏
        const exists = shops.some(fav => fav.id === shop.id);
        if (!exists) {
          shops.unshift(shop);
          wx.setStorageSync('favorite_shops', shops);
        }
        return !exists;
      } catch (error) {
        console.error('添加收藏失败:', error);
        return false;
      }
    },

    // 取消收藏店铺
    removeShop(shopId) {
      try {
        const shops = this.getShops();
        const newShops = shops.filter(fav => fav.id !== shopId);
        wx.setStorageSync('favorite_shops', newShops);
        return true;
      } catch (error) {
        console.error('取消收藏失败:', error);
        return false;
      }
    },

    // 获取收藏列表
    getShops() {
      try {
        const shops = wx.getStorageSync('favorite_shops');
        return shops || [];
      } catch (error) {
        console.error('获取收藏失败:', error);
        return [];
      }
    },

    // 检查是否已收藏
    isShopFavorite(shopId) {
      try {
        const shops = this.getShops();
        return shops.some(fav => fav.id === shopId);
      } catch (error) {
        console.error('检查收藏状态失败:', error);
        return false;
      }
    }
  },

  // 照片收藏
  photos: {
    // 收藏照片
    addFavorite(photo) {
      try {
        const favorites = this.getFavorites();
        // 检查是否已收藏
        const exists = favorites.some(fav => fav.id === photo.id);
        if (!exists) {
          favorites.unshift(photo);
          wx.setStorageSync('favorite_photos', favorites);
        }
        return !exists;
      } catch (error) {
        console.error('收藏照片失败:', error);
        return false;
      }
    },

    // 取消收藏
    removeFavorite(photoId) {
      try {
        const favorites = this.getFavorites();
        const newFavorites = favorites.filter(fav => fav.id !== photoId);
        wx.setStorageSync('favorite_photos', newFavorites);
        return true;
      } catch (error) {
        console.error('取消收藏照片失败:', error);
        return false;
      }
    },

    // 获取收藏的照片
    getFavorites() {
      try {
        const favorites = wx.getStorageSync('favorite_photos');
        return favorites || [];
      } catch (error) {
        console.error('获取收藏照片失败:', error);
        return [];
      }
    },

    // 检查是否已收藏
    isFavorite(photoId) {
      const favorites = this.getFavorites();
      return favorites.some(fav => fav.id === photoId);
    }
  },

  // 视频相关存储
  videos: {
    // 收藏视频
    addFavorite(video) {
      try {
        const favorites = this.getFavorites();
        // 检查是否已收藏
        const exists = favorites.some(fav => fav.id === video.id);
        if (!exists) {
          favorites.unshift(video);
          wx.setStorageSync('favorite_videos', favorites);
        }
        return !exists;
      } catch (error) {
        console.error('收藏视频失败:', error);
        return false;
      }
    },

    // 取消收藏视频
    removeFavorite(videoId) {
      try {
        const favorites = this.getFavorites();
        const newFavorites = favorites.filter(fav => fav.id !== videoId);
        wx.setStorageSync('favorite_videos', newFavorites);
        return true;
      } catch (error) {
        console.error('取消收藏视频失败:', error);
        return false;
      }
    },

    // 获取收藏的视频列表
    getFavorites() {
      try {
        const favorites = wx.getStorageSync('favorite_videos');
        return favorites || [];
      } catch (error) {
        console.error('获取收藏视频失败:', error);
        return [];
      }
    },

    // 检查是否已收藏
    isFavorite(videoId) {
      const favorites = this.getFavorites();
      return favorites.some(fav => fav.id === videoId);
    },

    // 点赞视频
    addLike(videoId) {
      try {
        const likedVideos = this.getLikedVideos();
        if (!likedVideos.includes(videoId)) {
          likedVideos.push(videoId);
          wx.setStorageSync('liked_videos', likedVideos);
        }
        return true;
      } catch (error) {
        console.error('点赞视频失败:', error);
        return false;
      }
    },

    // 取消点赞
    removeLike(videoId) {
      try {
        const likedVideos = this.getLikedVideos();
        const newLikedVideos = likedVideos.filter(id => id !== videoId);
        wx.setStorageSync('liked_videos', newLikedVideos);
        return true;
      } catch (error) {
        console.error('取消点赞失败:', error);
        return false;
      }
    },

    // 获取点赞的视频ID列表
    getLikedVideos() {
      try {
        const likedVideos = wx.getStorageSync('liked_videos');
        return likedVideos || [];
      } catch (error) {
        console.error('获取点赞视频失败:', error);
        return [];
      }
    },

    // 检查是否已点赞
    isLiked(videoId) {
      const likedVideos = this.getLikedVideos();
      return likedVideos.includes(videoId);
    },

    // 分享播放历史
    addPlayHistory(video) {
      try {
        let history = this.getPlayHistory();
        
        // 移除重复分享
        history = history.filter(item => item.id !== video.id);
        
        const historyItem = {
          id: video.id,
          title: video.title,
          cover: video.cover,
          duration: video.duration
        };
        
        // 添加到开头
        history.unshift(historyItem);
        
        // 最多保存50条分享
        if (history.length > 50) {
          history = history.slice(0, 50);
        }
        
        wx.setStorageSync('video_play_history', history);
        return true;
      } catch (error) {
        console.error('分享播放历史失败:', error);
        return false;
      }
    },

    // 获取播放历史
    getPlayHistory(limit = 50) {
      try {
        const history = wx.getStorageSync('video_play_history') || [];
        return limit ? history.slice(0, limit) : history;
      } catch (error) {
        console.error('获取播放历史失败:', error);
        return [];
      }
    },

    // 清空播放历史
    clearPlayHistory() {
      try {
        wx.setStorageSync('video_play_history', []);
        return true;
      } catch (error) {
        console.error('清空播放历史失败:', error);
        return false;
      }
    },

    // 保存播放进度
    savePlayProgress(videoId, currentTime, duration) {
      try {
        let progressData = this.getPlayProgress();
        
        const progressItem = {
          videoId,
          currentTime,
          duration,
          progress: duration > 0 ? (currentTime / duration) * 100 : 0
        };
        
        // 更新或添加进度
        const index = progressData.findIndex(item => item.videoId === videoId);
        if (index !== -1) {
          progressData[index] = progressItem;
        } else {
          progressData.unshift(progressItem);
        }
        
        // 最多保存30个视频的进度
        if (progressData.length > 30) {
          progressData = progressData.slice(0, 30);
        }
        
        wx.setStorageSync('video_play_progress', progressData);
        return true;
      } catch (error) {
        console.error('保存播放进度失败:', error);
        return false;
      }
    },

    // 获取播放进度
    getPlayProgress(videoId = null) {
      try {
        const progressData = wx.getStorageSync('video_play_progress') || [];
        
        if (videoId) {
          return progressData.find(item => item.videoId === videoId) || null;
        }
        
        return progressData;
      } catch (error) {
        console.error('获取播放进度失败:', error);
        return videoId ? null : [];
      }
    },

    // 清除播放进度
    clearPlayProgress(videoId = null) {
      try {
        if (videoId) {
          // 清除指定视频的进度
          const progressData = this.getPlayProgress();
          const newProgressData = progressData.filter(item => item.videoId !== videoId);
          wx.setStorageSync('video_play_progress', newProgressData);
        } else {
          // 清除所有进度
          wx.setStorageSync('video_play_progress', []);
        }
        return true;
      } catch (error) {
        console.error('清除播放进度失败:', error);
        return false;
      }
    }
  },

  // 缓存管理
  cache: {
    // 缓存网络数据（带过期时间）
    setData(key, data, minutes = 30) {
      try {
        const cacheItem = {
          data: data,
          timestamp: Date.now(),
          expireTime: minutes * 60 * 1000
        };
        wx.setStorageSync(`cache_${key}`, cacheItem);
        return true;
      } catch (error) {
        console.error('缓存数据失败:', error);
        return false;
      }
    },

    // 获取缓存数据（检查过期时间）
    getData(key) {
      try {
        const cacheItem = wx.getStorageSync(`cache_${key}`);
        if (!cacheItem) return null;
        
        // 检查是否过期
        const now = Date.now();
        if (now - cacheItem.timestamp > cacheItem.expireTime) {
          // 缓存已过期，删除并返回null
          this.removeData(key);
          return null;
        }
        
        return cacheItem.data;
      } catch (error) {
        console.error('获取缓存数据失败:', error);
        return null;
      }
    },

    // 移除缓存数据
    removeData(key) {
      try {
        wx.removeStorageSync(`cache_${key}`);
        return true;
      } catch (error) {
        console.error('移除缓存数据失败:', error);
        return false;
      }
    },

    // 检查缓存是否有效
    isValid(key) {
      return this.getData(key) !== null;
    },

    // 获取缓存统计信息
    getStats() {
      try {
        const info = wx.getStorageInfoSync();
        
        // 计算缓存大小
        let cacheSize = 0;
        let cacheCount = 0;
        
        info.keys.forEach(key => {
          if (key.startsWith('cache_')) {
            const data = wx.getStorageSync(key);
            if (data) {
              cacheSize += JSON.stringify(data).length;
              cacheCount++;
            }
          }
        });
        
        return {
          totalSize: `${(cacheSize / 1024).toFixed(2)}KB`,
          itemCount: cacheCount,
          totalItems: info.keys.length
        };
      } catch (error) {
        console.error('获取缓存统计失败:', error);
        return {
          totalSize: '0KB',
          itemCount: 0,
          totalItems: 0
        };
      }
    },

    // 清除所有缓存
    clearAll() {
      try {
        const info = wx.getStorageInfoSync();
        info.keys.forEach(key => {
          if (key.startsWith('cache_')) {
            wx.removeStorageSync(key);
          }
        });
        return true;
      } catch (error) {
        console.error('清除缓存失败:', error);
        return false;
      }
    }
  },

  // 搜索历史
  search: {
    // 添加搜索分享
    addQuery(query) {
      try {
        const history = this.getHistory();
        
        // 移除重复分享
        const filteredHistory = history.filter(h => h !== query);
        
        // 添加到开头
        filteredHistory.unshift(query);
        
        // 最多保存20条
        if (filteredHistory.length > 20) {
          filteredHistory.pop();
        }
        
        wx.setStorageSync('search_history', filteredHistory);
        return true;
      } catch (error) {
        console.error('添加搜索分享失败:', error);
        return false;
      }
    },

    // 获取搜索历史
    getHistory() {
      try {
        const history = wx.getStorageSync('search_history') || [];
        return history;
      } catch (error) {
        console.error('获取搜索历史失败:', error);
        return [];
      }
    },

    // 清空搜索历史
    clear() {
      try {
        wx.setStorageSync('search_history', []);
        return true;
      } catch (error) {
        console.error('清空搜索历史失败:', error);
        return false;
      }
    }
  },

  // 反馈历史
  feedback: {
    // 保存反馈
    addFeedback(feedback) {
      try {
        const history = this.getHistory();
        
        const feedbackRecord = {
          ...feedback,
          id: Date.now()
        };
        
        // 添加到开头
        history.unshift(feedbackRecord);
        
        // 最多保存50条分享
        if (history.length > 50) {
          history.splice(50);
        }
        
        wx.setStorageSync('feedback_history', history);
        return true;
      } catch (error) {
        console.error('保存反馈失败:', error);
        return false;
      }
    },

    // 获取反馈历史
    getHistory() {
      try {
        const history = wx.getStorageSync('feedback_history') || [];
        return history;
      } catch (error) {
        console.error('获取反馈历史失败:', error);
        return [];
      }
    },

    // 删除反馈
    deleteFeedback(feedbackId) {
      try {
        const history = this.getHistory();
        const newHistory = history.filter(item => item.id !== feedbackId);
        wx.setStorageSync('feedback_history', newHistory);
        return true;
      } catch (error) {
        console.error('删除反馈失败:', error);
        return false;
      }
    },

    // 清空反馈历史
    clear() {
      try {
        wx.setStorageSync('feedback_history', []);
        return true;
      } catch (error) {
        console.error('清空反馈历史失败:', error);
        return false;
      }
    }
  }
};

// 导出
export default DataStorage;