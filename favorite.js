/**
 * url區域////////////////////////////////////////////
 */
const BASE_URL = 'https://movie-list.alphacamp.io'
const POSTER_URL = BASE_URL + '/posters/'
const INDEX_URL = BASE_URL + '/api/v1/movies/'

/**
 * 選出的節點區域///////////////////////////////
 */
const dataPanel = document.querySelector('#data-panel')
const movieModalTitle = document.querySelector('#movie-modal-title')
const movieModalImg = document.querySelector('#movie-modal-img')
const movieModalDate = document.querySelector('#movie-modal-date')
const movieModalDescription = document.querySelector('#movie-modal-description')

/**
 * 變數命名區域///////////////////////////////////////
 */
const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

/**
 * 函式區域//////////////////////////////
 */
function renderFavoriteMovie(moviesArr) {
  let rawHTML = ''
  moviesArr.forEach(movie => {
    rawHTML += `
    <div class="col-sm-3 mb-2">
      <div class="card">
        <img src="${POSTER_URL + movie.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
        </div>
        <div class="card-footer">
          <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${movie.id}">more</button>
          <button type="button" class="btn btn-danger btn-remove-favorite" data-id="${movie.id}">x</button>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  movieModalTitle.textContent = ''
  movieModalImg.src = ''
  movieModalDate.textContent = 'release date: '
  movieModalDescription.textContent = ''
  axios.get(INDEX_URL + id)
    .then(response => {
      let movieDetail = response.data.results
      movieModalTitle.textContent = movieDetail.title
      movieModalImg.src = POSTER_URL + movieDetail.image
      movieModalDate.textContent = `release date: ${movieDetail.release_date}`
      movieModalDescription.textContent = movieDetail.description
    })
    .catch(error => {
      console.log('there"s something wrong, can"t render the modal')
  })
}

function removeFromFavorite(id) {
  if (!favoriteMovies.length) return // 嚴謹需求加上的，無論如何我們favoriteMovies一定是一個陣列，如果是空的就停止執行此func
  let removeIndex = favoriteMovies.findIndex(movie => movie.id === id) // 找到要刪除的索引值
  if (removeIndex === -1) return // 嚴謹需求加上的，如果意外的找不到相同的id，也停止執行此func
  favoriteMovies.splice(removeIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))
  renderFavoriteMovie(favoriteMovies)
}

/**
 * eventListener區域//////////////////////////////////
 */
dataPanel.addEventListener('click', function onDataPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(e.target.dataset.id)
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(parseInt(e.target.dataset.id))
  }
})

/**
 * 實際程式碼區域//////////////////////////////////
 */
renderFavoriteMovie(favoriteMovies)



