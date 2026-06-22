import { configureStore } from '@reduxjs/toolkit'
import roomsReducer from './roomsSlice'
import messagesReducer from './messagesSlice'
import notificationsReducer from './notificationsSlice'

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
  },
})
