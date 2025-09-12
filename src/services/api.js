// src/services/api.js - Fixed version for MyKids API

import axios from "axios";

// API Configuration - ใช้ Vite environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://sertjerm.com/my-kids-api/api.php";

console.log("🔗 API_BASE_URL:", API_BASE_URL);

// Helper function to make API calls with better error handling
const apiCall = async (endpoint, method = "GET", data = null) => {
  const url = endpoint ? `${API_BASE_URL}?${endpoint}` : API_BASE_URL;

  try {
    const response = await axios({
      url,
      method,
      data: method !== "GET" ? data : undefined,
      headers: { "Content-Type": "application/json" },
    });

    // axios จะคืนข้อมูลใน response.data
    if (response.data.error) {
      throw new Error(response.data.message || response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error.response?.data?.message || error.message;
  }
};

// Health Check API
export const healthAPI = {
  check: () => apiCall("health"),
};

// Children API - ตรงกับ backend endpoints
export const childrenAPI = {
  // ดึงเด็กทั้งหมด
  getAll: () => apiCall("children"),

  // สร้างเด็กใหม่
  create: (data) =>
    apiCall("children", "POST", {
      Name: data.name,
      Age: data.age,
      AvatarPath: data.avatarPath || "👶",
    }),

  // ดึงข้อมูล dashboard (รวมคะแนน)
  getDashboard: () => apiCall("dashboard"),
};

// Behaviors API - ตรงกับ backend endpoints
export const behaviorsAPI = {
  // ดึงพฤติกรรมทั้งหมด
  getAll: () => apiCall("behaviors"),

  // ดึงพฤติกรรมดีเท่านั้น (good-behaviors หรือ tasks)
  getGood: () => apiCall("good-behaviors"),

  // ดึงพฤติกรรมไม่ดีเท่านั้น (bad-behaviors)
  getBad: () => apiCall("bad-behaviors"),
};

// Rewards API
export const rewardsAPI = {
  // ดึงรางวัลทั้งหมด
  getAll: () => apiCall("rewards"),
};

// Activities API - สำหรับบันทึกกิจกรรม
export const activitiesAPI = {
  // ดึงกิจกรรมทั้งหมด
  getAll: () => apiCall("activities"),

  // บันทึกกิจกรรมใหม่
  create: (data) =>
    apiCall("activities", "POST", {
      ChildId: data.childId,
      ItemId: data.itemId,
      ActivityType: data.activityType || "Behavior",
      Count: data.count || 1,
      Note: data.note || "",
      ActivityDate: data.activityDate || new Date().toISOString().split("T")[0],
    }),
};

// Dashboard API
export const dashboardAPI = {
  // ดึงข้อมูล dashboard
  getSummary: () => apiCall("dashboard"),
};

// API Utils สำหรับงานทั่วไป
export const apiUtils = {
  // ตรวจสอบสถานะ API
  checkStatus: async () => {
    try {
      const result = await healthAPI.check();
      return {
        status: "connected",
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        data: { error: error.message },
      };
    }
  },

  // แปลงข้อมูลจาก API เป็น format ที่ frontend ต้องการ
  transformChild: (child) => ({
    id: child.Id,
    name: child.Name,
    age: child.Age,
    avatar: child.AvatarPath || "👶",
    todayPoints: child.TodayPoints || 0,
    totalPoints: child.TotalPoints || 0,
    isActive: child.IsActive,
  }),

  transformBehavior: (behavior) => ({
    id: behavior.Id,
    name: behavior.Name,
    points: behavior.Points,
    type: behavior.Type,
    isActive: behavior.IsActive,
  }),

  transformReward: (reward) => ({
    id: reward.Id,
    name: reward.Name,
    cost: reward.Cost,
    isActive: reward.IsActive,
  }),

  transformActivity: (activity) => ({
    id: activity.Id || `${activity.ChildId}-${activity.ItemId}-${Date.now()}`,
    childId: activity.ChildId,
    childName: activity.ChildName,
    itemId: activity.ItemId,
    itemName: activity.ItemName,
    activityType: activity.ActivityType,
    count: activity.Count,
    note: activity.Note,
    activityDate: activity.ActivityDate,
    createdAt: activity.CreatedAt,
  }),
};

// Export ค่า config สำหรับใช้ในที่อื่น
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    HEALTH: "health",
    CHILDREN: "children",
    BEHAVIORS: "behaviors",
    GOOD_BEHAVIORS: "good-behaviors",
    BAD_BEHAVIORS: "bad-behaviors",
    REWARDS: "rewards",
    ACTIVITIES: "activities",
    DASHBOARD: "dashboard",
  },
};

// Export default object รวม
const api = {
  health: healthAPI,
  children: childrenAPI,
  behaviors: behaviorsAPI,
  rewards: rewardsAPI,
  activities: activitiesAPI,
  dashboard: dashboardAPI,
  utils: apiUtils,
};

export default api;
