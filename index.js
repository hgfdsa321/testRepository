const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'users'
});

db.connect((err) => {
  if (err) {
    console.error('데이터베이스 연결 오류: ', err);
  } else {
    console.log('MySQL users db연결.');
  }
});

app.use(bodyParser.json());
app.use(express.static('public'));

const JWT_SECRET = 'your_jwt_secret';

app.post('/register', async (req, res) => {
  const { username, password, name, phone, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, password, name, phone, email) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [username, hashedPassword, name, phone, email], (err, results) => {
      if (err) {
          console.error('사용자 생성 실패:', err);
          return res.status(500).json({ error: '사용자 생성 실패' });
      }

      console.log(`새로운 회원 등록: ${username}, 이름: ${name}, 전화번호: ${phone}, 이메일: ${email}`);
      res.status(201).json({ message: '새로운 사용자 생성.' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: '잘못된 아이디 또는 비밀번호' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '잘못된 아이디 또는 비밀번호' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: '로그인 성공', token });
  });
});

app.post('/find-username', (req, res) => {
  const { name, email } = req.body;

  const sql = 'SELECT username FROM users WHERE name = ? AND email = ?';
  db.query(sql, [name, email], (err, results) => {
      if (err) {
          console.error('아이디 찾기 실패:', err);
          return res.status(500).json({ error: '아이디 찾기 실패' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: '일치하는 사용자 정보를 찾을 수 없습니다.' });
      }

      const username = results[0].username;
      res.json({ username });
  });
});


app.post('/find-password', (req, res) => {
    const { username, email } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ? AND email = ?';
    db.query(sql, [username, email], (err, results) => {
        if (err) {
            console.error('비밀번호 찾기 실패:', err);
            return res.status(500).json({ error: '비밀번호 찾기 실패' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: '일치하는 사용자 정보를 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: '계정이 확인되었습니다.' });
    });
});


app.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const sql = 'UPDATE users SET password = ? WHERE username = ?';
        db.query(sql, [hashedPassword, username], (err, results) => {
            if (err) {
                console.error('비밀번호 재설정 실패:', err);
                return res.status(500).json({ error: '비밀번호 재설정 실패' });
            }

            res.status(200).json({ message: '비밀번호가 재설정되었습니다.' });
        });
    } catch (error) {
        console.error('비밀번호 해싱 실패:', error);
        res.status(500).json({ error: '비밀번호 재설정 실패' });
    }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});