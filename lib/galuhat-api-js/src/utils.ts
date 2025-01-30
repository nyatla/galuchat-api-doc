/**
 * デバウンス
 * @param func 
 * @param delay 
 * @returns 
 */
export function debounce<T extends (...args: any[]) => void>(
    func: T, 
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

/**
 * スロットリング
 * @param func 
 * @param delay 
 * @returns 
 */
export function throttle<T extends (...args: any[]) => void>(
    func: T, 
    delay: number
): (...args: Parameters<T>) => void {
    let lastExecuted = 0;
    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastExecuted >= delay) {
            lastExecuted = now;
            func(...args);
        }
    };
}