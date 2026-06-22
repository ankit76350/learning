import { configureStore } from '@reduxjs/toolkit'
import roomsReducer from './roomsSlice'

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
  },
})
