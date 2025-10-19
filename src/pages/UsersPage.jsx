import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {useNavigate, useSearchParams} from "react-router";
import {useEffect, useMemo, useState} from "react";
import Pagination from "../components/Pagination.jsx";
import {fetchBlockedByMe, fetchBlockedMe, fetchMyFollowers, fetchUsers} from "../store/slices/usersSlice.js";
import {getPagination} from "../utils/paginationHelper.js";
import PageHeader from "../components/PageHeader.jsx";
import {renderAvatar} from "../utils/renderAvatarHelper.jsx";
import Select from "react-select";
import {findOption, selectStyles, selectTheme} from "../utils/selectHelper.js";
import SearchInput from "../components/SearchInput.jsx";
import UserListActions from "../components/UserListActions.jsx";

const ORDER_FIELDS = [
    {value: 'username', label: 'Username'},
    {value: 'createdAt', label: 'Created'},
];

const DIRS = [
    {value: 'ASC', label: 'ASC'},
    {value: 'DESC', label: 'DESC'},
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50].map(n => ({value: n, label: `${n} per page`}));

export default function UsersPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {list, count, listLoading} = useSelector(s => s.users);

    const [searchParams, setSearchParams] = useSearchParams();

    const limit = Number(searchParams.get('limit') || 10);
    const offset = Number(searchParams.get('offset') || 0);
    const orderBy = searchParams.get('orderBy') || 'username';
    const orderDirection = searchParams.get('orderDirection') || 'ASC';
    const queryParam = searchParams.get('query') || '';

    const [query, setQuery] = useState(queryParam);

    const followerIds = useSelector(
        s => (s.users.followers.list ?? []).map(u => u.id),
        shallowEqual
    );

    const followersIdSet = useMemo(() => new Set(followerIds), [followerIds]);

    useEffect(() => {
        const params = {limit, offset, orderBy, orderDirection, query: queryParam || undefined};
        dispatch(fetchUsers(params));
    }, [dispatch, limit, offset, orderBy, orderDirection, queryParam]);

    useEffect(() => {
        const t = setTimeout(() => {
            const next = new URLSearchParams(searchParams);
            const prevQuery = next.get('query') || '';
            if (prevQuery !== query) {
                if (query) next.set('query', query); else next.delete('query');
                next.set('offset', '0');
                setSearchParams(next, {replace: true});
            }
        }, 400);
        return () => clearTimeout(t);
    }, [query, setSearchParams]);

    useEffect(() => {
        dispatch(fetchBlockedByMe());
        dispatch(fetchBlockedMe());
        dispatch(fetchMyFollowers({offset: 0}));
    }, [dispatch]);

    const {pages, currentPage, totalPages} = useMemo(() => (
        getPagination({total: count, limit, offset})
    ), [count, limit, offset]);

    const onPageChange = (page) => {
        const next = new URLSearchParams(searchParams);
        next.set('offset', String((page - 1) * limit));
        setSearchParams(next, {replace: true});
    };

    const onOrderByChange = (opt) => {
        const next = new URLSearchParams(searchParams);
        next.set('orderBy', opt?.value ?? 'username');
        setSearchParams(next, {replace: true});
    };

    const onOrderDirChange = (opt) => {
        const next = new URLSearchParams(searchParams);
        next.set('orderDirection', opt?.value ?? 'ASC');
        setSearchParams(next, {replace: true});
    };

    const onLimitChange = (opt) => {
        const next = new URLSearchParams(searchParams);
        const newLimit = Number(opt?.value ?? 10);
        next.set('limit', String(newLimit));
        next.set('offset', '0');
        setSearchParams(next, {replace: true});
    };

    return (
        <>
            <PageHeader>
                <img src="/title-font-logo.png" alt="Logo" className="h-16 md:h-20 mt-40 md:mt-30"/>
                <h1 className="w-full text-center text-accent text-gray-900 text-2xl md:text-3xl">
                    Share Your Mind!
                </h1>
            </PageHeader>
            <div className="px-4 py-6 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search users..."
                        className="w-full md:max-w-64 max-w-full"
                    />

                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <Select
                            className="w-full md:w-36"
                            classNamePrefix="rs"
                            options={ORDER_FIELDS}
                            value={findOption(ORDER_FIELDS, orderBy)}
                            onChange={onOrderByChange}
                            isSearchable={false}
                            styles={selectStyles}
                            theme={selectTheme}
                            placeholder="Order field"
                            menuPortalTarget={document.body}
                        />

                        <Select
                            className="w-full md:w-36"
                            classNamePrefix="rs"
                            options={DIRS}
                            value={findOption(DIRS, orderDirection)}
                            onChange={onOrderDirChange}
                            isSearchable={false}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            placeholder="Order direction"
                            theme={selectTheme}
                        />

                        <Select
                            className="w-full md:w-36"
                            classNamePrefix="rs"
                            options={PAGE_SIZE_OPTIONS}
                            value={findOption(PAGE_SIZE_OPTIONS, limit)}
                            onChange={onLimitChange}
                            isSearchable={false}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            placeholder="Page size"
                            theme={selectTheme}
                        />
                    </div>
                </div>

                <div className="sm:overflow-x-auto overflow-x-hidden">
                    {list.map((u) => (
                        <div key={u.id} className="user-card hover:bg-indigo-50 cursor-pointer"
                             onClick={() => navigate(`/users/${u.id}`)}>
                            <div className="p-3 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0">
                                        {renderAvatar(u, 45)}
                                    </div>


                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="font-medium text-gray-700 truncate">@{u.username}</div>
                                            {followersIdSet.has(u.id) && (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] rounded bg-blue-50 text-blue-700 shrink-0"
                                                    title="This user follows you"
                                                >
                                         <i className="fa-solid fa-user-check text-[8px]"/>
                                         <span className="hidden sm:inline">Follows you</span>
                                       </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                    </div>

                                    <div className="shrink-0 ml-2">
                                        <UserListActions user={u}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!list.length && <div className="text-gray-500 text-center">Looks like there are no users...</div>}

                <Pagination
                    pages={pages}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                />
            </div>
        </>
    );
}
