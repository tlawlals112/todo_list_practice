// todo-frontend/src/app/EmotionCache.tsx
'use client'; // 클라이언트 컴포넌트임을 명시

import * as React from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider as DefaultCacheProvider } from '@emotion/react';
import type { EmotionCache, EmotionCacheProviderProps } from '@emotion/react';

// Next.js App Router와 MUI SSR을 위한 캐시 설정
// 이 코드는 MUI 공식 문서 및 Next.js SSR 가이드라인에 기반합니다.

// 이전에 캐시가 생성되었는지 확인하는 전역 변수 (개발 모드에서 핫 리로딩 시 캐시 중복 생성 방지)
function createEmotionCache() {
  let emotionCache = createCache({ key: 'mui', prepend: true });
  // if (typeof document === 'undefined') { // 서버 사이드 렌더링 시
  //   emotionCache = createCache({ key: 'mui-server', prepend: true });
  // } else { // 클라이언트 사이드 렌더링 시
  //   emotionCache = createCache({ key: 'mui-client', prepend: true });
  // }
  // Next.js 13+ App Router에서는 하나의 캐시 인스턴스로 충분하다고 합니다.
  return emotionCache;
}

let emotionCache: EmotionCache | undefined = undefined;

export default function CacheProvider(props: EmotionCacheProviderProps) {
  const { children } = props;
  
  // 캐시 인스턴스가 없으면 새로 생성 (싱글톤 패턴)
  if (!emotionCache) {
    emotionCache = createEmotionCache();
  }

  // 서버에서 HTML에 스타일을 주입하기 위해 useServerInsertedHTML 훅 사용
  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${emotionCache?.key} ${Object.keys(emotionCache?.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(emotionCache?.inserted).join(' '),
        }}
      />
    );
  });

  return <DefaultCacheProvider value={emotionCache}>{children}</DefaultCacheProvider>;
}