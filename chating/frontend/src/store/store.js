import { configureStore } from '@reduxjs/toolkit'
import roomsReducer from './roomsSlice'
import messagesReducer from './messagesSlice'

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    messages: messagesReducer,
  },
})
