import {useNavigate} from 'react-router';
import {renderAvatar} from '../utils/renderAvatarHelper.jsx';
import {isVideoFile, toAbsolute} from '../utils/fileHelper.js';
import SmartVideo from "./SmartVideo.jsx";

export default function PostCard({post, isFeed}) {
    const navigate = useNavigate();

    const goToAuthor = (e) => {
        e?.stopPropagation?.();
        navigate(`/users/${post.author.id}`);
    };

    const file = post?.file;
    const isVideo = isVideoFile(file);
    const src = file?.url ? toAbsolute(file.url) : '';

    return (
        <article className="shadow overflow-hidden bg-white hover:shadow-xl transition-shadow">

            {isFeed && (
                <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    {renderAvatar(post.author, 35, goToAuthor)}
                    <div className="flex flex-col">
                        <div
                            className="font-medium text-gray-900 cursor-pointer hover:text-indigo-700 transition"
                            onClick={goToAuthor}
                        >
                            @{post.author?.username}
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleString()}
                        </div>
                    </div>
                </header>
            )}

            <div className="relative w-full bg-gray-100 group">
                <div className="pt-[100%]"/>

                {src && !isVideo && (
                    <img
                        src={src}
                        alt={post.description || 'post'}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                )}

                {src && isVideo && (
                    <div className="absolute inset-0">
                        <SmartVideo
                            src={src}
                            auto
                            controls={false}
                            loop
                            muted
                            fit="cover"
                            preload="auto"
                            lazy={true}
                        />
                    </div>
                )}

                <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/0 group-hover:bg-black/30">
                    <div className="text-white font-medium text-sm inline-flex items-center gap-1">
                        <i className="fa-regular fa-comment"/>
                        {post.commentsCount ?? 0}
                    </div>
                </div>
            </div>
        </article>
    );
}
