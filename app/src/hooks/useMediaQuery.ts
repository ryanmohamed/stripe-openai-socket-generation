import { useEffect, useState } from 'react';

// see web dev simplified article
// https://blog.webdevsimplified.com/2022-03/debounce-vs-throttle/

// ideally we only want to update our state once
// we have a stable screen, meaning we shouldn't call this 
// if the screen is resized rapidly, and instead wait 
// a moment after the last change to avoid unnecessary UI changes

// courtesy of webdevsimplified 
function debounce(cb: CallableFunction, delay = 250) {
    let timeout: any
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        cb(...args)
      }, delay)
    }
}

export default function useMediaQuery (query: string) {
    const mediaMatch: MediaQueryList = window.matchMedia(query);
    const [matches, setMatches] = useState(mediaMatch.matches);
    useEffect(() => {
        // wait 250ms after screen has been resized
        const debouncedSetMatches = debounce((matches: boolean) => {
            setMatches(matches);
        }, 250);
        const handler = (e: MediaQueryListEvent) => debouncedSetMatches(e.matches);
        mediaMatch.addEventListener("change", handler);
        return () => mediaMatch.removeEventListener("change", handler);
    }, [])
    return matches;
};