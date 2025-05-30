// todo-frontend/src/theme.ts
import { createTheme } from '@mui/material/styles';

// MUI 기본 테마 생성 (여기서 색상, 타이포그래피 등을 커스터마이징할 수 있습니다)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 예시 색상
    },
    secondary: {
      main: '#dc004e', // 예시 색상
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // 폰트 설정
  },
});

export default theme;