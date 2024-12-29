import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';

interface Props {
  children?: React.ReactElement<any>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<Props> = ( props: Props ) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { setIsAdmin } = props;

  const handleLogin = async () => {
    if (username && password) {
      const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      try {
        const response = await fetch(apiEndpoint + '/login', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            'Authorization': authHeader,
          },
          mode: 'cors',
        });
        const data = await response.json();
        if (data.login === 'OK' && data.isAdmin) {
          localStorage.setItem('authHeader', authHeader);
          setIsAdmin(true);
          navigate(-1);
        } else {
          setIsAdmin(false);
          alert('ログインに失敗しました');
        }
      } catch (error) {
        console.error(error);
        alert('エラーが発生しました');
      }
    } else {
      alert('ユーザー名とパスワードを入力してください');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        ログイン
      </Typography>
      <TextField
        label="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleLogin} sx={{ mt: 2 }}>
        ログイン
      </Button>
    </Box>
  );
};

export default Login;
