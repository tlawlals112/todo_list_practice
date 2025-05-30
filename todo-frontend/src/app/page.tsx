// todo-frontend/src/app/page.tsx
"use client"; // 맨 위에 "use client"; 지시자 유지

import { useEffect, useState, useCallback } from 'react'; // useCallback 추가
import Head from 'next/head'; // Head는 App Router에서 다른 방식으로 사용되나, 현재 에러는 아니므로 일단 유지
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit'; // EditIcon은 사용하지 않으므로 삭제

interface Todo {
  id: number;
  description: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // fetchTodos 함수를 useCallback으로 감싸서 최적화
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/todos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err: unknown) { // any 대신 unknown 사용
      let errorMessage = 'Failed to fetch todos: An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = `Failed to fetch todos: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Failed to fetch todos: ${err}`;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]); // fetchTodos는 API_BASE_URL에 의존

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); // fetchTodos를 의존성 배열에 추가

  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newTodo }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedTodo = await response.json();
      setTodos([...todos, addedTodo]);
      setNewTodo('');
      setError(null);
    } catch (err: unknown) { // any 대신 unknown 사용
      let errorMessage = 'Failed to add todo: An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = `Failed to add todo: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Failed to add todo: ${err}`;
      }
      setError(errorMessage);
      console.error(err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (err: unknown) { // any 대신 unknown 사용
      let errorMessage = 'Failed to delete todo: An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = `Failed to delete todo: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Failed to delete todo: ${err}`;
      }
      setError(errorMessage);
      console.error(err);
    }
  };

  const toggleComplete = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
      setError(null);
    } catch (err: unknown) { // any 대신 unknown 사용
      let errorMessage = 'Failed to update todo: An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = `Failed to update todo: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Failed to update todo: ${err}`;
      }
      setError(errorMessage);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Todos...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Head>
        <title>To-Do App</title>
        <meta name="description" content="Simple To-Do list application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Typography variant="h4" component="h1" gutterBottom align="center">
        My To-Do List
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="New To-Do"
          variant="outlined"
          fullWidth
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo();
            }
          }}
        />
        <Button variant="contained" onClick={addTodo} sx={{ minWidth: '100px' }}>
          Add
        </Button>
      </Box>

      <List>
        {todos.map((todo) => (
          <ListItem
            key={todo.id}
            secondaryAction={
              <>
                {/* Edit 기능은 실제 구현에서는 모달 등으로 처리합니다. 여기서는 삭제만 예시 */}
                {/* <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton> */}
                <IconButton edge="end" aria-label="delete" onClick={() => deleteTodo(todo.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              mb: 1,
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <ListItemText
              primary={todo.description}
              onClick={() => toggleComplete(todo.id, todo.completed)}
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
            />
          </ListItem>
        ))}
      </List>
      {todos.length === 0 && !loading && (
        <Typography variant="body1" align="center" color="text.secondary">
          No todos yet. Add one!
        </Typography>
      )}
    </Container>
  );
}
