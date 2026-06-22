import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchRoomsApi,
  createRoomApi,
  fetchRoomsByUserApi,
  joinRoomApi,
} from '../api/roomApi'

// GET /api/rooms -> returns the full list of rooms
export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  return await fetchRoomsApi()
})

// POST /api/rooms -> creates a room and returns the saved room
export const createRoom = createAsyncThunk('rooms/createRoom', async (name) => {
  return await createRoomApi(name)
})

// GET /api/rooms/user/{username} -> rooms the user has joined
export const fetchRoomsByUser = createAsyncThunk(
  'rooms/fetchRoomsByUser',
  async (username) => {
    return await fetchRoomsByUserApi(username)
  },
)

// POST /api/rooms/{id}/join -> adds the user to the room, returns the room
export const joinRoom = createAsyncThunk(
  'rooms/joinRoom',
  async ({ roomId, username }) => {
    return await joinRoomApi(roomId, username)
  },
)

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    creating: false,
    error: null,
    // "My Rooms" (rooms the current user has joined)
    myRooms: [],
    myStatus: 'idle',
    myError: null,
    joining: false,
    joinError: null,
  },
  reducers: {
    clearJoinError: (state) => {
      state.joinError = null
    },
  },
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
      // fetch rooms joined by the user
      .addCase(fetchRoomsByUser.pending, (state) => {
        state.myStatus = 'loading'
        state.myError = null
      })
      .addCase(fetchRoomsByUser.fulfilled, (state, action) => {
        state.myStatus = 'succeeded'
        state.myRooms = action.payload
      })
      .addCase(fetchRoomsByUser.rejected, (state, action) => {
        state.myStatus = 'failed'
        state.myError = action.error.message
      })
      // join a room
      .addCase(joinRoom.pending, (state) => {
        state.joining = true
        state.joinError = null
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.joining = false
        // Keep the joined room in the list (most recent first, no duplicates).
        const room = action.payload
        state.myRooms = [
          room,
          ...state.myRooms.filter((r) => r.id !== room.id),
        ]
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.joining = false
        state.joinError = action.error.message
      })
  },
})

export const { clearJoinError } = roomsSlice.actions

export default roomsSlice.reducer
