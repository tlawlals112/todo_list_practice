// todo-frontend/src/app/layout.tsx
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
// import { ThemeProvider } from '@mui/material/styles'; // 더 이상 직접 사용하지 않음
// import theme from '../theme'; // 여기서 직접 임포트하지 않음

import MuiThemeProvider from '../components/MuiThemeProvider'; // 새로 만든 클라이언트 컴포넌트 임포트

export const metadata = {
  title: 'My To-Do App',
  description: 'A simple To-Do list application built with Next.js, TypeScript, and MUI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {/* ThemeProvider 대신 MuiThemeProvider 사용 */}
          <MuiThemeProvider>
            {children}
          </MuiThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}