import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import styles from './ScrollArea.module.css';

export type ScrollAreaHandle = {
  scrollToBottom: (smooth?: boolean) => void;
};

type Props = {
  children: ReactNode;
  className?: string;
  jumpLabel?: string;
  stickToBottom?: boolean;
  initialScrollToBottom?: boolean;
  initialScrollKey?: string | number;
};

const NEAR_BOTTOM_PX = 80;
const INITIAL_SCROLL_SETTLE_MS = 50;

const ScrollArea = forwardRef<ScrollAreaHandle, Props>(function ScrollArea(
  {
    children,
    className,
    jumpLabel = 'К последним сообщениям',
    stickToBottom = false,
    initialScrollToBottom = false,
    initialScrollKey,
  },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);
  const stickRef = useRef(stickToBottom);
  const initialScrollDoneRef = useRef<string | number | null>(null);

  stickRef.current = stickToBottom;

  const scrollToBottom = useCallback((smooth = true) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    setShowJump(false);
  }, []);

  useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

  const onScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    setShowJump(!nearBottom);
  }, []);

  useEffect(() => {
    initialScrollDoneRef.current = null;
  }, [initialScrollKey]);

  useEffect(() => {
    if (!initialScrollToBottom || initialScrollKey === undefined) return;
    if (initialScrollDoneRef.current === initialScrollKey) return;

    const el = viewportRef.current;
    if (!el) return;

    let cancelled = false;
    let settleTimer: number | undefined;
    let observer: ResizeObserver | null = null;

    const markDone = () => {
      if (cancelled) return;
      initialScrollDoneRef.current = initialScrollKey;
      observer?.disconnect();
    };

    const scheduleSettle = () => {
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(markDone, INITIAL_SCROLL_SETTLE_MS);
    };

    const doScroll = () => {
      if (cancelled) return;
      scrollToBottom(false);
    };

    doScroll();
    observer = new ResizeObserver(() => {
      doScroll();
      scheduleSettle();
    });
    observer.observe(el);
    scheduleSettle();

    return () => {
      cancelled = true;
      if (settleTimer) window.clearTimeout(settleTimer);
      observer?.disconnect();
    };
  }, [initialScrollToBottom, initialScrollKey, children, scrollToBottom]);

  useEffect(() => {
    if (stickToBottom) scrollToBottom(false);
  }, [children, stickToBottom, scrollToBottom]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !stickRef.current) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (nearBottom) scrollToBottom(true);
  }, [children, scrollToBottom]);

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <div ref={viewportRef} className={styles.viewport} onScroll={onScroll}>
        {children}
      </div>
      {showJump ? (
        <button type="button" className={styles.jumpFab} onClick={() => scrollToBottom(true)}>
          {jumpLabel}
        </button>
      ) : null}
    </div>
  );
});

export default ScrollArea;
