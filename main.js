// Kumpulan konstanta untuk key localStorage dan element ID
const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";

// Inisialisasi array books
let books = [];

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });

  // Load data from localStorage
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const titleInput = document.getElementById("bookFormTitle");
  const authorInput = document.getElementById("bookFormAuthor");
  const yearInput = document.getElementById("bookFormYear");
  const isCompleteInput = document.getElementById("bookFormIsComplete");

  const id = Number(new Date());
  const title = titleInput.value;
  const author = authorInput.value;
  const year = parseInt(yearInput.value);
  const isComplete = isCompleteInput.checked;

  const bookObject = {
    id,
    title,
    author,
    year,
    isComplete,
  };

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  // Reset form
  titleInput.value = "";
  authorInput.value = "";
  yearInput.value = "";
  isCompleteInput.checked = false;
}

function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const bookList = document.querySelectorAll('[data-testid="bookItem"]');

  bookList.forEach((book) => {
    const title = book
      .querySelector('[data-testid="bookItemTitle"]')
      .textContent.toLowerCase();
    if (title.includes(searchTitle)) {
      book.style.display = "block";
    } else {
      book.style.display = "none";
    }
  });
}

function makeBook(bookObject) {
  const bookItem = document.createElement("div");
  bookItem.setAttribute("data-testid", "bookItem");
  bookItem.setAttribute("data-bookid", bookObject.id);

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.innerText = `Penulis: ${bookObject.author}`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement("div");

  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  toggleButton.innerText = bookObject.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  toggleButton.addEventListener("click", () => {
    toggleBookStatus(bookObject.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus buku";
  deleteButton.addEventListener("click", () => {
    deleteBook(bookObject.id);
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit buku";
  editButton.addEventListener("click", () => {
    editBook(bookObject.id);
  });

  buttonContainer.append(toggleButton, deleteButton, editButton);
  bookItem.append(title, author, year, buttonContainer);

  return bookItem;
}

function toggleBookStatus(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);
  if (bookTarget) {
    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function deleteBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function editBook(bookId) {
  const book = books.find((book) => book.id === bookId);
  if (book) {
    document.getElementById("bookFormTitle").value = book.title;
    document.getElementById("bookFormAuthor").value = book.author;
    document.getElementById("bookFormYear").value = book.year;
    document.getElementById("bookFormIsComplete").checked = book.isComplete;

    // Delete the existing book
    deleteBook(bookId);
  }
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Clear book lists
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books = data;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
