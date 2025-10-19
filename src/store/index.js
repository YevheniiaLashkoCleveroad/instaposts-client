import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import commentsReducer from './slices/commentsSlice';
import postsReducer from './slices/postsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        comments: commentsReducer,
        posts: postsReducer,
    },
});

export default store;
