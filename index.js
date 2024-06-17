/**
 * 
 * url 區域----------------------------------------------
 * 
 */
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = [] 

/*
 *其餘變數區域///////////////////// 
*/
const MOVIES_PER_PAGE = 12

/**
 * 
 * 
 * 選取的節點區域--------------------------------------------
 * 
 */
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

/**
 * 
 * 函式區域---------------------------------------------
 * 
*/
function renderMovieList(data) {
  let rawHTML = ''

  // processing
  data.forEach(item => {
    // console.log(item)
    // we need image & title for rendering the dataPanel
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  // amount我們會傳入某筆陣列的長度，例如: movies.length->80
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) // 總共應該分幾頁
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function showMovieModel(id) {
  // 把一些要渲染的節點選出來
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 這個部分是把modal中要渲染的部分先做清空的動作，以免殘留上一個電影資料
  modalTitle.textContent = ''
  modalImage.children[0].src = ''
  modalDate.textContent = 'release date: '
  modalDescription.textContent = ''

  // 抓細部資料，渲染在modal中我們選出的節點
  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      // console.log(data)

      modalTitle.textContent = data.title
      modalImage.children[0].src = POSTER_URL + data.image
      modalDate.textContent = 'release date: ' + data.release_date
      modalDescription.textContent = data.description
    })
    .catch(error => {
      console.log(error)
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  /** 這邊用了||賦值的方法，口語上來說意思是：「如果沒有左邊的那就給我右邊的吧。」
   *  ||在兩邊為true的情況下，會以左邊（先讀到的）為優先，
   *  所以第一次add to favorite時，因為左邊是false（第一次add to favorite我們還沒有在local storage存東西，所以get不到東西，會回傳null，null屬於falsy），右邊是true，所以第一次跑這個函式時，list會等於空陣列。
   * 第二次執行此函式以及第二次以後（在沒有清空local storage的情況下），左邊和右邊都會是true，所以list會等於左邊（優先）的值
   * 左邊的值從localStorage裡被叫出來，一定是JSON格式，要在js操作要先轉換成原生js格式
   * 所以用JSON.parse()將格式轉換
   * */
  let movie = movies.find(movie => movie.id === id)
  /**
   * find()跟filter()很像，但是find()會在內部的cb func回傳true後，保留目前處理到值，就直接停止遍歷了，然後回傳那個目前處理到的值
   * 所以find()只會回傳一個值，是指定遍歷的陣列中第一個符合cb func寫的條件的值，而不是跟filter()一樣是所有符合的值組成的陣列，這點要注意一下。
   * 
   */
  if (list.some(movie => movie.id === id)) {
    /**
     * some()又跟find()很像，一樣只會遍歷陣列一直到cb func第一次回傳true就會停止遍歷，回傳一個值。
     * 不同之處是some()回傳值是一個boolean，true代表指定要遍歷的陣列裡至少有一個符合條件的值；false代表指定要遍歷的陣列裡沒有任何一個符合條件的值
     * 所以find()適合拿來找某個陣列裡我們要的值，如果有會回傳第一個符合條件的值，沒有會回傳undefined
     * 而some()適合拿來確認某個陣列裡是否存在我們要的值
     */
    return alert('此電影已經在收藏清單中！') // 有重複的電影，直接return一個警告訊息，就不會把該電影放到localStorage的favoriteMovies了
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  /**
   * 在localStorage存入一筆資料，也就是list這筆資料。
   * 但因為localStorage雖然是以鍵值對的方式存資料，但左右兩邊都要是字串，所以我們要先把list轉成JSON格式
   * 用JSON.stringify()可以把資料轉成JSON格式
   */
}

function getMoviesByPage(page) {
  // page就是第幾頁，我們就根據page，去slice movies陣列中一部分的資料
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE // 每一頁的第一筆資料
  const endIndex = page * MOVIES_PER_PAGE // 每一頁的最後一筆再下一筆資料，因為slice的第二個參數不包含在內
  return data.slice(startIndex, endIndex)
}

/**
 * 
 * 事件監聽器區域-----------------------------------------------
 * 
 */
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 如果點擊的目標是視覺上的More按鈕
    showMovieModel(parseInt(event.target.dataset.id)) // 執行一個渲染modal的函式
  } else if (event.target.matches('.btn-add-favorite')) {
    // 如果點擊的目標是新增到我的最愛的按鈕（+圖示的按鈕）
    addToFavorite(parseInt(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName.toLowerCase() !== 'a') {
    // 如果不是點擊在分頁按鈕上，就強制return結束onPaginatorClicked的函式
    return
  }
  const page = parseInt(e.target.dataset.page) 
  /* 點擊分頁按鈕，取得該標籤挾帶的data-系列資料，我們會取得裡面的page對應的值
   * 然後會去parseInt把這個值轉成數字，因為data-系列資料都是字串
   * 存到page這個變數裡
  */
  renderMovieList(getMoviesByPage(page)) // 用我們點擊分頁按鈕得到的page，去重新渲染網頁
})

// 此版本是只要在搜尋框輸入關鍵字就會直接渲染畫面，不用按按鈕或enter，清空搜尋框也會render回所有電影的畫面
// searchForm.addEventListener('input', function onSearchForminputted(evt) {
//   console.log(evt)

//   const keyword = evt.target.value.toLowerCase().trim() // searchInput我們input的關鍵字
//   let filterdMovies = movies.filter(movie => {
//     if (movie.title.toLowerCase().includes(keyword)) {
//       return true
//     }
//   })

//   renderMovieList(filterdMovies)
//   console.log(filterdMovies)

// })

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().trim() // 把輸入框我們輸入的東西，處理一下，存成一個變數，.value可以複習一下如果忘記

  // if (!keyword.length) {
  //   // 如果keyword的長度是0，放到if()中是false，所以加!讓它變成true。直觀一點的寫法可以改成if (keyword.length === 0)
  //   return alert('please enter a valid string')
  // }

  // 1. 使用for-of陣列專用迴圈的方法
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     // 爬各個電影的標題，如果跟我們鍵入的keyword相符
  //     filteredMovies.push(movie) // 就把該電影放到filteredMovies陣列中
  //   }
  // }

  // 2. 使用array.filter()方法，只要filter()內部的cb func回傳true，就會把目前處理到的值保留。遍歷完陣列所以元素後，會得到（回傳）一個篩選後的新陣列，我們把filteredMovies重新賦值為這個陣列。
  filteredMovies = movies.filter(movie => {
    return movie.title.toLowerCase().includes(keyword) // .includes()的return是boolean
  })

  if (filteredMovies.length === 0) {
    // 如果篩選的陣列是空陣列，代表沒有符合搜尋內容的電影，那我們就直接終止這個handler，所以return一個警告訊息alert
    return alert(`cannot find movies with keyword: ${keyword}`)
  }

  renderMovieList(getMoviesByPage(1)) // 重新渲染頁面
  renderPaginator(filteredMovies.length)
})

/**
 * 
 * 
 * 實際程式碼區域---------------------------------------------------
 * 
 */
axios.get(INDEX_URL)
  .then(response => {
    let allMovies = response.data.results // 從api取得的一個有80個元素的陣列，是所有電影的資料陣列，用一個變數代表它
    movies.push(...allMovies) // 把取得的80個電影資料一個個放到我們自己設的變數movies裡，也是陣列的形式，這邊教了...的用法
    renderMovieList(getMoviesByPage(1)) // 執行一個渲染頁面的函式，然後開啟網頁會先顯示第一頁的資料
    renderPaginator(movies.length) // 開啟網頁時的分頁器
  })
  .catch(error => {
    console.log(error)
})


















/**
 *
 * 問題區域-------------------------------------------------------------
 *
 */
// console.log(movies) // 問題一: 為什麼movies拿出來就不能做任何操作，例如console.log(movies[0])會顯示undefined？而在axios then裡面就可以繼續操作？我並沒有在此區域另外設一個變數叫movies阿
// 問題一似乎有答案了，剛好前幾天在查callback func的時候，介紹到setTimeOut()的方法，有介紹到執行順序的概念，直接在axios區域外console.log(movies)會是一樣的空陣列，但如果console.log(m0vies)放在抓好資料.then()裡面繼續執行後續動作，或是任何執行順序在axios.get(index_URL).then()之後的區塊中，就是你要的資料。