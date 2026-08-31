
 
const badge = document.querySelector(".hero-badge");
 
badge.addEventListener("click", function (event) {
  event.preventDefault();
  badge.classList.toggle("is-active");
});


