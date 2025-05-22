import { authorizedFetch } from '../../utils/auth-fetch.js';
localStorage.setItem('refreshToken', 'f650db55-54df-4607-906e-f944ce6ad085');
const response = await authorizedFetch(
  'http://43.202.211.168:8080/api/quiz/generate',
  {
    method: 'POST',
    body: JSON.stringify({
      category: 'INVESTMENT',
      difficulty: 'EASY',
    }),
  }
);

console.log(response);
