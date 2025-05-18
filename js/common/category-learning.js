// category-learning.js - 학습 카테고리 페이지
import { initializeCategoryEvent } from '../features/category-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("학습 카테고리 페이지 로드");
    initializeCategoryEvent('../pages/learning_list.html');
});
