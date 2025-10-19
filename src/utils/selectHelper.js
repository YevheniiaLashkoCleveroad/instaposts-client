const INDIGO_600 = '#4f46e5';
const INDIGO_500 = '#6366f1';
const INDIGO_300 = '#a5b4fc';
const INDIGO_200 = '#c7d2fe';
const INDIGO_100 = '#e0e7ff';
const INDIGO_50 = '#eef2ff';

const GRAY_900 = '#111827';
const GRAY_400 = '#9ca3af';
const GRAY_300 = '#d1d5db';
const WHITE = '#ffffff';

export const findOption = (opts, v) => opts.find(o => o.value === v) ?? null;

export const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 36,
        borderWidth: 1,
        borderColor: state.isFocused ? GRAY_300 : GRAY_300,
        boxShadow: state.isFocused
            ? `0 0 0 3px rgba(99, 102, 241, 0.35)`
            : 'none',
        '&:hover': {borderColor: GRAY_400},
        transition: 'box-shadow 120ms ease, border-color 120ms ease',
        fontSize: 14,
    }),
    valueContainer: (base) => ({...base, padding: '2px 8px'}),
    indicatorsContainer: (base) => ({...base, paddingRight: 6}),
    indicatorSeparator: (base) => ({...base, backgroundColor: '#e5e7eb'}),
    placeholder: (base) => ({...base, color: '#6b7280'}),

    menu: (base) => ({
        ...base,
        marginTop: 4,
        border: `1px solid ${INDIGO_200}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    }),
    menuList: (base) => ({
        ...base,
        paddingTop: 4,
        paddingBottom: 4,
    }),

    option: (base, state) => {
        const isSel = state.isSelected;
        const isFoc = state.isFocused;

        let bg = WHITE;
        let color = GRAY_900;

        if (isSel) {
            bg = INDIGO_500;
            color = WHITE;
        } else if (isFoc) {
            bg = INDIGO_50;
            color = GRAY_900;
        }

        return {
            ...base,
            backgroundColor: bg,
            color,
            cursor: 'pointer',
            ':active': {
                backgroundColor: isSel ? INDIGO_600 : INDIGO_100,
            },
        };
    },

    menuPortal: (base) => ({...base, zIndex: 9999}),
};

export const selectTheme = (theme) => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary: INDIGO_500,
        primary75: '#818cf8',
        primary50: INDIGO_300,
        primary25: INDIGO_100,
        neutral0: WHITE,
        neutral20: GRAY_300,
        neutral30: GRAY_400,
    },
    spacing: {...theme.spacing, controlHeight: 36, baseUnit: 4},
});
