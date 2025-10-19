import {useState} from 'react';

export default function SearchInput({value, onChange, placeholder = 'Search...', className = '',}) {
    const [focused, setFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>

            {value?.length > 0 && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Clear search"
                    title="Clear"
                >
                    <i className="fa-solid fa-xmark"/>
                </button>
            )}

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full h-9 rounded border border-gray-300 hover:border-gray-400 pl-9 pr-8 text-sm outline-none transition-[box-shadow,border-color] duration-150 bg-white"
                style={{
                    boxShadow: focused ? '0 0 0 3px rgba(99, 102, 241, 0.35)' : 'none',
                }}
            />
        </div>
    );
}
