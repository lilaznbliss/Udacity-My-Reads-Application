import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'
import { Link, Route } from 'react-router-dom'

class BooksApp extends React.Component {
  //different states that the books can be in, which will help determine where the books will be visualized
  state = {
    //currentlyReading array of book objects with the details of each book
    currentlyReading: [],
    //wantToRead array of book objects with the details of each book
    wantToRead: [],
    //read array of book objects with the details of each book
    read: [],
    //none is for books that are not displayed on a shelf
    none: [],
    //searchResults is an array for all the searchResults
    searchResults: []
  }

  //React code that creates all the html tags used to display each book and all necessary details
  bookElement(book, index) {
    return React.createElement('li', {key: book.title + index},
      React.createElement('div', {className: 'book'},
        React.createElement('div', {className: 'book-top'},
          React.createElement('div', {className: 'book-cover', style: {width: 128, height: 193, backgroundImage: book.imageLinks ? 'url(' + book.imageLinks.thumbnail + ')' : ''}}, null),
          React.createElement('div', {className: 'book-shelf-changer'},
            React.createElement('select', {value: book.shelf, onChange: (event) => this.moveBook(event, book)},
              React.createElement('option', {value: 'move', disabled: {}}, 'Move to...'),
              React.createElement('option', {value: 'currentlyReading'}, 'Currently Reading'),
              React.createElement('option', {value: 'wantToRead'}, 'Want to Read'),
              React.createElement('option', {value: 'read'}, 'Read'),
              React.createElement('option', {value: 'none'}, 'None')
            )
          )
        ),
        React.createElement('div', {className: 'book-title'}, book.title),
        React.createElement('div', {className: 'book-authors'}, book.authors ? book.authors.reduce(this.authorListReducer) : '')
      )
    );
  }

  //converts the array of author names into a comma separated sting
  authorListReducer(authorList, author) {
    return authorList + ", " + author
  }

  //function that adds a book to selected shelf
  addBookToShelf(book, shelf) {
    let shelfUpdate;

    switch(shelf) {
      case 'currentlyReading':
        shelfUpdate = this.state.currentlyReading;
        break;
      case 'wantToRead':
        shelfUpdate = this.state.wantToRead;
        break;
      case 'read':
        shelfUpdate = this.state.read;
        break;
      case 'none':
        shelfUpdate = this.state.none;
        break;
      default:
        break;
      }

    //adds the book to the array of the selected shelf
    if (shelfUpdate) {
      shelfUpdate.push(book);
    }

    //switch that updates the selected shelf array in state with the reflected change
    switch(shelf) {
      case 'currentlyReading':
        this.setState({currentlyReading: shelfUpdate});
        break;
      case 'wantToRead':
      this.setState({wantToRead: shelfUpdate});
        break;
      case 'read':
      this.setState({read: shelfUpdate});
        break;
      case 'none':
      this.setState({none: shelfUpdate});
        break;
      default:
        break;
      }
  }

  //removes the moved book from the original array/shelf
  removeBookFromShelf(book, shelf) {
    let shelfUpdate;

    //switch that reads the selected shelf from state
    switch(shelf) {
      case 'currentlyReading':
        shelfUpdate = this.state.currentlyReading;
        break;
      case 'wantToRead':
        shelfUpdate = this.state.wantToRead;
        break;
      case 'read':
        shelfUpdate = this.state.read;
        break;
      case 'none':
        shelfUpdate = this.state.none;
        break;
      default:
        break;
      }
      //removes the selected book from the shelf
      if (shelfUpdate) {
        shelfUpdate.splice(shelfUpdate.indexOf(book), 1);
      }
      //updates the change in state
      switch(shelf) {
        case 'currentlyReading':
          this.setState({currentlyReading: shelfUpdate});
          break;
        case 'wantToRead':
        this.setState({wantToRead: shelfUpdate});
          break;
        case 'read':
        this.setState({read: shelfUpdate});
          break;
        case 'none':
        this.setState({none: shelfUpdate});
          break;
        default:
          break;
        }
  }
  //function that updates the book with what shelf it should be moved to
  moveBook(e, book) {
    if (book.shelf !== e.target.value) {
      this.removeBookFromShelf(book, book.shelf);
      this.addBookToShelf(book, e.target.value);
    }
    book.shelf = e.target.value;
    BooksAPI.update(book, book.shelf);
  }
  //queries the API for a book
  searchBooks(e) {
    let query = e.target.value.trim();
    if (query) {
      BooksAPI.search(query).then((result) => {
        let books = !result.error ? result : [];
        books = books.map((book) => {return this.shelfChecker(book)});
        this.setState({searchResults: books});
      });
    } else {
      this.setState({searchResults: []});
    }
  }

  //function that checks what shelf the book is on
  shelfChecker(newBook) {
    newBook.shelf = 'none';
    let currentlyReadingCheck = this.state.currentlyReading.map(book => {
      return book.id === newBook.id;
    });
    if (currentlyReadingCheck.includes(true)) {
      newBook.shelf = 'currentlyReading';
    };
    let wantToReadCheck = this.state.wantToRead.map(book => {
      return book.id === newBook.id;
    });
    if (wantToReadCheck.includes(true)) {
      newBook.shelf = 'wantToRead';
    };
    let readCheck = this.state.read.map(book => {
      return book.id === newBook.id;
    });
    if (readCheck.includes(true)) {
      newBook.shelf = 'read';
    }
    return newBook;
  }

  componentDidMount() {
    // get books on load
    BooksAPI.getAll().then((books) => {
      books.forEach((book) => {this.addBookToShelf(book, book.shelf)});
    })
  }

  render() {
    return (
      <div className="app">

        <Route exact path="/" render={() => (
          React.createElement('div', {className: 'list-books'},
            React.createElement('div', {className: 'list-books-title'},
              React.createElement('h1', null, 'MyReads')),
            React.createElement('div', {className: 'list-books-content'},
              React.createElement('div', null,
                React.createElement('div', {className: 'bookshelf'},
                  React.createElement('h2', {className: 'bookshelf-title'}, 'Currently Reading'),
                  React.createElement('div', {className: 'bookshelf-books'},
                    React.createElement('ol', {className: 'books-grid'},
                      this.state.currentlyReading.map((book, index) => {return this.bookElement(book, index)})
                    )
                  )
                ),
                React.createElement('div', {className: 'bookshelf'},
                  React.createElement('h2', {className: 'bookshelf-title'}, 'Want to Read'),
                  React.createElement('div', {className: 'bookshelf-books'},
                    React.createElement('ol', {className: 'books-grid'},
                    this.state.wantToRead.map((book, index) => {return this.bookElement(book, index)})
                    )
                  )
                ),
                React.createElement('div', {className: 'bookshelf'},
                  React.createElement('h2', {className: 'bookshelf-title'}, 'Read'),
                  React.createElement('div', {className: 'bookshelf-books'},
                    React.createElement('ol', {className: 'books-grid'},
                    this.state.read.map((book, index) => {return this.bookElement(book, index)})
                    )
                  )
                )
              )
            ),
            React.createElement('div', {className: 'open-search'},
              <Link to="/search">Add a book</Link>
            )
          )
        )}/>

        <Route exact path="/search" render={() => (

          React.createElement('div', {className: 'search-books'},
            React.createElement('div', {className: 'search-books-bar'},
              <Link className='close-search' to='/' onClick={(event) => {this.setState({searchResults: []})}}>Close</Link>,
              React.createElement('div', {className: 'search-books-input-wrapper'},
                React.createElement('input', {type: 'text', placeholder: 'Search by title or author', onChange: (event) => {this.searchBooks(event)}}, null)
              )
            ),
            React.createElement('div', {className: 'search-books-results'},
              React.createElement('ol', {className: 'books-grid'},
              this.state.searchResults.map((book, index) => {return this.bookElement(book, index)})
              )
            )
          )
        )}/>
      </div>
    )
  }
}

export default BooksApp
