import NewsApiService from './js/api';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let isShown = 0;
const newsApiService = new NewsApiService();

refs.searchForm.addEventListener('submit', handleSearch);
refs.loadMoreBtn.addEventListener('click', handleLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(handleLoadMore, options);

function handleSearch(event) {
  event.preventDefault();

  refs.galleryContainer.innerHTML = '';
  newsApiService.query =
    event.currentTarget.elements.searchQuery.value.trim();
  newsApiService.resetPage();

  if (newsApiService.query === '') {
    Notify.warning('Por favor, escribe algo en el buscador');
    return;
  }

  isShown = 0;
  fetchGallery();
  renderGallery(hits);
}

function handleLoadMore() {
  newsApiService.incrementPage();
  fetchGallery();
}

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const result = await newsApiService.fetchGallery();
  const { hits, total } = result;
  isShown += hits.length;

  if (!hits.length) {
    Notify.failure(
      `Lo sentimos, no hay imágenes que coincidan con su consulta de búsqueda. Inténtalo de nuevo.`
    );
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }

  renderGallery(hits);
  isShown += hits.length;

  if (isShown < total) {
    Notify.success(`¡Encontramos ${total} imágenes!`);
    refs.loadMoreBtn.classList.remove('is-hidden');
  }

  if (isShown >= total) {
    Notify.info("Lo sentimos, pero has llegado al final de los resultados de búsqueda.");
  }
}

function renderGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
      }
    )
    .join('');
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}
