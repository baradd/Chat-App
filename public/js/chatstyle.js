//@Desc create new group modal
//
var modal = document.getElementById('create-group-modal');

// Get the button that opens the modal
var btn = document.getElementById('group-create-modal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close')[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

///@Des add user to group modal
//
var modalAddUser = document.getElementById('add-user-to-group-modal');

// Get the button that opens the modal
var btn = document.getElementById('add-user-to-group-btn');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close')[1];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modalAddUser.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modalAddUser.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modalAddUser) {
    modalAddUser.style.display = 'none';
  }
};

//image modal
let messageImageModal = document.getElementById('message-image-modal');

function enlargeImage(img) {
  console.log(img);
  var modalImg = document.getElementById('img01');
  messageImageModal.style.display = 'block';
  modalImg.src = img.src;
}
document.querySelectorAll('.close-image')[0].addEventListener('click', () => {
  messageImageModal.style.display = 'none';
});
