document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    const loginMessage = document.getElementById('loginMessage');
    if (response.ok) {
        loginMessage.style.color = 'green';
        loginMessage.textContent = '로그인 성공: ' + data.message;
    } else {
        loginMessage.style.color = 'red';
        loginMessage.textContent = '오류: ' + data.error;
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    const registerMessage = document.getElementById('registerMessage');
    if (response.ok) {
        registerMessage.style.color = 'green';
        registerMessage.textContent = '회원가입 성공: ' + data.message;
    } else {
        registerMessage.style.color = 'red';
        registerMessage.textContent = '오류: ' + data.error;
    }
});