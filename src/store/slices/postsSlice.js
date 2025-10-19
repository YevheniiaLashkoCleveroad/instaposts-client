import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from "react-hot-toast";

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (params, {rejectWithValue}) => {
        try {
            const res = await api.get('/api/posts', {params});
            const list =
                res.data?.data ?? res.data?.rows ?? res.data?.items ??
                (Array.isArray(res.data) ? res.data : []);
            const count = Number(res.data?.count ?? res.data?.total ?? 0);
            return {...params, list, count};
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to load posts';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const fetchPostById = createAsyncThunk(
    'posts/fetchPostById',
    async (id, {rejectWithValue}) => {
        try {
            const res = await api.get(`/api/posts/${id}`);
            return res.data;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to load post';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({id, description}, {rejectWithValue}) => {
        try {
            const res = await api.put(`/api/posts/${id}`, {description});
            toast.success('Post successfully updated');
            return res.data;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to update post';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (id, {rejectWithValue}) => {
        try {
            await api.delete(`/api/posts/${id}`);
            toast.success('Post successfully deleted');
            return id;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to delete post';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const createPost = createAsyncThunk(
    'posts/createPost',
    async ({ file, description, onProgress }, { rejectWithValue }) => {
        try {
            const fd = new FormData();
            fd.append('file', file);
            if (description && description.trim()) fd.append('description', description.trim());

            const res = await api.post('/api/posts', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (!e?.total) return;
                    const pct = Math.round((e.loaded * 100) / e.total);
                    onProgress?.(pct);
                },
            });

            toast.success('Post successfully created');
            return res.data;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to create post';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

const initialState = {
    list: [],
    count: 0,
    loading: false,
    loadingMore: false,
    hasMore: true,
    nextOffset: 0,
    error: null,
    lastQuery: null,
    current: null,
    currentLoading: false,
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setCurrentPost(state, action) {
            state.current = action.payload;
        },
        resetPosts(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state, action) => {
                const q = action.meta?.arg || {};
                state.lastQuery = q;
                state.error = null;

                if ((q.offset ?? 0) > 0) {
                    state.loadingMore = true;
                } else {
                    state.loading = true;
                    state.loadingMore = false;
                    state.hasMore = true;
                    state.nextOffset = 0;
                    state.list = [];
                    state.count = 0;
                }
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                const {list: batch = [], count = 0, offset = 0, limit = 8} = action.payload;
                const serverBatchLen = batch.length;

                if (offset === 0) {
                    state.list = batch;
                } else {
                    const seen = new Set(state.list.map(p => p.id));
                    state.list = state.list.concat(batch.filter(p => !seen.has(p.id)));
                }

                state.count = count;
                state.loading = false;
                state.loadingMore = false;

                state.nextOffset = offset + limit;

                state.hasMore = (offset + serverBatchLen) < count && serverBatchLen > 0;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.loadingMore = false;
                state.error = action.payload || 'Failed to load posts';
            })

            .addCase(fetchPostById.pending, (state) => {
                state.currentLoading = true;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.currentLoading = false;
                state.current = action.payload;
            })
            .addCase(fetchPostById.rejected, (state) => {
                state.currentLoading = false;
            })

            .addCase(updatePost.fulfilled, (state, action) => {
                const updated = action.payload;
                state.current = updated;
                const i = state.list.findIndex(p => p.id === updated.id);
                if (i !== -1) state.list[i] = updated;
            })

            .addCase(deletePost.fulfilled, (state, action) => {
                const id = action.payload;
                state.list = state.list.filter(p => p.id !== id);
                state.count = Math.max(0, state.count - 1);
                if (state.current?.id === id) state.current = null;
            })

            .addCase(createPost.fulfilled, (state, action) => {
                const created = action.payload;

                const createdAuthorId =
                    created?.author?.id ?? created?.userId ?? created?.authorId ?? null;

                const scope = state.lastQuery || {};
                const scopeUserId = scope.userId ?? null;

                const matchesScope = !scopeUserId || scopeUserId === createdAuthorId;
                if (!matchesScope) {
                    return;
                }

                state.list = [created, ...state.list.filter(p => p.id !== created.id)];
                state.count += 1;
            })
    },
});


export const {setCurrentPost, resetPosts} = postsSlice.actions;
export default postsSlice.reducer;
