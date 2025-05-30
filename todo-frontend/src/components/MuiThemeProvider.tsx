// todo-frontend/src/components/MuiThemeProvider.tsx
"use client"; // 이 컴포넌트가 클라이언트 컴포넌트임을 명시

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme'; // 기존에 정의한 테마 임포트

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}