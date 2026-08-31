const badge = document.querySelector(".hero-badge");

badge.addEventListener("click", function (event) {
  event.preventDefault();
  badge.classList.toggle("is-active");
});

// script.js

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", function () {
  siteNav.classList.toggle("nav-open");
});

const dropdownTrigger = document.querySelector(".has-dropdown > a");
const dropdownParent = document.querySelector(".has-dropdown");
dropdownTrigger.setAttribute("aria-expanded", "false");

dropdownTrigger.addEventListener("click", function (event) {
  event.preventDefault();
  const isOpen = dropdownParent.classList.toggle("is-open");
  dropdownTrigger.setAttribute("aria-expanded", isOpen);
});

document.addEventListener("click", function (event) {
  if (!dropdownParent.contains(event.target)) {
    dropdownParent.classList.remove("is-open");
    dropdownTrigger.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    dropdownParent.classList.remove("is-open");
    dropdownTrigger.setAttribute("aria-expanded", "false");
  }
});

// script.js
 
const themeToggle = document.querySelector(".theme-toggle");
 
themeToggle.addEventListener("click", function () {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const newTheme = isLight ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});
 
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// script.js
 
const form = document.querySelector(".newsletter-form");
const emailInput = document.querySelector("#newsletter-email");
const message = document.querySelector(".newsletter-message");
 
form.addEventListener("submit", function (event) {
  event.preventDefault();
 
  if (emailInput.checkValidity()) {
    message.textContent = "Thanks for subscribing!";
    message.classList.add("is-visible");
    form.reset();
  } else {
    emailInput.reportValidity();
  }
});

// script.js
 
const backToTop = document.querySelector(".back-to-top");
 
window.addEventListener("scroll", function () {
  if (window.scrollY > 400) {
    backToTop.classList.add("is-visible");
  } else {
    backToTop.classList.remove("is-visible");
  }
});
 
backToTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
 
const features = document.querySelectorAll(".feature");
 
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
});
 
features.forEach(function (feature) {
  observer.observe(feature);
});
