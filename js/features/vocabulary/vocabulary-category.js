// category_vocabulary.js - 단어장 카테고리 페이지
import { initializeCategoryEvent } from '../features/categoryHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("단어장 카테고리 페이지 로드");
    initializeCategoryEvent('../pages/vocabulary_list.html');
});
