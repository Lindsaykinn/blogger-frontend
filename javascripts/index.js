let blogs = [];

const baseURL = 'http://localhost:3000'

//access the main div in DOM
function main(){
  return document.getElementById('main');
}
//creating a function to access the DOM node gives you the most updated version of that attribute versus using const or let
function titleInput(){
  return document.getElementById('title')
}

function contentInput(){
  return document.getElementById('content')
}

function authorInput(){
  return document.getElementById('author')
}

function form(){
  return document.getElementById('form')
}

function formLink(){
  return document.getElementById('form-link');
}

function blogsLink(){
  return document.getElementById('blogs-link');
}

//another way to use fetch - using async await, runs from top to bottom
// async function getBlogs(){
//   const resp = await fetch(baseURL + '/blogs')

//   const data = await resp.json();

//   blogs = data

//   renderBlogs();
// }

function getBlogs(){
  //on load, we want to fetch to our back-end(rails api, blogs index, populate main div with blogs) to get all of our blogs
  //get request:
  fetch(baseURL + '/blogs')
  //  console.log(fetchReturn);
  // in order to use fetch, we have to allow it to finish, so we use then
  //This .then is the promise
  .then(function(resp){
    return resp.json();
  })
  //This .then resolves the promise and passes in the data
  .then(function(data){
    blogs = data

    renderBlogs();
  })
}

function resetFormInputs(){
  titleInput().value = "";
  contentInput().value = "";
}

// clears out main div to reset HTML
function resetMain(){
  main().innerHTML = '';
}

//creating template
function formTemplate(){
  return `
  <h3>Create Blog</h3>
  <form id='form'>
    <div class="input-field">
      <label for="title">Title</label>
      <input type="text" name='title' id='title'>
    </div>
    <div class="input-field">
      <label for="author">Author</label>
      <input type="text" name='author' id='author'>
    </div>
    <div class="input-field">
      <label for="content">Content</label>
      <br>
      <textarea name="content" id="content" cols="30" rows="10"></textarea>
    </div>
    <input type="submit" value='Create Blog'>
  </form>
  `
}

function editFormTemplate(blog){
  return `
  <h3>Edit Blog</h3>
  <form id='form' data-id="${blog.id}">
    <div class="input-field">
      <label for="title">Title</label>
      <input type="text" name='title' id='title' value="${blog.title}">
    </div>
    <div class="input-field">
      <label for="content">Content</label>
      <br>
      <textarea name="content" id="content" cols="30" rows="10">${blog.content}</textarea>
    </div>
    <input type="submit" value='Edit Blog'>
  </form>
  `
}

function blogsTemplate(){
  return `
  <h3>List of Blogs</h3>
    <div id='blogs'>
    
    </div>
  `;
}

function renderBlog(blog){
  let div = document.createElement('div');
  let h4 = document.createElement('h4');
  let byAuthor = document.createElement('p');
  let p = document.createElement('p');
  let deleteLink = document.createElement('a');
  let blogsDiv = document.getElementById('blogs');
  let editLink = document.createElement('a');

  editLink.dataset.id = blog.id
  editLink.setAttribute("href", "#")
  editLink.innerText = "Edit" 

  deleteLink.dataset.id = blog.id
  deleteLink.setAttribute("href", "#")
  deleteLink.innerText = "Delete" 

  editLink.addEventListener('click', editBlog)
  deleteLink.addEventListener('click', deleteBlog)

  h4.innerText = blog.title;
  byAuthor.innerText = `By: ${blog.author.name}`;
  p.innerText = blog.content;

  div.appendChild(h4);
  div.appendChild(byAuthor);
  div.appendChild(p);
  div.appendChild(editLink);
  div.appendChild(deleteLink)

  blogsDiv.appendChild(div);

}

function editBlog(e){
  e.preventDefault();
  //find blog
  const id = e.target.dataset.id
  //get the blog
  const blog = blogs.find(function(blog){
    return blog.id == id;
  })

  renderEditForm(blog);
  
}

function renderEditForm(blog){
  resetMain();
  main().innerHTML = editFormTemplate(blog);
  form().addEventListener('submit', submitEditForm); //don't need to invoke the submitForm with () because the eventListener is doing the invoking with 'submit'
}

function submitEditForm(e){
  e.preventDefault();

  let strongParams = {
    blog: {
      title: titleInput().value,
      content: contentInput().value
    }
  }
  const id = e.target.dataset.id;

  fetch(baseURL + "/blogs/" + id, {
    method: "PATCH",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify(strongParams)
  })
  .then(function(resp){
    return resp.json();
  })
  //up to this point, the blog has been updated, but not updated in the main blog array so the below will update the blog in the main blog array (removes the old blog and replaces it with the new updated blog - same object, but updated)
  .then(function(blog){
    //selects the blog out of the array
    let b = blogs.find(function(b){
      return b.id == blog.id
    })
    //gets the index of the blog selected
    let idx = blogs.indexOf(b);
    //updates the index value with the newly updated blog
    blogs[idx] = blog;
    //renders the array of the blogs to page
    renderBlogs();
  })
}

function deleteBlog(e){
  e.preventDefault();

  let id = e.target.dataset.id


  fetch(baseURL + '/blogs/' + id, {
    method: "DELETE"
  })
  .then(function(resp){
    return resp.json();
  })
  .then(function(data){
    blogs = blogs.filter(function(blog){
      return blog.id !== data.id;
    })
    renderBlogs();
  })
}

//`When` part of JS (when we want the form to show up):
function renderForm(){
  resetMain();
  main().innerHTML = formTemplate();
  form().addEventListener('submit', submitForm); //don't need to invoke the submitForm with () because the eventListener is doing the invoking with 'submit'
}

function renderBlogs(){
  resetMain();
  main().innerHTML = blogsTemplate();

  //for every blog that we have, we render it
  blogs.forEach(function(blog){
    //displays each blog
    renderBlog(blog);
  })
}


function submitForm(e){
  e.preventDefault();
  let strongParams = {
    blog: {
      title: titleInput().value,
      content: contentInput().value,
      author_attributes: authorInput().value
    }
  }
  alert('form has been submitted')
  //send data to the back-end via a post request - go to blogs controller to create method
  fetch(baseURL + '/blogs', {
    //this hash represents the strong params from blogs controller
    body: JSON.stringify(strongParams),
    //meta - how we want to send and receive our requests
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  })
    .then(function(resp){
      return resp.json();
    })
    .then(function(blog){
      blogs.push(blog)
      renderBlogs();
    })
  //adding the blogs to our blogs array - this will move to strong params variable ^
  // blogs.push({
  //   title: ,
  //   content: ,
  // })
}

function formLinkEvent(){
  formLink().addEventListener('click', function(e){
    e.preventDefault();

    renderForm();
  });
}

function blogsLinkEvent(){
  blogsLink().addEventListener('click', function(e){
    e.preventDefault();

    renderBlogs();
  })
}

document.addEventListener("DOMContentLoaded", function(){
  // renderBlogs();

  getBlogs();
  renderForm();
  formLinkEvent();
  blogsLinkEvent();
})