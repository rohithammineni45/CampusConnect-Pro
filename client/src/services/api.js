import axios from 'axios';

const API = axios.create({
  baseURL: "https://campusconnect-pro-8tnk.onrender.com/api",
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerStudent = (data) => API.post('/auth/student/register', data);
export const loginStudent = (data) => API.post('/auth/student/login', data);
export const loginAdmin = (data) => API.post('/auth/admin/login', data);

// Students
export const getAllStudents = (params) => API.get('/students', { params });
export const getStudentById = (id) => API.get(`/students/${id}`);
export const addStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);
export const toggleSuspend = (id) => API.put(`/students/${id}/toggle-suspend`);
export const changePassword = (id, data) => API.put(`/students/${id}/change-password`, data);
export const getStudentStats = () => API.get('/students/stats');

// Attendance
export const getStudentAttendance = (id, params) => API.get(`/attendance/student/${id}`, { params });
export const getAllAttendance = (params) => API.get('/attendance', { params });
export const addAttendance = (data) => API.post('/attendance', data);
export const addBulkAttendance = (data) => API.post('/attendance/bulk', data);
export const updateAttendance = (id, data) => API.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => API.delete(`/attendance/${id}`);
export const getAttendanceAnalytics = () => API.get('/attendance/analytics');

// Fees
export const getStudentFee = (studentId) => API.get(`/fees/student/${studentId}`);
export const getAllFees = () => API.get('/fees');
export const assignFee = (data) => API.post('/fees/assign', data);
export const payFee = (studentId, data) => API.post(`/fees/pay/${studentId}`, data);
export const verifyPayment = (data) => API.post('/fees/verify', data);
export const getFeeAnalytics = () => API.get('/fees/analytics');

// Events
export const getEvents = () => API.get('/events');
export const getEventsAdmin = () => API.get('/events/admin/all');
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const registerForEvent = (eventId) => API.post(`/events/${eventId}/register`);
export const cancelRegistration = (eventId) => API.delete(`/events/${eventId}/cancel`);
export const getMyRegistrations = () => API.get('/events/my-registrations');
export const getAllRegistrations = (params) => API.get('/events/registrations', { params });
export const updateRegistrationStatus = (id, data) => API.put(`/events/registrations/${id}`, data);
export const getEventAnalytics = () => API.get('/events/analytics');

// Tasks
export const getTasks = (params) => API.get('/tasks', { params });
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/mark-all-read');
export const createBroadcast = (data) => API.post('/notifications/broadcast', data);

export default API;
