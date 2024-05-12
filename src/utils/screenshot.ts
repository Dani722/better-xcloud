import { AppInterface, STATES } from "./global";
import { CE } from "./html";


export class Screenshot {
    static setup() {
        const currentStream = STATES.currentStream;
        if (!currentStream.$screenshotCanvas) {
            currentStream.$screenshotCanvas = CE<HTMLCanvasElement>('canvas', {'class': 'bx-gone'});

            currentStream.screenshotCanvasContext = currentStream.$screenshotCanvas.getContext('2d', {
                alpha: false,
                willReadFrequently: false,
            });
        }
        // document.documentElement.appendChild(currentStream.$screenshotCanvas!);
    }

    static updateCanvasSize(width: number, height: number) {
        const $canvas = STATES.currentStream.$screenshotCanvas;
        if ($canvas) {
            $canvas.width = width;
            $canvas.height = height;
        }
    }

    static updateCanvasFilters(filters: string) {
        STATES.currentStream.screenshotCanvasContext && (STATES.currentStream.screenshotCanvasContext.filter = filters);
    }

    private static onAnimationEnd(e: Event) {
        (e.target as any).classList.remove('bx-taking-screenshot');
    }

    static takeScreenshot(callback?: any) {
        const currentStream = STATES.currentStream;
        const $video = currentStream.$video;
        const $canvas = currentStream.$screenshotCanvas;
        if (!$video || !$canvas) {
            return;
        }

        $video.parentElement?.addEventListener('animationend', this.onAnimationEnd);
        $video.parentElement?.classList.add('bx-taking-screenshot');

        const canvasContext = currentStream.screenshotCanvasContext!;
        canvasContext.drawImage($video, 0, 0, $canvas.width, $canvas.height);

        // Get data URL and pass to parent app
        if (AppInterface) {
            const data = $canvas.toDataURL('image/png').split(';base64,')[1];
            AppInterface.saveScreenshot(currentStream.titleId, data);

            // Free screenshot from memory
            canvasContext.clearRect(0, 0, $canvas.width, $canvas.height);

            callback && callback();
            return;
        }

        $canvas && $canvas.toBlob(blob => {
                // Download screenshot
                const now = +new Date;
                const $anchor = CE<HTMLAnchorElement>('a', {
                        'download': `${currentStream.titleId}-${now}.png`,
                        'href': URL.createObjectURL(blob!),
                    });
                $anchor.click();

                // Free screenshot from memory
                URL.revokeObjectURL($anchor.href);
                canvasContext.clearRect(0, 0, $canvas.width, $canvas.height);

                callback && callback();
            }, 'image/png');
    }
}
