import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchMessagesApi } from '../api/roomApi'

// GET /api/messages/{roomId} -> a room's message history
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (roomId) => {
    return await fetchMessagesApi(roomId)
  },
)

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Append a message that arrived over the WebSocket.
    addMessage: (state, action) => {
      state.items.push(action.payload)
    },
    // Reset when leaving a room.
    clearMessages: (state) => {
      state.items = []
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading'
        state.items = []
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        // History is best-effort; live messages still work.
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { addMessage, clearMessages } = messagesSlice.actions

export default messagesSlice.reducer
