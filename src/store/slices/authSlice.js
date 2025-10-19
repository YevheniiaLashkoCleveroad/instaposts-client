import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from "../../api/axios.js";
import toast from "react-hot-toast";

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({email, password}, thunkAPI) => {
        try {
            const res = await api.post('/api/sessions', {email, password});
            const {accessToken, refreshToken, user} = res.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Successfully logged in!');
            return {accessToken, user};
        } catch (err) {
            toast.error('Login failed!');
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed!');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, thunkAPI) => {
        try {
            await api.delete('/api/sessions');
            toast.success('Successfully logged out!');
        } catch (err) {
            console.warn('Logout API failed:', err.response?.data);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }

    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({username, email, password}, thunkAPI) => {
        try {
            await api.post('/api/users/signup', {username, email, password});

            const loginRes = await api.post('/api/sessions', {email, password});
            const {accessToken, refreshToken, user} = loginRes.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Successfully signed up!');
            return {accessToken, user};
        } catch (err) {
            toast.error('Registration failed! Check your data.');
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, thunkAPI) => {
        try {
            const res = await api.get('/api/users/me');
            localStorage.setItem('user', JSON.stringify(res.data));
            return res.data;
        } catch (err) {
            console.error(err);
            return thunkAPI.rejectWithValue('Failed to fetch user!');
        }
    }
);

const savedUser = (() => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
})();

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
        user: savedUser || null,
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.accessToken;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.error = null;
                state.user = null;
            })

            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.accessToken;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch user!';
                state.user = null;
            });
    }
});

export const {logout} = authSlice.actions;
export default authSlice.reducer;
