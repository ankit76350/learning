import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchRoomsApi, createRoomApi } from '../api/roomApi'

// GET /api/rooms -> returns the full list of rooms
export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  return await fetchRoomsApi()
})

// POST /api/rooms -> creates a room and returns the saved room
export const createRoom = createAsyncThunk('rooms/createRoom', async (name) => {
  return await createRoomApi(name)
})

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    creating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all rooms
      .addCase(fetchRooms.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // create a room
      .addCase(createRoom.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.creating = false
        state.items.push(action.payload)
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message
      })
  },
})

export default roomsSlice.reducer
