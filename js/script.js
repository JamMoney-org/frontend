document.addEventListener('DOMContentLoaded', function () {
  fetch('/components/navbar.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('navbar').innerHTML = data;

      const protectedRoutes = [
        '/pages/mainpage/mainpage.html',
        '/pages/category/learning_category.html',
        '/pages/mock_invest/mock_invest_list.html',
        '/pages/mypage/mypage.html',
      ];

      document.querySelectorAll('.bottom-nav a').forEach((link) => {
        const path = new URL(link.href).pathname;

        if (protectedRoutes.includes(path)) {
          link.addEventListener('click', function (e) {
            if (!isLoggedIn()) {
              e.preventDefault();
              showToast();
            }
          });
        }
      });
    });
});

function isLoggedIn() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return false;
  return true;
}

function showToast(message = '로그인 후 이용 가능한 기능입니다.') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 1000);
}
