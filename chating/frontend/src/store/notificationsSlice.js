import { createSlice } from '@reduxjs/toolkit'

// Simple incrementing id for toasts (kept out of state; only needs to be unique).
let nextId = 1

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    // Active toasts on screen: [{ id, roomId, sender, content, timestamp }]
    items: [],
    // The room currently open in ChatRoom — we suppress toasts for it so you
    // don't get notified about the conversation you're already looking at.
    activeRoomId: null,
  },
  reducers: {
    addNotification: {
      reducer: (state, action) => {
        state.items.push(action.payload)
      },
      prepare: ({ roomId, sender, content, timestamp }) => ({
        payload: { id: nextId++, roomId, sender, content, timestamp },
      }),
    },
    dismissNotification: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.items = []
    },
    // Set/clear by ChatRoom on mount/unmount.
    setActiveRoom: (state, action) => {
      state.activeRoomId = action.payload
    },
    clearActiveRoom: (state) => {
      state.activeRoomId = null
    },
  },
})

export const {
  addNotification,
  dismissNotification,
  clearNotifications,
  setActiveRoom,
  clearActiveRoom,
} = notificationsSlice.actions

export default notificationsSlice.reducer
