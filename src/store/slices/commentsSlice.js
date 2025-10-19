import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const fetchComments = createAsyncThunk(
    'comments/fetchComments',
    async ({postId, limit = 20, offset = 0, orderBy = 'createdAt', orderDirection = 'DESC'}, {rejectWithValue}) => {
        try {
            const res = await api.get('/api/comments', {params: {postId, limit, offset, orderBy, orderDirection}});
            return {
                postId,
                list: res.data?.data ?? [],
                count: Number(res.data?.count ?? 0),
                limit,
                offset,
            };
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to load comments';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const addComment = createAsyncThunk(
    'comments/addComment',
    async ({postId, content}, {rejectWithValue}) => {
        try {
            const res = await api.post('/api/comments', {postId, content});
            return {postId, comment: res.data};
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to add comment';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updateComment = createAsyncThunk(
    'comments/updateComment',
    async ({ id, postId, content }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/api/comments/${id}`, { content });
            return { postId, comment: res.data };
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to update comment';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const deleteComment = createAsyncThunk(
    'comments/deleteComment',
    async ({ id, postId }, { rejectWithValue }) => {
        try {
            await api.delete(`/api/comments/${id}`);
            return { id, postId };
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to delete comment';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

const initialSlot = () => ({
    list: [],
    count: 0,
    limit: 20,
    offset: 0,
    loading: false,
    loadingMore: false,
    hasMore: true,
});

const commentsSlice = createSlice({
    name: 'comments',
    initialState: {byPostId: {}},
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state, action) => {
                const {postId, offset = 0} = action.meta.arg;
                const slot = state.byPostId[postId] ?? initialSlot();
                state.byPostId[postId] = {
                    ...slot,
                    loading: offset === 0,
                    loadingMore: offset > 0,
                };
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                const {postId, list, count, limit, offset} = action.payload;
                const slot = state.byPostId[postId] ?? initialSlot();
                const append = offset > 0;
                const newList = append ? [...slot.list, ...list] : list;

                state.byPostId[postId] = {
                    ...slot,
                    list: newList,
                    count,
                    limit,
                    offset,
                    loading: false,
                    loadingMore: false,
                    hasMore: newList.length < count,
                };
            })
            .addCase(fetchComments.rejected, (state, action) => {
                const {postId, offset = 0} = action.meta?.arg || {};
                if (!postId) return;
                const slot = state.byPostId[postId] ?? initialSlot();
                state.byPostId[postId] = {
                    ...slot,
                    loading: offset === 0 ? false : slot.loading,
                    loadingMore: offset > 0 ? false : slot.loadingMore,
                };
            })

            .addCase(addComment.fulfilled, (state, action) => {
                const {postId, comment} = action.payload;
                const slot = state.byPostId[postId] ?? initialSlot();
                const list = [comment, ...slot.list];
                const count = (slot.count ?? 0) + 1;
                state.byPostId[postId] = {
                    ...slot,
                    list,
                    count,
                    hasMore: list.length < count,
                };
            })

            .addCase(deleteComment.fulfilled, (state, action) => {
                const {id, postId} = action.payload;
                const slot = state.byPostId[postId];
                if (!slot) return;
                const list = slot.list.filter((c) => c.id !== id);
                const count = Math.max(0, slot.count - 1);
                state.byPostId[postId] = {
                    ...slot,
                    list,
                    count,
                    hasMore: list.length < count,
                };
            })

            .addCase(updateComment.fulfilled, (state, action) => {
                const { postId, comment } = action.payload;
                const slot = state.byPostId[postId] ?? initialSlot();
                const idx = slot.list.findIndex(c => c.id === comment.id);
                if (idx !== -1) {
                    slot.list[idx] = { ...slot.list[idx], ...comment };
                }
                state.byPostId[postId] = slot;
            });
    },
});

export default commentsSlice.reducer;
