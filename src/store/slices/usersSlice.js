import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {fetchCurrentUser, logoutUser} from "./authSlice.js";

export const verifyEmail = createAsyncThunk(
    'users/verifyEmail',
    async (token, {signal, rejectWithValue, dispatch}) => {
        try {
            await api.put('/api/users/verify', {token}, {signal});
            const me = await dispatch(fetchCurrentUser()).unwrap();
            toast.success('Email verified successfully!');
            return me;
        } catch (e) {
            const msg = e.response?.data?.message || 'Verification failed';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const resendVerificationEmail = createAsyncThunk(
    'users/resendVerificationEmail',
    async (_, thunkAPI) => {
        try {
            await api.post('/api/users/resend-verification-email');
            toast.success('Verification email has been sent');
            return true;
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to resend verification email';
            toast.error(msg);
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params, {rejectWithValue}) => {
        try {
            const res = await api.get('/api/users', {params});
            return res.data;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to load users';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchUserById',
    async (id, {rejectWithValue}) => {
        try {
            const res = await api.get(`/api/users/${id}`);
            return res.data;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to load profile';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updateMyProfile = createAsyncThunk(
    'users/updateMyProfile',
    async ({username, bio, avatar}, {rejectWithValue, dispatch}) => {
        try {
            const fd = new FormData();
            if (username != null) fd.append('username', username);
            if (bio != null) fd.append('bio', bio);
            if (avatar) fd.append('avatar', avatar);

            const res = await api.put('/api/users', fd, {
                headers: {'Content-Type': 'multipart/form-data'},
            });

            await dispatch(fetchCurrentUser());
            toast.success('Profile updated');
            return res.data;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const deleteMyAccount = createAsyncThunk(
    'users/deleteMyAccount',
    async (_, {rejectWithValue, dispatch}) => {
        try {
            await api.delete('/api/users');
            toast.success('Account deleted');
            await dispatch(logoutUser());
            return true;
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to delete account';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const followUser = createAsyncThunk(
    'users/followUser',
    async (id, {rejectWithValue}) => {
        try {
            await api.post('/api/users/subscriptions', {id});
            toast.success('You have successfully subscribed');
            return {id};
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to follow';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);
export const unfollowUser = createAsyncThunk(
    'users/unfollowUser',
    async (id, {rejectWithValue}) => {
        try {
            await api.delete('/api/users/subscriptions', {data: {id}});
            toast.success('You have successfully unsubscribed');
            return {id};
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to unfollow';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const blockUser = createAsyncThunk(
    'users/blockUser',
    async (id, {rejectWithValue, dispatch}) => {
        try {
            await api.post('/api/users/blocks', {id});
            await dispatch(fetchUserById(id));
            toast.success('User added to blacklist');
            return {id};
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to block';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);
export const unblockUser = createAsyncThunk(
    'users/unblockUser',
    async (id, {rejectWithValue, dispatch}) => {
        try {
            await api.delete('/api/users/blocks', {data: {id}});
            await dispatch(fetchUserById(id));
            toast.success('User removed from blacklist');
            return {id};
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to unblock';
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const fetchMyFollowers = createAsyncThunk(
    'users/fetchMyFollowers',
    async (params = {}, { rejectWithValue, getState }) => {
        try {
            const meId = getState()?.auth?.user?.id;
            const res = await api.get(`/api/users/${meId}/followers`, { params });
            return { list: res.data?.data ?? [], count: Number(res.data?.count ?? 0), ...params };
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load followers');
        }
    }
);

export const fetchMyFollowing = createAsyncThunk(
    'users/fetchMyFollowing',
    async (params = {}, { rejectWithValue, getState }) => {
        try {
            const meId = getState()?.auth?.user?.id;
            const res = await api.get(`/api/users/${meId}/following`, { params });
            return { list: res.data?.data ?? [], count: Number(res.data?.count ?? 0), ...params };
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load following');
        }
    }
);

export const fetchBlockedMe = createAsyncThunk(
    'users/fetchBlockedMe',
    async (_, {rejectWithValue}) => {
        try {
            const res = await api.get('/api/users/blocked-me');
            return (res.data?.data ?? []).map(u => u.id);
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load blocked-me');
        }
    }
);
export const fetchBlockedByMe = createAsyncThunk(
    'users/fetchBlockedByMe',
    async (_, {rejectWithValue}) => {
        try {
            const res = await api.get('/api/users/blocked-by-me');
            return (res.data?.data ?? []).map(u => u.id);
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load blocked-by-me');
        }
    }
);

export const checkFollowState = createAsyncThunk(
    'users/checkFollowState',
    async ({ id, username }, { rejectWithValue, getState }) => {
        try {
            const meId = getState()?.auth?.user?.id;
            const res = await api.get(`/api/users/${meId}/following`, {
                params: { limit: 100, offset: 0, query: username, orderBy: 'username', orderDirection: 'ASC' }
            });
            const isFollowed = (res.data?.data ?? []).some(u => u.id === id);
            return { id, isFollowed };
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to check follow state');
        }
    }
);

export const fetchBlockedByMeList = createAsyncThunk(
    'users/fetchBlockedByMeList',
    async (params = {}, {rejectWithValue}) => {
        try {
            const res = await api.get('/api/users/blocked-by-me', {
                params: {
                    limit: params.limit ?? 12,
                    offset: params.offset ?? 0,
                    query: params.query ?? '',
                    orderBy: params.orderBy ?? 'username',
                    orderDirection: params.orderDirection ?? 'ASC',
                },
            });
            const list = res.data?.data ?? [];
            const count = Number(res.data?.count ?? 0);
            return {...params, list, count, offset: params.offset ?? 0, limit: params.limit ?? 12};
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load blacklist');
        }
    }
);

export const fetchFollowersByUser = createAsyncThunk(
    'users/fetchFollowersByUser',
    async ({ userId, limit = 16, offset = 0, query = '' }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/users/${userId}/followers`, { params: { limit, offset, query }});
            const list =
                res.data?.data ?? res.data?.rows ?? res.data?.items ??
                (Array.isArray(res.data) ? res.data : []);
            const count = Number(res.data?.count ?? res.data?.total ?? 0);
            return { userId, list, count, limit, offset };
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load followers');
        }
    }
);

export const fetchFollowingByUser = createAsyncThunk(
    'users/fetchFollowingByUser',
    async ({ userId, limit = 16, offset = 0, query = '' }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/users/${userId}/following`, { params: { limit, offset, query }});
            const list =
                res.data?.data ?? res.data?.rows ?? res.data?.items ??
                (Array.isArray(res.data) ? res.data : []);
            const count = Number(res.data?.count ?? res.data?.total ?? 0);
            return { userId, list, count, limit, offset };
        } catch (e) {
            return rejectWithValue(e.response?.data?.message || 'Failed to load following');
        }
    }
);

const initialPaged = { list: [], count: 0, loading: false, hasMore: true, nextOffset: 0 };

const usersSlice = createSlice({
    name: 'users',
    initialState: {
        profile: null,
        profileLoading: false,
        followers: {list: [], count: 0, loading: false},
        following: {list: [], count: 0, loading: false},
        blockedMeIds: [],
        blockedByMeIds: [],
        relationsLoading: false,
        error: null,
        verifying: false,
        list: [],
        count: 0,
        listLoading: false,
        listError: null,
        lastQuery: null,
        blacklist: {
            list: [],
            count: 0,
            loading: false,
            nextOffset: 0,
            hasMore: true,
            lastQuery: {limit: 12, offset: 0, query: ''},
        },
        followersByUser: {},
        followingByUser: {},
    },
    reducers: {
        setProfile(state, action) {
            state.profile = action.payload;
        },
        resetBlacklist(state) {
            state.blacklist = {
                list: [],
                count: 0,
                loading: false,
                nextOffset: 0,
                hasMore: true,
                lastQuery: {limit: 12, offset: 0, query: ''},
            };
        },
    },
    extraReducers: builder => {
        const attachPaged = (state, key, payload, pending) => {
            const { userId, list = [], count = 0, offset = 0, limit = 16 } = payload || {};
            const slot = state[key][userId] ?? { ...initialPaged };
            if (pending) {
                slot.loading = true;
            } else {
                if (offset === 0) {
                    slot.list = list;
                } else {
                    const seen = new Set(slot.list.map(u => u.id));
                    slot.list = slot.list.concat(list.filter(u => !seen.has(u.id)));
                }
                slot.count = count;
                slot.loading = false;
                const serverBatchLen = list.length;
                slot.nextOffset = offset + limit;
                slot.hasMore = (offset + serverBatchLen) < count && serverBatchLen > 0;
            }
            state[key][userId] = slot;
        };

        builder
            .addCase(verifyEmail.pending, (state) => {
                state.verifying = true;
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.verifying = false;
                if (state.profile) state.profile.isVerified = true;
            })
            .addCase(verifyEmail.rejected, (state) => {
                state.verifying = false;
            })
            .addCase(fetchUsers.pending, (state, action) => {
                state.listLoading = true;
                state.listError = null;
                state.lastQuery = action.meta?.arg || null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload?.data || [];
                state.count = action.payload?.count ?? 0;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload || 'Failed to load users';
                state.list = [];
                state.count = 0;
            })
            .addCase(fetchUserById.pending, (state) => {
                state.profileLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.profileLoading = false;
                state.error = action.payload || 'Failed to load profile';
            })

            .addCase(updateMyProfile.fulfilled, (state, action) => {
                if (state.profile && state.profile.id === action.payload.id) {
                    state.profile = action.payload;
                }
            })

            .addCase(followUser.fulfilled, (state) => {
                if (state.profile) {
                    state.profile.isFollowedByMe = true;
                    if (typeof state.profile.subscribersCount === 'number') {
                        state.profile.subscribersCount += 1;
                    }
                }
            })
            .addCase(unfollowUser.fulfilled, (state) => {
                if (state.profile) {
                    state.profile.isFollowedByMe = false;
                    if (typeof state.profile.subscribersCount === 'number') {
                        state.profile.subscribersCount = Math.max(0, state.profile.subscribersCount - 1);
                    }
                }
            })

            .addCase(blockUser.fulfilled, (state, action) => {
                const id = action.payload.id;

                if (!state.blockedByMeIds.includes(id)) state.blockedByMeIds.push(id);

                if (state.profile && state.profile.id === id) {
                    state.profile.blockedByMe = true;
                    if (state.profile.isFollowedByMe) {
                        state.profile.isFollowedByMe = false;
                        if (typeof state.profile.subscribersCount === 'number') {
                            state.profile.subscribersCount = Math.max(0, state.profile.subscribersCount - 1);
                        }
                    }
                }
                state.list = state.list.map(u =>
                    u.id === id ? {...u, blockedByMe: true, isFollowedByMe: false} : u
                );

                const prevFollowersLen = state.followers.list.length;
                state.followers.list = state.followers.list.filter(u => u.id !== id);
                if (state.followers.list.length !== prevFollowersLen) {
                    state.followers.count = Math.max(0, state.followers.count - 1);
                }

                const prevFollowingLen = state.following.list.length;
                state.following.list = state.following.list.filter(u => u.id !== id);
                if (state.following.list.length !== prevFollowingLen) {
                    state.following.count = Math.max(0, state.following.count - 1);
                }
            })
            .addCase(unblockUser.fulfilled, (state, action) => {
                const id = action.payload.id;
                state.blockedByMeIds = state.blockedByMeIds.filter(x => x !== id);
                if (state.profile && state.profile.id === id) {
                    state.profile.blockedByMe = false;
                    state.profile.isFollowedByMe = false;
                }

                state.blacklist.list = state.blacklist.list.filter(u => u.id !== id);
                state.blacklist.count = Math.max(0, state.blacklist.count - 1);
                state.list = state.list.map(u =>
                    u.id === id ? {...u, blockedByMe: false, isFollowedByMe: false} : u
                );
            })

            .addCase(fetchMyFollowers.pending,   (s)=>{ s.followers.loading = true; })
            .addCase(fetchMyFollowers.fulfilled, (s,a)=>{ s.followers.loading=false; s.followers.list=a.payload.list; s.followers.count=a.payload.count; })
            .addCase(fetchMyFollowers.rejected,  (s)=>{ s.followers.loading = false; })

            .addCase(fetchMyFollowing.pending,   (s)=>{ s.following.loading = true; })
            .addCase(fetchMyFollowing.fulfilled, (s,a)=>{ s.following.loading=false; s.following.list=a.payload.list; s.following.count=a.payload.count; })
            .addCase(fetchMyFollowing.rejected,  (s)=>{ s.following.loading = false; })

            .addCase(fetchBlockedMe.fulfilled, (state, action) => {
                state.blockedMeIds = action.payload;
            })
            .addCase(fetchBlockedByMe.fulfilled, (state, action) => {
                state.blockedByMeIds = action.payload;
            })
            .addCase(checkFollowState.fulfilled, (state, action) => {
                const {id, isFollowed} = action.payload;
                if (state.profile && state.profile.id === id) {
                    state.profile.isFollowedByMe = isFollowed;
                }
            })
            .addCase(fetchBlockedByMeList.pending, (state, action) => {
                const q = action.meta?.arg ?? {};
                const offset = q.offset ?? 0;
                state.blacklist.loading = true;
                state.blacklist.lastQuery = {limit: q.limit ?? 12, offset, query: q.query ?? ''};
                if (offset === 0) {
                    state.blacklist.list = [];
                    state.blacklist.count = 0;
                    state.blacklist.nextOffset = 0;
                    state.blacklist.hasMore = true;
                }
            })
            .addCase(fetchBlockedByMeList.fulfilled, (state, action) => {
                const {list: batch = [], count = 0, offset = 0, limit = 12} = action.payload;
                const serverBatchLen = batch.length;

                if (offset === 0) {
                    state.blacklist.list = batch;
                } else {
                    const seen = new Set(state.blacklist.list.map(u => u.id));
                    state.blacklist.list = state.blacklist.list.concat(batch.filter(u => !seen.has(u.id)));
                }

                state.blacklist.count = count;
                state.blacklist.loading = false;
                state.blacklist.nextOffset = offset + limit;
                state.blacklist.hasMore = (offset + serverBatchLen) < count && serverBatchLen > 0;
            })
            .addCase(fetchBlockedByMeList.rejected, (state) => {
                state.blacklist.loading = false;
            })
            .addCase(fetchFollowersByUser.pending,   (s, a) => attachPaged(s, 'followersByUser', a.meta.arg, true))
            .addCase(fetchFollowersByUser.fulfilled, (s, a) => attachPaged(s, 'followersByUser', a.payload))
            .addCase(fetchFollowersByUser.rejected,  (s, a) => {
                const { userId } = a.meta.arg || {};
                if (!userId) return;
                s.followersByUser[userId] = { ...(s.followersByUser[userId] ?? initialPaged), loading: false };
            })

            .addCase(fetchFollowingByUser.pending,   (s, a) => attachPaged(s, 'followingByUser', a.meta.arg, true))
            .addCase(fetchFollowingByUser.fulfilled, (s, a) => attachPaged(s, 'followingByUser', a.payload))
            .addCase(fetchFollowingByUser.rejected,  (s, a) => {
                const { userId } = a.meta.arg || {};
                if (!userId) return;
                s.followingByUser[userId] = { ...(s.followingByUser[userId] ?? initialPaged), loading: false };
            });


    }
});

export const {setProfile} = usersSlice.actions;
export default usersSlice.reducer;
