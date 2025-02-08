# <u><b>Video Streaming Platform with Tweet Functionality</u></b>  

## 📌 Project Description  
## 📌 Project Description  

This project is a **feature-rich video streaming platform** seamlessly integrated with **tweet-like social interactions**. It enables users to **upload, view, and engage with videos** while fostering community interaction through **comments, likes, tweets, and subscriptions**. The platform offers a **comprehensive suite of content management tools**, allowing users to **create and manage playlists, track watch history, and subscribe to channels**. With robust **user authentication, real-time engagement features, and detailed analytics**, this system provides an **immersive and dynamic media-sharing experience**.
## 🚀 Features  
- **Video Management** (Upload, Update, Delete, View)  
- **User Authentication** (Register, Login, Logout)  
- **Comment System** (Create ,Read ,Update Delete &&  Likes)  
- **Tweet Functionality** (Post, Update, Delete, Like Tweets)  
- **Playlists & Subscriptions** (Create, Manage, Follow Channels)  
- **Like System** (For videos, comments, tweets)  
- **Dashboard & Analytics** (Channel Stats, Video Engagement)  
- **Healthcheck API** (Server Status)  

---

## 📌 API Endpoints  
---
---

### **📝 Comment Controller**  
- `GET /comments/:videoId` → Fetch all comments on a video.  
- `POST /comments` → Add a new comment.  
- `PUT /comments/:id` → Edit an existing comment.  
- `DELETE /comments/:id` → Remove a comment.  
---
### **📊 Dashboard Controller**  
- `GET /dashboard/stats` → Fetch channel analytics.  
- `GET /dashboard/videos` → Get all videos from a channel.  
---
### **❤️ Like Controller**  
- `POST /like/comment/:id` → Like/unlike a comment.  
- `POST /like/tweet/:id` → Like/unlike a tweet.  
- `POST /like/video/:id` → Like/unlike a video.  
- `GET /likes/videos` → Get all liked videos.  
---
### **📂 Playlist Controller**  
- `POST /playlists` → Create a new playlist.  
- `POST /playlists/:id/video` → Add a video.  
- `GET /playlists/mine` → Fetch user's playlists.  
- `GET /playlists/user/:userId` → Fetch another user’s playlists.  
- `DELETE /playlists/:id/video/:videoId` → Remove a video.  
- `DELETE /playlists/:id` → Delete a playlist.  
- `PUT /playlists/:id` → Update playlist details.  
---
### **👥 User Controller**  
- `POST /auth/register` → Register a new user.  
- `POST /auth/login` → Authenticate user.  
- `POST /auth/logout` → Logout securely.  
- `POST /auth/refresh` → Refresh access token.  
- `PUT /user/password` → Change password.  
- `GET /user/me` → Get logged-in user details.  
- `PUT /user/account` → Update account info.  
- `PUT /user/avatar` → Update profile picture.  
- `PUT /user/cover` → Update cover image.  
- `GET /user/channel/:id` → Fetch channel profile.  
- `GET /user/history` → Get watch history.  
---
### **📹 Video Controller**  
- `GET /videos` → Fetch all videos.  
- `POST /videos` → Upload a new video.  
- `GET /videos/:id` → Fetch video details.  
- `PUT /videos/:id` → Update video metadata.  
- `DELETE /videos/:id` → Delete a video.  
- `PATCH /videos/:id/status` → Toggle video visibility.  
- `POST /videos/:id/view` → Register a video view.
--- 
### **🔔 Subscription Controller**  
- `POST /subscriptions/:channelId` → Subscribe/unsubscribe from a channel.  
- `GET /subscriptions/:channelId/subscribers` → Fetch all subscribers of a channel.  
- `GET /subscriptions/mine` → Get a list of channels the user is subscribed to.  
---
### **🐦 Tweet Controller**  
- `POST /tweets` → Create a new tweet.  
- `GET /tweets/user/:userId` → Fetch all tweets posted by a user.  
- `PUT /tweets/:id` → Edit an existing tweet.  
- `DELETE /tweets/:id` → Remove a tweet. 

---
---