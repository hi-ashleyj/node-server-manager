import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const theme: CustomThemeConfig = {
    name: 'omgboard',
    properties: {
        // =~= Theme Properties =~=
        "--theme-font-family-base": `Roboto, sans-serif`,
        "--theme-font-family-heading": `Comfortaa, sans-serif`,
        "--theme-font-color-base": "0 0 0",
        "--theme-font-color-dark": "255 255 255",
        "--theme-rounded-base": "8px",
        "--theme-rounded-container": "16px",
        "--theme-border-base": "1px",
        // =~= Theme On-X Colors =~=
        "--on-primary": "255 255 255",
        "--on-secondary": "255 255 255",
        "--on-tertiary": "0 0 0",
        "--on-success": "255 255 255",
        "--on-warning": "255 255 255",
        "--on-error": "255 255 255",
        "--on-surface": "255 255 255",
        // =~= Theme Colors  =~=
        // primary | #7700cc
        "--color-primary-50": "235 217 247", // #ebd9f7
        "--color-primary-100": "228 204 245", // #e4ccf5
        "--color-primary-200": "221 191 242", // #ddbff2
        "--color-primary-300": "201 153 235", // #c999eb
        "--color-primary-400": "160 77 219", // #a04ddb
        "--color-primary-500": "119 0 204", // #7700cc
        "--color-primary-600": "107 0 184", // #6b00b8
        "--color-primary-700": "89 0 153", // #590099
        "--color-primary-800": "71 0 122", // #47007a
        "--color-primary-900": "58 0 100", // #3a0064
        // secondary | #db118a
        "--color-secondary-50": "250 219 237", // #fadbed
        "--color-secondary-100": "248 207 232", // #f8cfe8
        "--color-secondary-200": "246 196 226", // #f6c4e2
        "--color-secondary-300": "241 160 208", // #f1a0d0
        "--color-secondary-400": "230 88 173", // #e658ad
        "--color-secondary-500": "219 17 138", // #db118a
        "--color-secondary-600": "197 15 124", // #c50f7c
        "--color-secondary-700": "164 13 104", // #a40d68
        "--color-secondary-800": "131 10 83", // #830a53
        "--color-secondary-900": "107 8 68", // #6b0844
        // tertiary | #0EA5E9
        "--color-tertiary-50": "219 242 252", // #dbf2fc
        "--color-tertiary-100": "207 237 251", // #cfedfb
        "--color-tertiary-200": "195 233 250", // #c3e9fa
        "--color-tertiary-300": "159 219 246", // #9fdbf6
        "--color-tertiary-400": "86 192 240", // #56c0f0
        "--color-tertiary-500": "14 165 233", // #0EA5E9
        "--color-tertiary-600": "13 149 210", // #0d95d2
        "--color-tertiary-700": "11 124 175", // #0b7caf
        "--color-tertiary-800": "8 99 140", // #08638c
        "--color-tertiary-900": "7 81 114", // #075172
        // success | #23a923
        "--color-success-50": "222 242 222", // #def2de
        "--color-success-100": "211 238 211", // #d3eed3
        "--color-success-200": "200 234 200", // #c8eac8
        "--color-success-300": "167 221 167", // #a7dda7
        "--color-success-400": "101 195 101", // #65c365
        "--color-success-500": "35 169 35", // #23a923
        "--color-success-600": "32 152 32", // #209820
        "--color-success-700": "26 127 26", // #1a7f1a
        "--color-success-800": "21 101 21", // #156515
        "--color-success-900": "17 83 17", // #115311
        // warning | #d05706
        "--color-warning-50": "248 230 218", // #f8e6da
        "--color-warning-100": "246 221 205", // #f6ddcd
        "--color-warning-200": "243 213 193", // #f3d5c1
        "--color-warning-300": "236 188 155", // #ecbc9b
        "--color-warning-400": "222 137 81", // #de8951
        "--color-warning-500": "208 87 6", // #d05706
        "--color-warning-600": "187 78 5", // #bb4e05
        "--color-warning-700": "156 65 5", // #9c4105
        "--color-warning-800": "125 52 4", // #7d3404
        "--color-warning-900": "102 43 3", // #662b03
        // error | #aa0000
        "--color-error-50": "242 217 217", // #f2d9d9
        "--color-error-100": "238 204 204", // #eecccc
        "--color-error-200": "234 191 191", // #eabfbf
        "--color-error-300": "221 153 153", // #dd9999
        "--color-error-400": "196 77 77", // #c44d4d
        "--color-error-500": "170 0 0", // #aa0000
        "--color-error-600": "153 0 0", // #990000
        "--color-error-700": "128 0 0", // #800000
        "--color-error-800": "102 0 0", // #660000
        "--color-error-900": "83 0 0", // #530000
        // surface | #44384c
        "--color-surface-50": "227 225 228", // #e3e1e4
        "--color-surface-100": "218 215 219", // #dad7db
        "--color-surface-200": "208 205 210", // #d0cdd2
        "--color-surface-300": "180 175 183", // #b4afb7
        "--color-surface-400": "124 116 130", // #7c7482
        "--color-surface-500": "68 56 76", // #44384c
        "--color-surface-600": "61 50 68", // #3d3244
        "--color-surface-700": "51 42 57", // #332a39
        "--color-surface-800": "41 34 46", // #29222e
        "--color-surface-900": "33 27 37", // #211b25

    }
}