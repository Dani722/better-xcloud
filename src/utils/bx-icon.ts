import iconCadetRight from "@assets/svg/caret-right.svg" with { type: "text" };
import iconCamera from "@assets/svg/camera.svg" with { type: "text" };
import iconController from "@assets/svg/controller.svg" with { type: "text" };
import iconCopy from "@assets/svg/copy.svg" with { type: "text" };
import iconCursorText from "@assets/svg/cursor-text.svg" with { type: "text" };
import iconDisplay from "@assets/svg/display.svg" with { type: "text" };
import iconMouseSettings from "@assets/svg/mouse-settings.svg" with { type: "text" };
import iconMouse from "@assets/svg/mouse.svg" with { type: "text" };
import iconNew from "@assets/svg/new.svg" with { type: "text" };
import iconQuestion from "@assets/svg/question.svg" with { type: "text" };
import iconRefresh from "@assets/svg/refresh.svg" with { type: "text" };
import iconRemotePlay from "@assets/svg/remote-play.svg" with { type: "text" };
import iconStreamSettings from "@assets/svg/stream-settings.svg" with { type: "text" };
import iconStreamStats from "@assets/svg/stream-stats.svg" with { type: "text" };
import iconTrash from "@assets/svg/trash.svg" with { type: "text" };
import iconTouchControlEnable from "@assets/svg/touch-control-enable.svg" with { type: "text" };
import iconTouchControlDisable from "@assets/svg/touch-control-disable.svg" with { type: "text" };

import iconMicrophone from "@assets/svg/microphone.svg" with { type: "text" };
import iconMicrophoneMuted from "@assets/svg/microphone-slash.svg" with { type: "text" };

export const BxIcon = {
    STREAM_SETTINGS: iconStreamSettings,
    STREAM_STATS: iconStreamStats,
    CONTROLLER: iconController,
    DISPLAY: iconDisplay,
    MOUSE: iconMouse,
    MOUSE_SETTINGS: iconMouseSettings,
    NEW: iconNew,
    COPY: iconCopy,
    TRASH: iconTrash,
    CURSOR_TEXT: iconCursorText,
    QUESTION: iconQuestion,
    REFRESH: iconRefresh,

    REMOTE_PLAY: iconRemotePlay,

    CARET_RIGHT: iconCadetRight,
    SCREENSHOT: iconCamera,
    TOUCH_CONTROL_ENABLE: iconTouchControlEnable,
    TOUCH_CONTROL_DISABLE: iconTouchControlDisable,

    MICROPHONE: iconMicrophone,
    MICROPHONE_MUTED: iconMicrophoneMuted,
} as const;